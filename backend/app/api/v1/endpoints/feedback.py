from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from typing import Optional
import math

from app.core.database import get_db
from app.core.security import get_current_user, get_current_admin_user
from app.models.user import User
from app.models.feedback import Feedback
from app.models.order import Order
from app.schemas.feedback import (
    FeedbackCreate,
    FeedbackUpdate,
    FeedbackResponse,
    FeedbackListResponse,
    FeedbackStatsResponse
)
from app.core.exceptions import NotFoundException, ValidationException

router = APIRouter()

@router.post("/", response_model=FeedbackResponse)
async def submit_feedback(
    feedback_data: FeedbackCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Submit feedback."""
    
    # If order_id is provided, validate it belongs to the user
    if feedback_data.order_id:
        order_result = await db.execute(
            select(Order).where(
                Order.id == feedback_data.order_id,
                Order.user_id == current_user.id
            )
        )
        order = order_result.scalar_one_or_none()
        
        if not order:
            raise NotFoundException("Order not found")
    
    # Create feedback
    new_feedback = Feedback(
        user_id=current_user.id,
        order_id=feedback_data.order_id,
        subject=feedback_data.subject,
        message=feedback_data.message,
        category=feedback_data.category,
        rating=feedback_data.rating,
        status="pending"
    )
    
    db.add(new_feedback)
    await db.commit()
    await db.refresh(new_feedback)
    
    return FeedbackResponse.from_orm(new_feedback)

@router.get("/my-feedback", response_model=FeedbackListResponse)
async def get_my_feedback(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(10, ge=1, le=50, description="Items per page"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current user's feedback."""
    
    # Build query
    query = select(Feedback).where(Feedback.user_id == current_user.id)
    query = query.order_by(desc(Feedback.created_at))
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Apply pagination
    offset = (page - 1) * per_page
    query = query.offset(offset).limit(per_page)
    
    # Execute query
    result = await db.execute(query)
    feedback_list = result.scalars().all()
    
    # Calculate pagination info
    pages = math.ceil(total / per_page)
    
    return FeedbackListResponse(
        feedback=[FeedbackResponse.from_orm(feedback) for feedback in feedback_list],
        total=total,
        page=page,
        per_page=per_page,
        pages=pages
    )

# Admin endpoints
@router.get("/", response_model=FeedbackListResponse)
async def get_all_feedback(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=50, description="Items per page"),
    status: Optional[str] = Query(None, description="Filter by status"),
    category: Optional[str] = Query(None, description="Filter by category"),
    current_admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all feedback (Admin only)."""
    
    # Build query
    query = select(Feedback)
    
    if status:
        query = query.where(Feedback.status == status)
    
    if category:
        query = query.where(Feedback.category == category)
    
    query = query.order_by(desc(Feedback.created_at))
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Apply pagination
    offset = (page - 1) * per_page
    query = query.offset(offset).limit(per_page)
    
    # Execute query
    result = await db.execute(query)
    feedback_list = result.scalars().all()
    
    # Calculate pagination info
    pages = math.ceil(total / per_page)
    
    return FeedbackListResponse(
        feedback=[FeedbackResponse.from_orm(feedback) for feedback in feedback_list],
        total=total,
        page=page,
        per_page=per_page,
        pages=pages
    )

@router.patch("/{feedback_id}", response_model=FeedbackResponse)
async def update_feedback(
    feedback_id: str,
    feedback_update: FeedbackUpdate,
    current_admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Update feedback status and add admin response (Admin only)."""
    
    result = await db.execute(select(Feedback).where(Feedback.id == feedback_id))
    feedback = result.scalar_one_or_none()
    
    if not feedback:
        raise NotFoundException("Feedback not found")
    
    # Update fields
    if feedback_update.status:
        feedback.status = feedback_update.status
    
    if feedback_update.admin_response:
        feedback.admin_response = feedback_update.admin_response
        feedback.admin_id = current_admin.id
        feedback.responded_at = func.now()
    
    await db.commit()
    await db.refresh(feedback)
    
    return FeedbackResponse.from_orm(feedback)

@router.get("/stats/overview", response_model=FeedbackStatsResponse)
async def get_feedback_stats(
    current_admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Get feedback statistics (Admin only)."""
    
    # Get basic stats
    total_feedback_result = await db.execute(select(func.count(Feedback.id)))
    total_feedback = total_feedback_result.scalar()
    
    pending_count_result = await db.execute(
        select(func.count(Feedback.id)).where(Feedback.status == "pending")
    )
    pending_count = pending_count_result.scalar()
    
    resolved_count_result = await db.execute(
        select(func.count(Feedback.id)).where(Feedback.status == "resolved")
    )
    resolved_count = resolved_count_result.scalar()
    
    # Calculate average rating
    avg_rating_result = await db.execute(
        select(func.avg(Feedback.rating)).where(Feedback.rating.isnot(None))
    )
    average_rating = avg_rating_result.scalar()
    
    return FeedbackStatsResponse(
        total_feedback=total_feedback,
        pending_count=pending_count,
        resolved_count=resolved_count,
        average_rating=float(average_rating) if average_rating else None
    )