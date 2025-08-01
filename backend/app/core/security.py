from datetime import datetime, timedelta
from typing import Optional, Union
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User
from app.core.exceptions import AuthenticationException

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT token scheme
security = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict) -> str:
    """Create a JWT refresh token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_token(token: str, token_type: str = "access") -> dict:
    """Verify and decode a JWT token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != token_type:
            raise AuthenticationException("Invalid token type")
        return payload
    except JWTError:
        raise AuthenticationException("Invalid token")

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Get the current authenticated user."""
    try:
        payload = verify_token(credentials.credentials)
        user_id: str = payload.get("sub")
        if user_id is None:
            raise AuthenticationException("Invalid token payload")
    except JWTError:
        raise AuthenticationException("Could not validate credentials")
    
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if user is None:
        raise AuthenticationException("User not found")
    
    if not user.is_active:
        raise AuthenticationException("User account is disabled")
    
    return user

async def get_current_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """Get the current authenticated admin user."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

async def create_admin_user():
    """Create the admin user if it doesn't exist."""
    from app.core.database import AsyncSessionLocal
    
    async with AsyncSessionLocal() as db:
        try:
            # Check if admin user exists
            result = await db.execute(
                select(User).where(User.email == settings.ADMIN_EMAIL)
            )
            admin_user = result.scalar_one_or_none()
            
            if not admin_user:
                # Create admin user
                admin_user = User(
                    email=settings.ADMIN_EMAIL,
                    name="KR Admin",
                    phone="+91 98765 43210",
                    address="KR Stores HQ, Mumbai, Maharashtra",
                    hashed_password=get_password_hash(settings.ADMIN_PASSWORD),
                    is_admin=True,
                    is_active=True,
                    is_verified=True
                )
                db.add(admin_user)
                await db.commit()
                print(f"Admin user created: {settings.ADMIN_EMAIL}")
            else:
                print(f"Admin user already exists: {settings.ADMIN_EMAIL}")
                
        except Exception as e:
            print(f"Error creating admin user: {e}")
            await db.rollback()