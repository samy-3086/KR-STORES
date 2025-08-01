from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.core.database import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    order_number = Column(String(20), unique=True, nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    # Order details
    items = Column(JSON, nullable=False)  # Store order items as JSON
    subtotal = Column(Float, nullable=False)
    delivery_fee = Column(Float, nullable=False, default=0)
    total = Column(Float, nullable=False)
    
    # Status and payment
    status = Column(String(20), nullable=False, default="pending", index=True)
    payment_method = Column(String(20), nullable=False)
    payment_status = Column(String(20), nullable=False, default="pending")
    payment_id = Column(String(255), nullable=True)
    
    # Delivery information
    delivery_address = Column(JSON, nullable=False)
    delivery_date = Column(DateTime(timezone=True), nullable=False)
    delivery_time_slot = Column(String(20), nullable=False)
    special_instructions = Column(Text, nullable=True)
    
    # Tracking
    tracking_number = Column(String(100), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", backref="orders")

    def __repr__(self):
        return f"<Order(id={self.id}, order_number={self.order_number}, status={self.status})>"