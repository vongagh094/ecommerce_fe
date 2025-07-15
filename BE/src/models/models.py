from pydantic import BaseModel
from .base import BasicModel
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Boolean
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

    auction_id = Column(String, nullable=False)
    user_id = Column(String, nullable=False)
    bid_amount = Column(Integer, nullable=False)
    bid_time = Column(DateTime)
    is_winning_bid = Column(Boolean, default=False)
    auto_bid_max = Column(Integer)
    status = Column(String)