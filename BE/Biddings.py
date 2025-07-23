from fastapi import FastAPI,Depends
from src.services.COR import setup_cors
from src.models.models import Bids,BidsDTO,Auction
from src.Repository.database import get_db,get_redis,host_rabbitmq
from sqlalchemy.orm import Session
from rstream import (
    Producer,
    AMQPMessage,
    ConfirmationStatus,
    Consumer,
    MessageContext,
    amqp_decoder,
    ConsumerOffsetSpecification,
    OffsetType)
import json
import time
import uuid
# Use APIRouter instead of FastAPI app
app = FastAPI(
    tags=["bidings"],
    responses={404: {"description": "Not found"}}
)
#set up CORS
setup_cors(app)

#Declare global variable
STREAM_NAME = "bidings_stream"
STREAM_RETENTION = 5000000000
receive_count= 0
MAX_RECEIVE_COUNT = 1


def Udpate_highest_bid_auction_psql(auction_id,new_bid,db:Session):
    try:

        auction = db.query(Auction).filter(Auction.id == auction_id).first()
        if auction:
            if new_bid > (auction.current_highest_bid or 0):
                auction.current_highest_bid = new_bid
                db.commit()
                db.refresh(auction)
                print("Update current_highest_bid for auction table")
            else:
                print("The new bid is less than old one")
        else:
            print("The auction is not exsist")
    except Exception as e:
        print (f'Error Update current highest bid: {e}')
    
def Update_Db(bid_data: dict, db: Session):
    try:
        # Tìm bản ghi đã tồn tại
        existing_bid = db.query(Bids).filter(
            Bids.user_id == bid_data.get("user_id"),
            Bids.auction_id == bid_data.get("auction_id")
        ).first()

        if existing_bid:
            # Update các trường cần thiết
            existing_bid.bid_amount = bid_data.get("bid_amount")
            existing_bid.bid_time = bid_data.get("bid_time")
            existing_bid.is_winning_bid = bid_data.get("is_winning_bid", False)
            existing_bid.auto_bid_max = bid_data.get("auto_bid_max")
            existing_bid.status = bid_data.get("status", "active")
            db.commit()
            db.refresh(existing_bid)
            return existing_bid
        else:
            # Insert mới
            new_bid = Bids()
            new_bid.auction_id = bid_data.get("auction_id")
            new_bid.user_id = bid_data.get("user_id")
            new_bid.bid_amount = bid_data.get("bid_amount")
            new_bid.bid_time = bid_data.get("bid_time")
            new_bid.is_winning_bid = bid_data.get("is_winnign_bid",False)
            new_bid.auto_bid_max = bid_data.get("auto_bid_max")
            new_bid.status =bid_data.get("status","activate")
            db.add(new_bid)
            db.commit()
            db.refresh(new_bid)
            return new_bid
    except Exception as e:
        db.rollback()
        print(f"Error updating database: {e}")
        return None

#Update highest bid in each bidding
def Update_highest_bid_redis(current_bid,auction_id:str,max_retries = 3):
    # Get redis cli
    r = next(get_redis())

    #declare variable
    lock_key = f"auction:{auction_id}:lock"
    highest_bid_key = f"{auction_id}"
    lock_value = str(uuid.uuid4())
    retry = 0
    lock_expire = 5 #seconds

    # Begin check to update
    while retry < max_retries:
        got_lock = r.set(lock_key,lock_value,nx=True,ex=lock_expire)
        if got_lock:
            try:
                #get current highest bid
                highest_bid = r.get(highest_bid_key)
                highest_bid = float(highest_bid) if highest_bid else 0.0

                if current_bid > highest_bid:
                    # public redis channel
                    try:
                        r.publish("bid_updates",json.dumps({
                            "auction_id":auction_id,
                            "highest_bid":current_bid
                        }))
                        print("completed public")
                    except Exception as e:
                        print(f"Error from redis puiblic {e}")
                    print(f'Update highest bid to {current_bid}')

                    # Update highest bid in redis
                    r.set(auction_id,current_bid)

                    return 
                else:
                    print(f"Bid {current_bid} is not higher than current highest {highest_bid}")
                    return False
            finally:
                  if r.get(lock_key) == lock_value.encode():
                    r.delete(lock_key)
            break
        else:
            retry += 1
            print(f"Lock busy, retrying {retry}/{max_retries}...")
            time.sleep(0.2)  # Wait before retry
    print("Failed to acquire lock after retries.")
    return False

# callback function to handle publish confirmation
async def on_publish_confirm(status: ConfirmationStatus):
    if status.is_confirmed:
        return print("publish confirm")
    return print ("on confirm completed")

# Call Back function for consumers
async def call_back(msg:AMQPMessage, message_context:MessageContext):
    db = None
    try:
        data_str = msg.body.decode("utf-8")
        try:
            # Load json from dict
            bid_data = json.loads(data_str)
        except Exception as e:
            print (f"Error decoding json: {e}")
            return
        
        #update Db bid
        db = next(get_db())
        saved_bid = Update_Db(bid_data,db)

        #update auction current highest bid
        if saved_bid:
            Udpate_highest_bid_auction_psql(bid_data.get("auction_id"), 
                                            bid_data.get("bid_amount"),
                                            db)
        #update highest bid on redis
        Update_highest_bid_redis(bid_data.get("bid_amount"),bid_data.get("auction_id"))

        # Send a message to all biders 

    except Exception as e:
        print(f"Error in updating db: {e}")
    finally:
        if db:
            db.close()
        await message_context.consumer.close()
    
    return print("call back complete")
        
# producers to send a bid
@app.post("/sending_bid", tags=["bidings"])
async def sending_bid(bid: BidsDTO):
    try:
        # Create a stream if it doesn't exist
        async with Producer(host_rabbitmq,username="admin",password="admin") as producer:
            await producer.create_stream(STREAM_NAME,exists_ok=True, arguments={"max-length-bytes": STREAM_RETENTION})
            # Get the message from the path
            amqp_meassage = AMQPMessage(
                body=bid.model_dump_json().encode("utf-8")
            )
            await producer.send(
                stream=STREAM_NAME,
                message=amqp_meassage,
                on_publish_confirm=lambda status: on_publish_confirm(status)
            )
    except Exception as e:
        print(f"Error sending bidings: {e}")
        return {"error": "Failed to send bidings"}
    return bid.bid_amount

# API travel the message from the stream 
@app.get("/receiving_bid", tags=["bidings"])
async def receiving_bid():
    global receive_count
    receive_count = 0
    # Create a consumer to receive messages from the stream
    consumer = Consumer(host_rabbitmq, username="admin", password="admin")
    await consumer.create_stream(STREAM_NAME,exists_ok=True,arguments={"max-length-bytes": STREAM_RETENTION})

    # Starting to read message
    try:
        await consumer.start()
        await consumer.subscribe(stream=STREAM_NAME,
                                 callback=call_back,
                                 decoder=amqp_decoder,
                                 offset_specification=ConsumerOffsetSpecification(
                                     OffsetType.LAST    
                                    )
                                 )
        await consumer.run()
    except Exception as e:
        try:
            await consumer.close()
        except Exception as close_error:
            print(f"Error closing consumer: {close_error}")
        print(f"Error receiving bidings: {e}")
        return {"error": "Failed to receive bidings"}
    await consumer.close()
    return {"message": f"Received {receive_count} messages and stopped."}