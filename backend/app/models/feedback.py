from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, JSON, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.core.database import Base

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=True, index=True)
    
    # Feedback content
    subject = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    category = Column(String(50), nullable=False, default="general", index=True)
    
    # Rating (optional)
    rating = Column(Integer, nullable=True)  # 1-5 stars
    
    # Status
    status = Column(String(20), nullable=False, default="pending", index=True)
    
    # Admin response
    admin_response = Column(Text, nullable=True)
    admin_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    responded_at = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", foreign_keys=[user_id], backref="feedback_submitted")
    admin = relationship("User", foreign_keys=[admin_id], backref="feedback_responses")
    order = relationship("Order", backref="feedback")

    def __repr__(self):
        return f"<Feedback(id={self.id}, subject={self.subject}, status={self.status})>"