from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc
from typing import Optional, List
import math
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user, get_current_admin_user
from app.models.user import User
from app.models.order import Order
from app.models.product import Product
from app.models.cart import Cart
from app.schemas.order import (
    OrderCreate, 
    OrderUpdate, 
    OrderResponse, 
    OrderListResponse,
    OrderStatsResponse
)
from app.services.delivery import delivery_service
from app.core.exceptions import NotFoundException, ValidationException

router = APIRouter()

def generate_order_number() -> str:
    """Generate unique order number."""
    timestamp = int(datetime.now().timestamp())
    return f"KR{timestamp}"

@router.post("/", response_model=OrderResponse)
async def create_order(
    order_data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new order."""
    
    # Validate products and calculate totals
    subtotal = 0
    order_items = []
    
    for item in order_data.items:
        product_result = await db.execute(
            select(Product).where(Product.id == item.product_id)
        )
        product = product_result.scalar_one_or_none()
        
        if not product or not product.is_active:
            raise NotFoundException(f"Product not found: {item.product_id}")
        
        if product.stock < item.quantity:
            raise ValidationException(
                f"Insufficient stock for {product.name}. Available: {product.stock}"
            )
        
        item_total = product.price * item.quantity
        subtotal += item_total
        
        order_items.append({
            "product_id": str(product.id),
            "product_name": product.name,
            "product_image": product.image_url,
            "price": product.price,
            "quantity": item.quantity,
            "total": item_total
        })
        
        # Update product stock
        product.stock -= item.quantity
    
    # Calculate delivery fee
    full_address = f"{order_data.delivery_address.street}, {order_data.delivery_address.city}, {order_data.delivery_address.state}, {order_data.delivery_address.pincode}"
    delivery_info = await delivery_service.calculate_delivery_fee(full_address, subtotal)
    
    if not delivery_info["deliverable"]:
        raise ValidationException("Delivery not available to this address")
    
    delivery_fee = delivery_info["fee"]
    total = subtotal + delivery_fee
    
    # Create order
    new_order = Order(
        order_number=generate_order_number(),
        user_id=current_user.id,
        items=order_items,
        subtotal=subtotal,
        delivery_fee=delivery_fee,
        total=total,
        status="pending",
        payment_method=order_data.payment_method,
        payment_status="pending",
        delivery_address=order_data.delivery_address.dict(),
        delivery_date=order_data.delivery_date,
        delivery_time_slot=order_data.delivery_time_slot,
        special_instructions=order_data.special_instructions
    )
    
    db.add(new_order)
    await db.commit()
    await db.refresh(new_order)
    
    # Clear user's cart
    cart_result = await db.execute(select(Cart).where(Cart.user_id == current_user.id))
    cart = cart_result.scalar_one_or_none()
    if cart:
        cart.items = []
        await db.commit()
    
    return OrderResponse.from_orm(new_order)

@router.get("/my-orders", response_model=OrderListResponse)
async def get_my_orders(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(10, ge=1, le=50, description="Items per page"),
    status: Optional[str] = Query(None, description="Filter by status"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current user's orders."""
    
    # Build query
    query = select(Order).where(Order.user_id == current_user.id)
    
    if status:
        query = query.where(Order.status == status)
    
    query = query.order_by(desc(Order.created_at))
    
    # Get total count
    count_query = select(func.count()).select_from(
        query.subquery()
    )
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Apply pagination
    offset = (page - 1) * per_page
    query = query.offset(offset).limit(per_page)
    
    # Execute query
    result = await db.execute(query)
    orders = result.scalars().all()
    
    # Calculate pagination info
    pages = math.ceil(total / per_page)
    
    return OrderListResponse(
        orders=[OrderResponse.from_orm(order) for order in orders],
        total=total,
        page=page,
        per_page=per_page,
        pages=pages
    )

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific order."""
    
    # Check if user is admin or order owner
    query = select(Order).where(Order.id == order_id)
    if not current_user.is_admin:
        query = query.where(Order.user_id == current_user.id)
    
    result = await db.execute(query)
    order = result.scalar_one_or_none()
    
    if not order:
        raise NotFoundException("Order not found")
    
    return OrderResponse.from_orm(order)

# Admin endpoints
@router.get("/", response_model=OrderListResponse)
async def get_all_orders(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=50, description="Items per page"),
    status: Optional[str] = Query(None, description="Filter by status"),
    search: Optional[str] = Query(None, description="Search by order number"),
    current_admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all orders (Admin only)."""
    
    # Build query
    query = select(Order)
    
    if status:
        query = query.where(Order.status == status)
    
    if search:
        query = query.where(Order.order_number.ilike(f"%{search}%"))
    
    query = query.order_by(desc(Order.created_at))
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Apply pagination
    offset = (page - 1) * per_page
    query = query.offset(offset).limit(per_page)
    
    # Execute query
    result = await db.execute(query)
    orders = result.scalars().all()
    
    # Calculate pagination info
    pages = math.ceil(total / per_page)
    
    return OrderListResponse(
        orders=[OrderResponse.from_orm(order) for order in orders],
        total=total,
        page=page,
        per_page=per_page,
        pages=pages
    )

@router.patch("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: str,
    order_update: OrderUpdate,
    current_admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Update order status (Admin only)."""
    
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    
    if not order:
        raise NotFoundException("Order not found")
    
    # Update fields
    if order_update.status:
        order.status = order_update.status
    
    if order_update.payment_status:
        order.payment_status = order_update.payment_status
    
    if order_update.tracking_number:
        order.tracking_number = order_update.tracking_number
    
    await db.commit()
    await db.refresh(order)
    
    return OrderResponse.from_orm(order)

@router.get("/stats/overview", response_model=OrderStatsResponse)
async def get_order_stats(
    current_admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Get order statistics (Admin only)."""
    
    # Get basic stats
    total_orders_result = await db.execute(select(func.count(Order.id)))
    total_orders = total_orders_result.scalar()
    
    total_revenue_result = await db.execute(select(func.sum(Order.total)))
    total_revenue = total_revenue_result.scalar() or 0
    
    pending_orders_result = await db.execute(
        select(func.count(Order.id)).where(Order.status == "pending")
    )
    pending_orders = pending_orders_result.scalar()
    
    completed_orders_result = await db.execute(
        select(func.count(Order.id)).where(Order.status == "delivered")
    )
    completed_orders = completed_orders_result.scalar()
    
    # Calculate average order value
    average_order_value = total_revenue / total_orders if total_orders > 0 else 0
    
    return OrderStatsResponse(
        total_orders=total_orders,
        total_revenue=total_revenue,
        pending_orders=pending_orders,
        completed_orders=completed_orders,
        average_order_value=average_order_value
    )