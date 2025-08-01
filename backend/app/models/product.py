from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.core.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(255), nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True)
    price = Column(Float, nullable=False)
    original_price = Column(Float, nullable=True)
    image_url = Column(String(500), nullable=False)
    description = Column(Text, nullable=False)
    stock = Column(Integer, nullable=False, default=0)
    unit = Column(String(50), nullable=False)
    featured = Column(Boolean, default=False, index=True)
    discount_percentage = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Indexes for better query performance
    __table_args__ = (
        Index('idx_product_category_active', 'category', 'is_active'),
        Index('idx_product_featured_active', 'featured', 'is_active'),
        Index('idx_product_price', 'price'),
    )

    def __repr__(self):
        return f"<Product(id={self.id}, name={self.name}, category={self.category})>"