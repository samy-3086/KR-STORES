from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import (
    verify_password, 
    get_password_hash, 
    create_access_token, 
    create_refresh_token,
    verify_token,
    get_current_user
)
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, TokenResponse, RefreshTokenRequest, UserResponse
from app.core.exceptions import AuthenticationException, ConflictException

router = APIRouter()
security = HTTPBearer()

@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new user."""
    
    # Check if user already exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise ConflictException("User with this email already exists")
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        name=user_data.name,
        phone=user_data.phone,
        address=user_data.address,
        hashed_password=hashed_password,
        is_active=True,
        is_verified=True  # Auto-verify for now
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    # Create tokens
    access_token = create_access_token(data={"sub": str(new_user.id)})
    refresh_token = create_refresh_token(data={"sub": str(new_user.id)})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.from_orm(new_user)
    )

@router.post("/login", response_model=TokenResponse)
async def login(user_credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    """Authenticate user and return tokens."""
    
    # Find user by email
    result = await db.execute(select(User).where(User.email == user_credentials.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(user_credentials.password, user.hashed_password):
        raise AuthenticationException("Invalid email or password")
    
    if not user.is_active:
        raise AuthenticationException("Account is disabled")
    
    # Create tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.from_orm(user)
    )

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    refresh_data: RefreshTokenRequest, 
    db: AsyncSession = Depends(get_db)
):
    """Refresh access token using refresh token."""
    
    try:
        payload = verify_token(refresh_data.refresh_token, token_type="refresh")
        user_id = payload.get("sub")
        
        if not user_id:
            raise AuthenticationException("Invalid refresh token")
        
        # Get user
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        
        if not user or not user.is_active:
            raise AuthenticationException("User not found or inactive")
        
        # Create new tokens
        access_token = create_access_token(data={"sub": str(user.id)})
        new_refresh_token = create_refresh_token(data={"sub": str(user.id)})
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=new_refresh_token,
            user=UserResponse.from_orm(user)
        )
        
    except Exception:
        raise AuthenticationException("Invalid refresh token")

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information."""
    return UserResponse.from_orm(current_user)

@router.post("/logout")
async def logout():
    """Logout user (client should remove tokens)."""
    return {"message": "Successfully logged out"}