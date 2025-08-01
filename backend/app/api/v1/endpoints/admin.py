from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.core.security import get_current_admin_user
from app.models.user import User
from app.models.product import Product
from app.models.order import Order
from app.models.feedback import Feedback

router = APIRouter()

@router.get("/dashboard")
async def get_dashboard_stats(
    current_admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Get admin dashboard statistics."""
    
    # Get total counts
    total_users_result = await db.execute(
        select(func.count(User.id)).where(User.is_admin == False)
    )
    total_users = total_users_result.scalar()
    
    total_products_result = await db.execute(
        select(func.count(Product.id)).where(Product.is_active == True)
    )
    total_products = total_products_result.scalar()
    
    total_orders_result = await db.execute(select(func.count(Order.id)))
    total_orders = total_orders_result.scalar()
    
    total_revenue_result = await db.execute(select(func.sum(Order.total)))
    total_revenue = total_revenue_result.scalar() or 0
    
    # Get pending orders
    pending_orders_result = await db.execute(
        select(func.count(Order.id)).where(Order.status == "pending")
    )
    pending_orders = pending_orders_result.scalar()
    
    # Get low stock products
    low_stock_result = await db.execute(
        select(func.count(Product.id)).where(
            Product.is_active == True,
            Product.stock < 10
        )
    )
    low_stock_products = low_stock_result.scalar()
    
    # Get pending feedback
    pending_feedback_result = await db.execute(
        select(func.count(Feedback.id)).where(Feedback.status == "pending")
    )
    pending_feedback = pending_feedback_result.scalar()
    
    # Calculate average order value
    average_order_value = total_revenue / total_orders if total_orders > 0 else 0
    
    return {
        "total_users": total_users,
        "total_products": total_products,
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "pending_orders": pending_orders,
        "low_stock_products": low_stock_products,
        "pending_feedback": pending_feedback,
        "average_order_value": average_order_value
    }

@router.get("/recent-orders")
async def get_recent_orders(
    current_admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Get recent orders for admin dashboard."""
    
    result = await db.execute(
        select(Order)
        .order_by(Order.created_at.desc())
        .limit(10)
    )
    orders = result.scalars().all()
    
    return [
        {
            "id": str(order.id),
            "order_number": order.order_number,
            "total": order.total,
            "status": order.status,
            "created_at": order.created_at
        }
        for order in orders
    ]