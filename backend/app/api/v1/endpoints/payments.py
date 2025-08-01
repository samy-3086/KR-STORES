from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import stripe
import razorpay
import hmac
import hashlib
import json

from app.core.database import get_db
from app.core.config import settings
from app.core.security import get_current_user
from app.models.user import User
from app.models.order import Order
from app.core.exceptions import NotFoundException, ValidationException

router = APIRouter()

# Initialize payment gateways
if settings.STRIPE_SECRET_KEY:
    stripe.api_key = settings.STRIPE_SECRET_KEY

if settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET:
    razorpay_client = razorpay.Client(
        auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
    )

@router.post("/create-stripe-payment-intent")
async def create_stripe_payment_intent(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create Stripe payment intent for an order."""
    
    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(status_code=400, detail="Stripe not configured")
    
    # Get order
    result = await db.execute(
        select(Order).where(
            Order.id == order_id,
            Order.user_id == current_user.id
        )
    )
    order = result.scalar_one_or_none()
    
    if not order:
        raise NotFoundException("Order not found")
    
    if order.payment_status != "pending":
        raise ValidationException("Order payment already processed")
    
    try:
        # Create payment intent
        intent = stripe.PaymentIntent.create(
            amount=int(order.total * 100),  # Amount in paise
            currency='inr',
            metadata={
                'order_id': str(order.id),
                'order_number': order.order_number,
                'user_id': str(current_user.id)
            }
        )
        
        return {
            "client_secret": intent.client_secret,
            "payment_intent_id": intent.id
        }
        
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/create-razorpay-order")
async def create_razorpay_order(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create Razorpay order for payment."""
    
    if not (settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET):
        raise HTTPException(status_code=400, detail="Razorpay not configured")
    
    # Get order
    result = await db.execute(
        select(Order).where(
            Order.id == order_id,
            Order.user_id == current_user.id
        )
    )
    order = result.scalar_one_or_none()
    
    if not order:
        raise NotFoundException("Order not found")
    
    if order.payment_status != "pending":
        raise ValidationException("Order payment already processed")
    
    try:
        # Create Razorpay order
        razorpay_order = razorpay_client.order.create({
            'amount': int(order.total * 100),  # Amount in paise
            'currency': 'INR',
            'receipt': order.order_number,
            'notes': {
                'order_id': str(order.id),
                'user_id': str(current_user.id)
            }
        })
        
        return {
            "razorpay_order_id": razorpay_order['id'],
            "amount": razorpay_order['amount'],
            "currency": razorpay_order['currency'],
            "key": settings.RAZORPAY_KEY_ID
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/stripe-webhook")
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """Handle Stripe webhook events."""
    
    if not settings.STRIPE_WEBHOOK_SECRET:
        raise HTTPException(status_code=400, detail="Webhook secret not configured")
    
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle payment success
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        order_id = payment_intent['metadata']['order_id']
        
        # Update order payment status
        result = await db.execute(select(Order).where(Order.id == order_id))
        order = result.scalar_one_or_none()
        
        if order:
            order.payment_status = "completed"
            order.payment_id = payment_intent['id']
            order.status = "confirmed"
            await db.commit()
    
    return {"status": "success"}

@router.post("/razorpay-webhook")
async def razorpay_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """Handle Razorpay webhook events."""
    
    payload = await request.body()
    signature = request.headers.get('x-razorpay-signature')
    
    if not signature:
        raise HTTPException(status_code=400, detail="Missing signature")
    
    # Verify webhook signature
    expected_signature = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    
    if not hmac.compare_digest(signature, expected_signature):
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    try:
        event = json.loads(payload)
        
        # Handle payment success
        if event['event'] == 'payment.captured':
            payment = event['payload']['payment']['entity']
            order_id = payment['notes']['order_id']
            
            # Update order payment status
            result = await db.execute(select(Order).where(Order.id == order_id))
            order = result.scalar_one_or_none()
            
            if order:
                order.payment_status = "completed"
                order.payment_id = payment['id']
                order.status = "confirmed"
                await db.commit()
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")
    
    return {"status": "success"}

@router.post("/confirm-payment")
async def confirm_payment(
    order_id: str,
    payment_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Confirm payment for an order (for COD or manual confirmation)."""
    
    # Get order
    result = await db.execute(
        select(Order).where(
            Order.id == order_id,
            Order.user_id == current_user.id
        )
    )
    order = result.scalar_one_or_none()
    
    if not order:
        raise NotFoundException("Order not found")
    
    # Update payment status
    order.payment_status = "completed"
    order.payment_id = payment_id
    order.status = "confirmed"
    
    await db.commit()
    
    return {"message": "Payment confirmed successfully"}