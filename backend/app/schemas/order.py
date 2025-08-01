from pydantic import BaseModel, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

class OrderItemBase(BaseModel):
    product_id: uuid.UUID
    quantity: int
    price: float

class DeliveryAddress(BaseModel):
    street: str
    city: str
    state: str
    pincode: str
    landmark: Optional[str] = None

class OrderCreate(BaseModel):
    items: List[OrderItemBase]
    delivery_address: DeliveryAddress
    delivery_date: datetime
    delivery_time_slot: str
    payment_method: str
    special_instructions: Optional[str] = None
    
    @validator('delivery_time_slot')
    def validate_time_slot(cls, v):
        allowed_slots = ['9:00-12:00', '12:00-15:00', '15:00-18:00', '18:00-21:00']
        if v not in allowed_slots:
            raise ValueError(f'Time slot must be one of: {", ".join(allowed_slots)}')
        return v
    
    @validator('payment_method')
    def validate_payment_method(cls, v):
        allowed_methods = ['cod', 'online']
        if v not in allowed_methods:
            raise ValueError(f'Payment method must be one of: {", ".join(allowed_methods)}')
        return v

class OrderUpdate(BaseModel):
    status: Optional[str] = None
    payment_status: Optional[str] = None
    tracking_number: Optional[str] = None

class OrderResponse(BaseModel):
    id: uuid.UUID
    order_number: str
    user_id: uuid.UUID
    items: List[Dict[str, Any]]
    subtotal: float
    delivery_fee: float
    total: float
    status: str
    payment_method: str
    payment_status: str
    payment_id: Optional[str] = None
    delivery_address: Dict[str, Any]
    delivery_date: datetime
    delivery_time_slot: str
    special_instructions: Optional[str] = None
    tracking_number: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class OrderListResponse(BaseModel):
    orders: List[OrderResponse]
    total: int
    page: int
    per_page: int
    pages: int

class OrderStatsResponse(BaseModel):
    total_orders: int
    total_revenue: float
    pending_orders: int
    completed_orders: int
    average_order_value: float