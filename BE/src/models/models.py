from pydantic import BaseModel
from .base import BasicModel
from sqlalchemy import Column, DateTime, Integer, String, Boolean,ForeignKey

from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

#Bids model for apis
class BidsDTO(BaseModel):
    user_id: str
    auction_id:str
    bid_amount: float
    bid_time: str
    created_at: str

class Bids(BasicModel):
    __tablename__= "bids"

    auction_id = Column(String, ForeignKey("auctions.id"),nullable=False)
    user_id = Column(String, nullable=False)
    bid_amount = Column(Integer, nullable=False)
    bid_time = Column(DateTime)
    is_winning_bid = Column(Boolean, default=False)
    auto_bid_max = Column(Integer)
    status = Column(String)

    # relationship
    auction = relationship("Auction",back_populates="bids")
class Auction(BasicModel):
    __tablename__ = "auctions"

    property_id = Column(Integer, nullable=False)
    check_in_date = Column(DateTime)
    check_out_date = Column(DateTime)
    starting_price =Column(Integer,nullable=False)
    current_highest_bid = Column(Integer, nullable=False)
    bid_increment = Column(Integer)
    minimum_bid =Column(Integer)
    auction_start_time = Column(DateTime)
    auction_end_time =Column(DateTime)
    status = Column(String,default="activate")
    winner_user_id = Column(String)
    total_bids  = Column(Integer)

    #relationship
    bids = relationship("Bids",back_populates="auction")