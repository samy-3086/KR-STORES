from pydantic import BaseModel, validator
from typing import Optional, List
from datetime import datetime
import uuid

class ProductBase(BaseModel):
    name: str
    category: str
    price: float
    original_price: Optional[float] = None
    image_url: str
    description: str
    stock: int
    unit: str
    featured: bool = False

class ProductCreate(ProductBase):
    @validator('name')
    def validate_name(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('Product name must be at least 2 characters long')
        return v.strip()
    
    @validator('category')
    def validate_category(cls, v):
        allowed_categories = ['vegetables', 'fruits', 'spices', 'groceries']
        if v not in allowed_categories:
            raise ValueError(f'Category must be one of: {", ".join(allowed_categories)}')
        return v
    
    @validator('price')
    def validate_price(cls, v):
        if v <= 0:
            raise ValueError('Price must be greater than 0')
        return v
    
    @validator('stock')
    def validate_stock(cls, v):
        if v < 0:
            raise ValueError('Stock cannot be negative')
        return v

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    original_price: Optional[float] = None
    image_url: Optional[str] = None
    description: Optional[str] = None
    stock: Optional[int] = None
    unit: Optional[str] = None
    featured: Optional[bool] = None
    is_active: Optional[bool] = None

class ProductResponse(ProductBase):
    id: uuid.UUID
    discount_percentage: Optional[int] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ProductListResponse(BaseModel):
    products: List[ProductResponse]
    total: int
    page: int
    per_page: int
    pages: int

class ProductSearchQuery(BaseModel):
    search: Optional[str] = None
    category: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    featured: Optional[bool] = None
    page: int = 1
    per_page: int = 12
    sort_by: str = "created_at"
    sort_order: str = "desc"