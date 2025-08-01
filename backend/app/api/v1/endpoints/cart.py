from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.cart import Cart
from app.models.product import Product
from app.schemas.cart import CartItemCreate, CartItemUpdate, CartResponse, CartItemResponse
from app.schemas.product import ProductResponse
from app.core.exceptions import NotFoundException, ValidationException

router = APIRouter()

async def get_or_create_cart(user_id: str, db: AsyncSession) -> Cart:
    """Get user's cart or create if doesn't exist."""
    result = await db.execute(select(Cart).where(Cart.user_id == user_id))
    cart = result.scalar_one_or_none()
    
    if not cart:
        cart = Cart(user_id=user_id, items=[])
        db.add(cart)
        await db.commit()
        await db.refresh(cart)
    
    return cart

@router.get("/", response_model=CartResponse)
async def get_cart(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user's cart."""
    
    cart = await get_or_create_cart(str(current_user.id), db)
    
    # Get product details for cart items
    cart_items = []
    subtotal = 0
    item_count = 0
    
    for item in cart.items:
        product_result = await db.execute(
            select(Product).where(Product.id == item['product_id'])
        )
        product = product_result.scalar_one_or_none()
        
        if product and product.is_active:
            cart_items.append(CartItemResponse(
                product=ProductResponse.from_orm(product),
                quantity=item['quantity']
            ))
            subtotal += product.price * item['quantity']
            item_count += item['quantity']
    
    return CartResponse(
        id=cart.id,
        user_id=cart.user_id,
        items=cart_items,
        subtotal=subtotal,
        item_count=item_count,
        created_at=cart.created_at,
        updated_at=cart.updated_at
    )

@router.post("/add")
async def add_to_cart(
    item_data: CartItemCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Add item to cart."""
    
    # Check if product exists and is active
    product_result = await db.execute(
        select(Product).where(Product.id == item_data.product_id)
    )
    product = product_result.scalar_one_or_none()
    
    if not product or not product.is_active:
        raise NotFoundException("Product not found")
    
    if product.stock < item_data.quantity:
        raise ValidationException(f"Only {product.stock} items available in stock")
    
    # Get or create cart
    cart = await get_or_create_cart(str(current_user.id), db)
    
    # Check if item already exists in cart
    items = cart.items.copy()
    item_found = False
    
    for i, item in enumerate(items):
        if item['product_id'] == str(item_data.product_id):
            new_quantity = item['quantity'] + item_data.quantity
            if new_quantity > product.stock:
                raise ValidationException(f"Cannot add more items. Only {product.stock} available in stock")
            items[i]['quantity'] = new_quantity
            item_found = True
            break
    
    if not item_found:
        items.append({
            'product_id': str(item_data.product_id),
            'quantity': item_data.quantity
        })
    
    cart.items = items
    await db.commit()
    
    return {"message": "Item added to cart successfully"}

@router.put("/update/{product_id}")
async def update_cart_item(
    product_id: str,
    item_data: CartItemUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update cart item quantity."""
    
    cart = await get_or_create_cart(str(current_user.id), db)
    
    if item_data.quantity == 0:
        # Remove item from cart
        cart.items = [item for item in cart.items if item['product_id'] != product_id]
    else:
        # Check stock availability
        product_result = await db.execute(
            select(Product).where(Product.id == product_id)
        )
        product = product_result.scalar_one_or_none()
        
        if not product or not product.is_active:
            raise NotFoundException("Product not found")
        
        if product.stock < item_data.quantity:
            raise ValidationException(f"Only {product.stock} items available in stock")
        
        # Update quantity
        items = cart.items.copy()
        item_found = False
        
        for i, item in enumerate(items):
            if item['product_id'] == product_id:
                items[i]['quantity'] = item_data.quantity
                item_found = True
                break
        
        if not item_found:
            raise NotFoundException("Item not found in cart")
        
        cart.items = items
    
    await db.commit()
    
    return {"message": "Cart updated successfully"}

@router.delete("/remove/{product_id}")
async def remove_from_cart(
    product_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Remove item from cart."""
    
    cart = await get_or_create_cart(str(current_user.id), db)
    
    # Remove item from cart
    original_length = len(cart.items)
    cart.items = [item for item in cart.items if item['product_id'] != product_id]
    
    if len(cart.items) == original_length:
        raise NotFoundException("Item not found in cart")
    
    await db.commit()
    
    return {"message": "Item removed from cart successfully"}

@router.delete("/clear")
async def clear_cart(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Clear all items from cart."""
    
    cart = await get_or_create_cart(str(current_user.id), db)
    cart.items = []
    await db.commit()
    
    return {"message": "Cart cleared successfully"}