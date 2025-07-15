from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import redis
# create db connection
SQLALCHEMY_DATABASE_URL = 'postgresql://customer:customer@localhost:5432/ecommerce_db'

#Create engine
engine = create_engine(SQLALCHEMY_DATABASE_URL)

#Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, bind=engine)

#create base clase
Base = declarative_base()

#Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# REDIS

def get_redis():
    r = redis.Redis(host='localhost',port=6379,db=0)
    try:
        yield r
    finally:
        r.close()