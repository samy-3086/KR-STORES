from pydantic import BaseModel, validator
from typing import Optional
from datetime import datetime
import uuid

class FeedbackBase(BaseModel):
    subject: str
    message: str
    category: str = "general"
    rating: Optional[int] = None
    
    @validator('subject')
    def validate_subject(cls, v):
        if len(v.strip()) < 5:
            raise ValueError('Subject must be at least 5 characters long')
        return v.strip()
    
    @validator('message')
    def validate_message(cls, v):
        if len(v.strip()) < 10:
            raise ValueError('Message must be at least 10 characters long')
        return v.strip()
    
    @validator('category')
    def validate_category(cls, v):
        allowed_categories = ['general', 'product', 'delivery', 'service', 'complaint']
        if v not in allowed_categories:
            raise ValueError(f'Category must be one of: {", ".join(allowed_categories)}')
        return v
    
    @validator('rating')
    def validate_rating(cls, v):
        if v is not None and (v < 1 or v > 5):
            raise ValueError('Rating must be between 1 and 5')
        return v

class FeedbackCreate(FeedbackBase):
    order_id: Optional[uuid.UUID] = None

class FeedbackUpdate(BaseModel):
    status: Optional[str] = None
    admin_response: Optional[str] = None

class FeedbackResponse(FeedbackBase):
    id: uuid.UUID
    user_id: uuid.UUID
    order_id: Optional[uuid.UUID] = None
    status: str
    admin_response: Optional[str] = None
    admin_id: Optional[uuid.UUID] = None
    responded_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class FeedbackListResponse(BaseModel):
    feedback: List[FeedbackResponse]
    total: int
    page: int
    per_page: int
    pages: int

class FeedbackStatsResponse(BaseModel):
    total_feedback: int
    pending_count: int
    resolved_count: int
    average_rating: Optional[float] = None