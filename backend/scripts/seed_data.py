import asyncio
import sys
import os

# Add the parent directory to the path so we can import our app
sys.path.append(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))

from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import AsyncSessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.user import User
from app.models.product import Product

async def create_tables():
    """Create all database tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def seed_products():
    """Seed the database with sample products."""
    
    products_data = [
        # Vegetables
        {
            "name": "Fresh Tomatoes",
            "category": "vegetables",
            "price": 40.0,
            "original_price": 50.0,
            "image_url": "https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=400",
            "description": "Fresh, juicy tomatoes perfect for cooking and salads. Rich in vitamins and antioxidants.",
            "stock": 50,
            "unit": "kg",
            "featured": True,
            "discount_percentage": 20
        },
        {
            "name": "Organic Spinach",
            "category": "vegetables",
            "price": 30.0,
            "image_url": "https://images.pexels.com/photos/2325843/pexels-photo-2325843.jpeg?auto=compress&cs=tinysrgb&w=400",
            "description": "Fresh organic spinach leaves, packed with iron and nutrients.",
            "stock": 25,
            "unit": "bunch",
            "featured": False
        },
        {
            "name": "Bell Peppers",
            "category": "vegetables",
            "price": 80.0,
            "image_url": "https://images.pexels.com/photos/1268101/pexels-photo-1268101.jpeg?auto=compress&cs=tinysrgb&w=400",
            "description": "Colorful bell peppers, great for stir-fries and salads.",
            "stock": 30,
            "unit": "kg",
            "featured": False
        },
        {
            "name": "Fresh Carrots",
            "category": "vegetables",
            "price": 35.0,
            "image_url": "https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg?auto=compress&cs=tinysrgb&w=400",
            "description": "Crunchy fresh carrots, perfect for cooking and snacking.",
            "stock": 40,
            "unit": "kg",
            "featured": True
        },
        
        # Fruits
        {
            "name": "Fresh Bananas",
            "category": "fruits",
            "price": 60.0,
            "image_url": "https://images.pexels.com/photos/2872755/pexels-photo-2872755.jpeg?auto=compress&cs=tinysrgb&w=400",
            "description": "Sweet, ripe bananas rich in potassium and natural sugars.",
            "stock": 100,
            "unit": "dozen",
            "featured": True
        },
        {
            "name": "Red Apples",
            "category": "fruits",
            "price": 120.0,
            "original_price": 140.0,
            "image_url": "https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg?auto=compress&cs=tinysrgb&w=400",
            "description": "Crisp and sweet red apples, perfect for snacking.",
            "stock": 60,
            "unit": "kg",
            "featured": False,
            "discount_percentage": 14
        },
        {
            "name": "Fresh Oranges",
            "category": "fruits",
            "price": 80.0,
            "image_url": "https://images.pexels.com/photos/161559/background-bitter-breakfast-bright-161559.jpeg?auto=compress&cs=tinysrgb&w=400",
            "description": "Juicy oranges packed with vitamin C and natural sweetness.",
            "stock": 45,
            "unit": "kg",
            "featured": True
        },
        {
            "name": "Fresh Grapes",
            "category": "fruits",
            "price": 100.0,
            "image_url": "https://images.pexels.com/photos/708777/pexels-photo-708777.jpeg?auto=compress&cs=tinysrgb&w=400",
            "description": "Sweet and seedless grapes, perfect for snacking.",
            "stock": 35,
            "unit": "kg",
            "featured": False
        },
        
        # Spices
        {
            "name": "Turmeric Powder",
            "category": "spices",
            "price": 150.0,
            "image_url": "https://images.pexels.com/photos/4198015/pexels-photo-4198015.jpeg?auto=compress&cs=tinysrgb&w=400",
            "description": "Pure turmeric powder with anti-inflammatory properties.",
            "stock": 20,
            "unit": "500g",
            "featured": False
        },
        {
            "name": "Red Chili Powder",
            "category": "spices",
            "price": 120.0,
            "image_url": "https://images.pexels.com/photos/4198017/pexels-photo-4198017.jpeg?auto=compress&cs=tinysrgb&w=400",
            "description": "Spicy red chili powder for authentic Indian cooking.",
            "stock": 25,
            "unit": "500g",
            "featured": True
        },
        {
            "name": "Cumin Seeds",
            "category": "spices",
            "price": 200.0,
            "image_url": "https://images.pexels.com/photos/4198016/pexels-photo-4198016.jpeg?auto=compress&cs=tinysrgb&w=400",
            "description": "Aromatic cumin seeds for tempering and flavoring.",
            "stock": 15,
            "unit": "250g",
            "featured": False
        },
        {
            "name": "Garam Masala",
            "category": "spices",
            "price": 180.0,
            "original_price": 200.0,
            "image_url": "https://images.pexels.com/photos/4198018/pexels-photo-4198018.jpeg?auto=compress&cs=tinysrgb&w=400",
            "description": "Authentic garam masala blend for rich, aromatic dishes.",
            "stock": 18,
            "unit": "100g",
            "featured": True,
            "discount_percentage": 10
        },
        
        # Groceries
        {
            "name": "Basmati Rice",
            "category": "groceries",
            "price": 180.0,
            "image_url": "https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg?auto=compress&cs=tinysrgb&w=400",
            "description": "Premium quality basmati rice with long grains and aromatic flavor.",
            "stock": 50,
            "unit": "1kg",
            "featured": True
        },
        {
            "name": "Whole Wheat Flour",
            "category": "groceries",
            "price": 45.0,
            "image_url": "https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=400",
            "description": "Fresh whole wheat flour for healthy rotis and bread.",
            "stock": 40,
            "unit": "1kg",
            "featured": False
        },
        {
            "name": "Toor Dal",
            "category": "groceries",
            "price": 120.0,
            "image_url": "https://images.pexels.com/photos/4110252/pexels-photo-4110252.jpeg?auto=compress&cs=tinysrgb&w=400",
            "description": "High-quality toor dal, rich in protein and nutrients.",
            "stock": 30,
            "unit": "1kg",
            "featured": True
        },
        {
            "name": "Cooking Oil",
            "category": "groceries",
            "price": 140.0,
            "original_price": 160.0,
            "image_url": "https://images.pexels.com/photos/4110253/pexels-photo-4110253.jpeg?auto=compress&cs=tinysrgb&w=400",
            "description": "Pure sunflower cooking oil for healthy cooking.",
            "stock": 25,
            "unit": "1L",
            "featured": False,
            "discount_percentage": 12
        }
    ]
    
    async with AsyncSessionLocal() as db:
        try:
            # Check if products already exist
            existing_products = await db.execute(
                "SELECT COUNT(*) FROM products"
            )
            count = existing_products.scalar()
            
            if count > 0:
                print(f"Products already exist ({count} products). Skipping seed.")
                return
            
            # Create products
            for product_data in products_data:
                product = Product(**product_data)
                db.add(product)
            
            await db.commit()
            print(f"Successfully seeded {len(products_data)} products!")
            
        except Exception as e:
            print(f"Error seeding products: {e}")
            await db.rollback()

async def seed_admin_user():
    """Create admin user if it doesn't exist."""
    async with AsyncSessionLocal() as db:
        try:
            # Check if admin user exists
            from sqlalchemy import select
            result = await db.execute(
                select(User).where(User.email == "kr0792505@gmail.com")
            )
            admin_user = result.scalar_one_or_none()
            
            if admin_user:
                print("Admin user already exists. Skipping creation.")
                return
            
            # Create admin user
            admin_user = User(
                email="kr0792505@gmail.com",
                name="KR Admin",
                phone="+91 98765 43210",
                address="KR Stores HQ, Mumbai, Maharashtra",
                hashed_password=get_password_hash("vidhya"),
                is_admin=True,
                is_active=True,
                is_verified=True
            )
            
            db.add(admin_user)
            await db.commit()
            print("Admin user created successfully!")
            
        except Exception as e:
            print(f"Error creating admin user: {e}")
            await db.rollback()

async def main():
    """Main function to run all seeding operations."""
    print("Starting database seeding...")
    
    # Create tables
    await create_tables()
    print("Database tables created/verified.")
    
    # Seed admin user
    await seed_admin_user()
    
    # Seed products
    await seed_products()
    
    print("Database seeding completed!")

if __name__ == "__main__":
    asyncio.run(main())