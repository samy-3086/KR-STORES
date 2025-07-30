const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Product = require('../models/Product');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/krstores');
    console.log('MongoDB connected for seeding');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});

    // Create admin user
    const adminUser = new User({
      name: 'KR Admin',
      email: 'kr0792505@gmail.com',
      password: 'vidhya',
      phone: '+91 98765 43210',
      address: 'KR Stores HQ, Mumbai, Maharashtra',
      role: 'admin',
      isVerified: true
    });

    await adminUser.save();
    console.log('Admin user created successfully');

    // Create sample customer
    const customerUser = new User({
      name: 'John Doe',
      email: 'customer@example.com',
      password: 'password123',
      phone: '+91 98765 43211',
      address: '123 Sample Street, Mumbai, Maharashtra',
      role: 'customer',
      isVerified: true
    });

    await customerUser.save();
    console.log('Sample customer created successfully');

  } catch (error) {
    console.error('Error seeding users:', error);
  }
};

const seedProducts = async () => {
  try {
    // Clear existing products
    await Product.deleteMany({});

    const products = [
      // Vegetables
      {
        name: 'Fresh Tomatoes',
        category: 'vegetables',
        price: 40,
        originalPrice: 50,
        image: 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=400',
        description: 'Fresh, juicy tomatoes perfect for cooking and salads. Rich in vitamins and antioxidants.',
        stock: 50,
        featured: true,
        unit: 'kg'
      },
      {
        name: 'Organic Spinach',
        category: 'vegetables',
        price: 30,
        image: 'https://images.pexels.com/photos/2325843/pexels-photo-2325843.jpeg?auto=compress&cs=tinysrgb&w=400',
        description: 'Fresh organic spinach leaves, packed with iron and nutrients.',
        stock: 25,
        featured: false,
        unit: 'bunch'
      },
      {
        name: 'Bell Peppers',
        category: 'vegetables',
        price: 80,
        image: 'https://images.pexels.com/photos/1268101/pexels-photo-1268101.jpeg?auto=compress&cs=tinysrgb&w=400',
        description: 'Colorful bell peppers, great for stir-fries and salads.',
        stock: 30,
        featured: false,
        unit: 'kg'
      },
      {
        name: 'Fresh Carrots',
        category: 'vegetables',
        price: 35,
        image: 'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg?auto=compress&cs=tinysrgb&w=400',
        description: 'Crunchy fresh carrots, perfect for cooking and snacking.',
        stock: 40,
        featured: true,
        unit: 'kg'
      },

      // Fruits
      {
        name: 'Fresh Bananas',
        category: 'fruits',
        price: 60,
        image: 'https://images.pexels.com/photos/2872755/pexels-photo-2872755.jpeg?auto=compress&cs=tinysrgb&w=400',
        description: 'Sweet, ripe bananas rich in potassium and natural sugars.',
        stock: 100,
        featured: true,
        unit: 'dozen'
      },
      {
        name: 'Red Apples',
        category: 'fruits',
        price: 120,
        originalPrice: 140,
        image: 'https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg?auto=compress&cs=tinysrgb&w=400',
        description: 'Crisp and sweet red apples, perfect for snacking.',
        stock: 60,
        featured: false,
        unit: 'kg'
      },
      {
        name: 'Fresh Oranges',
        category: 'fruits',
        price: 80,
        image: 'https://images.pexels.com/photos/161559/background-bitter-breakfast-bright-161559.jpeg?auto=compress&cs=tinysrgb&w=400',
        description: 'Juicy oranges packed with vitamin C and natural sweetness.',
        stock: 45,
        featured: true,
        unit: 'kg'
      },
      {
        name: 'Fresh Grapes',
        category: 'fruits',
        price: 100,
        image: 'https://images.pexels.com/photos/708777/pexels-photo-708777.jpeg?auto=compress&cs=tinysrgb&w=400',
        description: 'Sweet and seedless grapes, perfect for snacking.',
        stock: 35,
        featured: false,
        unit: 'kg'
      },

      // Spices
      {
        name: 'Turmeric Powder',
        category: 'spices',
        price: 150,
        image: 'https://images.pexels.com/photos/4198015/pexels-photo-4198015.jpeg?auto=compress&cs=tinysrgb&w=400',
        description: 'Pure turmeric powder with anti-inflammatory properties.',
        stock: 20,
        featured: false,
        unit: '500g'
      },
      {
        name: 'Red Chili Powder',
        category: 'spices',
        price: 120,
        image: 'https://images.pexels.com/photos/4198017/pexels-photo-4198017.jpeg?auto=compress&cs=tinysrgb&w=400',
        description: 'Spicy red chili powder for authentic Indian cooking.',
        stock: 25,
        featured: true,
        unit: '500g'
      },
      {
        name: 'Cumin Seeds',
        category: 'spices',
        price: 200,
        image: 'https://images.pexels.com/photos/4198016/pexels-photo-4198016.jpeg?auto=compress&cs=tinysrgb&w=400',
        description: 'Aromatic cumin seeds for tempering and flavoring.',
        stock: 15,
        featured: false,
        unit: '250g'
      },
      {
        name: 'Garam Masala',
        category: 'spices',
        price: 180,
        originalPrice: 200,
        image: 'https://images.pexels.com/photos/4198018/pexels-photo-4198018.jpeg?auto=compress&cs=tinysrgb&w=400',
        description: 'Authentic garam masala blend for rich, aromatic dishes.',
        stock: 18,
        featured: true,
        unit: '100g'
      },

      // Groceries
      {
        name: 'Basmati Rice',
        category: 'groceries',
        price: 180,
        image: 'https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg?auto=compress&cs=tinysrgb&w=400',
        description: 'Premium quality basmati rice with long grains and aromatic flavor.',
        stock: 50,
        featured: true,
        unit: '1kg'
      },
      {
        name: 'Whole Wheat Flour',
        category: 'groceries',
        price: 45,
        image: 'https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=400',
        description: 'Fresh whole wheat flour for healthy rotis and bread.',
        stock: 40,
        featured: false,
        unit: '1kg'
      },
      {
        name: 'Toor Dal',
        category: 'groceries',
        price: 120,
        image: 'https://images.pexels.com/photos/4110252/pexels-photo-4110252.jpeg?auto=compress&cs=tinysrgb&w=400',
        description: 'High-quality toor dal, rich in protein and nutrients.',
        stock: 30,
        featured: true,
        unit: '1kg'
      },
      {
        name: 'Cooking Oil',
        category: 'groceries',
        price: 140,
        originalPrice: 160,
        image: 'https://images.pexels.com/photos/4110253/pexels-photo-4110253.jpeg?auto=compress&cs=tinysrgb&w=400',
        description: 'Pure sunflower cooking oil for healthy cooking.',
        stock: 25,
        featured: false,
        unit: '1L'
      }
    ];

    await Product.insertMany(products);
    console.log('Products seeded successfully');

  } catch (error) {
    console.error('Error seeding products:', error);
  }
};

const seedData = async () => {
  await connectDB();
  await seedUsers();
  await seedProducts();
  console.log('Database seeding completed');
  process.exit(0);
};

seedData();