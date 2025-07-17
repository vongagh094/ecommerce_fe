from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import redis



# server on docker
host_rabbitmq = "rabbitmq"
host_redis = "redis"
host_postgres = "postgres"

# #server on local
# host_rabbitmq = "localhost"
# host_redis = "localhost"
# host_postgres = 'localhost'

# create db connection
SQLALCHEMY_DATABASE_URL = f'postgresql://customer:customer@{host_postgres}:5432/ecommerce_db'

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
    r = redis.Redis(host=host_redis,port=6379,db=0)
    try:
        yield r
    finally:
        r.close()