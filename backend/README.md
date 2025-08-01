# KR Stores Backend API

A complete FastAPI backend for the KR Stores e-commerce platform with PostgreSQL database, JWT authentication, payment integration, and comprehensive business logic.

## Features

- **FastAPI Framework**: Modern, fast web framework for building APIs
- **PostgreSQL Database**: Robust relational database with SQLAlchemy ORM
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Role-based Access Control**: Admin and user roles with proper permissions
- **Payment Integration**: Stripe and Razorpay payment gateway support
- **Delivery System**: Distance-based delivery fee calculation
- **Order Management**: Complete order lifecycle with status tracking
- **Product Management**: CRUD operations with search and filtering
- **Feedback System**: Customer feedback with admin responses
- **Email Notifications**: Order confirmations and updates
- **API Documentation**: Auto-generated with FastAPI/Swagger

## Tech Stack

- **Backend**: FastAPI, Python 3.9+
- **Database**: PostgreSQL with SQLAlchemy (async)
- **Authentication**: JWT with python-jose
- **Password Hashing**: bcrypt via passlib
- **Payment**: Stripe, Razorpay
- **Email**: SMTP with emails library
- **Caching**: Redis (optional)
- **Migration**: Alembic
- **Testing**: pytest with async support

## Quick Start

### Prerequisites

- Python 3.9+
- PostgreSQL 12+
- Redis (optional, for caching)

### Installation

1. **Clone and setup**:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Environment Configuration**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Database Setup**:
```bash
# Create PostgreSQL database
createdb krstores

# Run migrations
alembic upgrade head

# Seed initial data
python scripts/seed_data.py
```

4. **Start the server**:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API**: http://localhost:8000
- **Documentation**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc

## Environment Variables

### Required Configuration

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/krstores

# JWT Security
SECRET_KEY=your-super-secret-jwt-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Admin Credentials
ADMIN_EMAIL=kr0792505@gmail.com
ADMIN_PASSWORD=vidhya

# CORS
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,https://your-domain.com
```

### Optional Configuration

```env
# Payment Gateways
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@krstores.com

# External Services
GEOCODING_API_KEY=your_opencage_api_key
REDIS_URL=redis://localhost:6379/0
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user info

### Products
- `GET /api/v1/products/` - List products (with filtering)
- `GET /api/v1/products/featured` - Get featured products
- `GET /api/v1/products/{id}` - Get single product
- `POST /api/v1/products/` - Create product (Admin)
- `PUT /api/v1/products/{id}` - Update product (Admin)
- `DELETE /api/v1/products/{id}` - Delete product (Admin)

### Cart
- `GET /api/v1/cart/` - Get user's cart
- `POST /api/v1/cart/add` - Add item to cart
- `PUT /api/v1/cart/update/{product_id}` - Update cart item
- `DELETE /api/v1/cart/remove/{product_id}` - Remove from cart
- `DELETE /api/v1/cart/clear` - Clear cart

### Orders
- `POST /api/v1/orders/` - Create order
- `GET /api/v1/orders/my-orders` - Get user's orders
- `GET /api/v1/orders/{id}` - Get single order
- `GET /api/v1/orders/` - Get all orders (Admin)
- `PATCH /api/v1/orders/{id}/status` - Update order status (Admin)

### Payments
- `POST /api/v1/payments/create-stripe-payment-intent` - Create Stripe payment
- `POST /api/v1/payments/create-razorpay-order` - Create Razorpay order
- `POST /api/v1/payments/stripe-webhook` - Stripe webhook handler
- `POST /api/v1/payments/razorpay-webhook` - Razorpay webhook handler

### Feedback
- `POST /api/v1/feedback/` - Submit feedback
- `GET /api/v1/feedback/my-feedback` - Get user's feedback
- `GET /api/v1/feedback/` - Get all feedback (Admin)
- `PATCH /api/v1/feedback/{id}` - Update feedback (Admin)

### Admin
- `GET /api/v1/admin/dashboard` - Dashboard statistics
- `GET /api/v1/admin/recent-orders` - Recent orders

## Database Schema

### Users Table
- User authentication and profile information
- Role-based access control (admin/user)
- Password hashing with bcrypt

### Products Table
- Product catalog with categories
- Stock management
- Pricing with discount support
- Image URLs and descriptions

### Orders Table
- Complete order information
- JSON storage for order items
- Delivery details and scheduling
- Payment tracking

### Cart Table
- User shopping carts
- JSON storage for cart items
- Automatic cleanup

### Feedback Table
- Customer feedback and support
- Admin responses
- Rating system

## Security Features

- **JWT Authentication**: Secure token-based auth with refresh tokens
- **Password Hashing**: bcrypt with salt rounds
- **CORS Protection**: Configurable allowed origins
- **Input Validation**: Pydantic models for all inputs
- **SQL Injection Protection**: SQLAlchemy ORM with parameterized queries
- **Rate Limiting**: Built-in request rate limiting
- **HTTPS Ready**: Production-ready security headers

## Business Logic

### Delivery Fee Calculation
- Distance-based pricing (₹5/km)
- Free delivery above ₹500
- Geographic validation for delivery areas
- Real-time distance calculation using geocoding

### Order Management
- Automatic stock updates
- Order status tracking
- Payment integration
- Email notifications

### Admin Features
- Product management
- Order tracking and updates
- Customer feedback management
- Dashboard analytics

## Testing

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/test_auth.py
```

## Deployment

### Production Setup

1. **Environment**:
```bash
export ENVIRONMENT=production
export DATABASE_URL=postgresql://user:pass@host:5432/krstores
export SECRET_KEY=your-production-secret-key
```

2. **Database Migration**:
```bash
alembic upgrade head
python scripts/seed_data.py
```

3. **Run with Gunicorn**:
```bash
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Docker Deployment

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc
- **OpenAPI JSON**: http://localhost:8000/api/openapi.json

## Support

For issues and questions:
- Check the API documentation at `/api/docs`
- Review the logs for error details
- Ensure all environment variables are properly set
- Verify database connectivity and migrations

## License

This project is proprietary software for KR Stores.