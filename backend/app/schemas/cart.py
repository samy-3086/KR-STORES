from pydantic import BaseModel, validator
from typing import List, Optional
from datetime import datetime
import uuid

from app.schemas.product import ProductResponse

class CartItemBase(BaseModel):
    product_id: uuid.UUID
    quantity: int
    
    @validator('quantity')
    def validate_quantity(cls, v):
        if v <= 0:
            raise ValueError('Quantity must be greater than 0')
        return v

class CartItemCreate(CartItemBase):
    pass

class CartItemUpdate(BaseModel):
    quantity: int
    
    @validator('quantity')
    def validate_quantity(cls, v):
        if v < 0:
            raise ValueError('Quantity cannot be negative')
        return v

class CartItemResponse(BaseModel):
    product: ProductResponse
    quantity: int

class CartResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    items: List[CartItemResponse]
    subtotal: float
    item_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True