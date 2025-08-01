from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from typing import Optional, List
import math

from app.core.database import get_db
from app.core.security import get_current_admin_user
from app.models.product import Product
from app.models.user import User
from app.schemas.product import (
    ProductCreate, 
    ProductUpdate, 
    ProductResponse, 
    ProductListResponse,
    ProductSearchQuery
)
from app.core.exceptions import NotFoundException

router = APIRouter()

@router.get("/", response_model=ProductListResponse)
async def get_products(
    search: Optional[str] = Query(None, description="Search in product name and description"),
    category: Optional[str] = Query(None, description="Filter by category"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price filter"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price filter"),
    featured: Optional[bool] = Query(None, description="Filter featured products"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(12, ge=1, le=50, description="Items per page"),
    sort_by: str = Query("created_at", description="Sort field"),
    sort_order: str = Query("desc", regex="^(asc|desc)$", description="Sort order"),
    db: AsyncSession = Depends(get_db)
):
    """Get products with filtering, searching, and pagination."""
    
    # Build query
    query = select(Product).where(Product.is_active == True)
    
    # Apply filters
    if search:
        search_filter = or_(
            Product.name.ilike(f"%{search}%"),
            Product.description.ilike(f"%{search}%")
        )
        query = query.where(search_filter)
    
    if category:
        query = query.where(Product.category == category)
    
    if min_price is not None:
        query = query.where(Product.price >= min_price)
    
    if max_price is not None:
        query = query.where(Product.price <= max_price)
    
    if featured is not None:
        query = query.where(Product.featured == featured)
    
    # Apply sorting
    sort_column = getattr(Product, sort_by, Product.created_at)
    if sort_order == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Apply pagination
    offset = (page - 1) * per_page
    query = query.offset(offset).limit(per_page)
    
    # Execute query
    result = await db.execute(query)
    products = result.scalars().all()
    
    # Calculate pagination info
    pages = math.ceil(total / per_page)
    
    return ProductListResponse(
        products=[ProductResponse.from_orm(product) for product in products],
        total=total,
        page=page,
        per_page=per_page,
        pages=pages
    )

@router.get("/featured", response_model=List[ProductResponse])
async def get_featured_products(
    limit: int = Query(8, ge=1, le=20, description="Number of featured products"),
    db: AsyncSession = Depends(get_db)
):
    """Get featured products."""
    
    query = select(Product).where(
        and_(Product.is_active == True, Product.featured == True)
    ).order_by(Product.created_at.desc()).limit(limit)
    
    result = await db.execute(query)
    products = result.scalars().all()
    
    return [ProductResponse.from_orm(product) for product in products]

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str, db: AsyncSession = Depends(get_db)):
    """Get a single product by ID."""
    
    result = await db.execute(
        select(Product).where(
            and_(Product.id == product_id, Product.is_active == True)
        )
    )
    product = result.scalar_one_or_none()
    
    if not product:
        raise NotFoundException("Product not found")
    
    return ProductResponse.from_orm(product)

@router.post("/", response_model=ProductResponse)
async def create_product(
    product_data: ProductCreate,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Create a new product (Admin only)."""
    
    # Calculate discount percentage if original price is provided
    discount_percentage = None
    if product_data.original_price and product_data.original_price > product_data.price:
        discount_percentage = int(
            ((product_data.original_price - product_data.price) / product_data.original_price) * 100
        )
    
    new_product = Product(
        name=product_data.name,
        category=product_data.category,
        price=product_data.price,
        original_price=product_data.original_price,
        image_url=product_data.image_url,
        description=product_data.description,
        stock=product_data.stock,
        unit=product_data.unit,
        featured=product_data.featured,
        discount_percentage=discount_percentage
    )
    
    db.add(new_product)
    await db.commit()
    await db.refresh(new_product)
    
    return ProductResponse.from_orm(new_product)

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    product_data: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Update a product (Admin only)."""
    
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    
    if not product:
        raise NotFoundException("Product not found")
    
    # Update fields
    update_data = product_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)
    
    # Recalculate discount percentage if prices are updated
    if 'price' in update_data or 'original_price' in update_data:
        if product.original_price and product.original_price > product.price:
            product.discount_percentage = int(
                ((product.original_price - product.price) / product.original_price) * 100
            )
        else:
            product.discount_percentage = None
    
    await db.commit()
    await db.refresh(product)
    
    return ProductResponse.from_orm(product)

@router.delete("/{product_id}")
async def delete_product(
    product_id: str,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Soft delete a product (Admin only)."""
    
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    
    if not product:
        raise NotFoundException("Product not found")
    
    product.is_active = False
    await db.commit()
    
    return {"message": "Product deleted successfully"}