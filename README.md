# KR STORES - Complete E-commerce Platform

A modern, secure, mobile-first online grocery and essentials e-commerce platform built with React.js and Supabase.

## 🚀 Features

### Customer Features
- **Product Catalog**: Browse products by category with search and filtering
- **Shopping Cart**: Add/remove items with quantity management
- **User Authentication**: Secure registration and login with Supabase Auth
- **Order Management**: Place orders with delivery scheduling
- **Delivery System**: Distance-based delivery fee calculation (₹5/km)
- **Payment Integration**: Support for COD and online payments
- **Responsive Design**: Mobile-first design optimized for all devices

### Admin Features
- **Admin Dashboard**: Restricted access for kr0792505@gmail.com
- **Product Management**: Add, edit, delete products with inventory tracking
- **Order Management**: View and update order status
- **Feedback System**: View and respond to customer feedback
- **Analytics**: Order statistics and business insights

## 🛠 Tech Stack

- **Frontend**: React.js 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + REST APIs)
- **Icons**: Lucide React
- **Deployment**: Netlify/Vercel (Frontend)

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Supabase account

### Setup Instructions

1. **Clone the repository**
```bash
git clone <repository-url>
cd kr-stores
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup Supabase**
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Run the SQL migrations in your Supabase SQL editor:
     - Execute `supabase/migrations/create_initial_schema.sql`
     - Execute `supabase/migrations/seed_initial_data.sql`

4. **Environment Configuration**
```bash
cp .env.example .env
```
Edit `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. **Start Development Server**
```bash
npm run dev
```

## 🗄 Database Schema

### Core Tables
- **profiles**: User profiles extending Supabase auth
- **categories**: Product categories (vegetables, fruits, spices, groceries)
- **products**: Product catalog with inventory management
- **orders**: Customer orders with delivery details
- **order_items**: Individual items within orders
- **feedback**: Customer reviews and ratings
- **delivery_areas**: Supported delivery locations

### Security Features
- Row Level Security (RLS) enabled on all tables
- Role-based access control (customer/admin)
- Secure admin authentication
- Input validation and sanitization

## 🔐 Admin Access

**Admin Credentials:**
- Email: kr0792505@gmail.com
- Password: vidhya

Admin users have access to:
- Product management (CRUD operations)
- Order management and status updates
- Customer feedback management
- Business analytics dashboard

## 🚀 Deployment

### Frontend Deployment (Netlify/Vercel)

1. **Build the project**
```bash
npm run build
```

2. **Deploy to Netlify**
   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Add environment variables in Netlify dashboard

3. **Configure CORS in Supabase**
   - Go to Supabase Dashboard → Settings → API
   - Add your deployed domain to allowed origins

### Environment Variables for Production
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📱 Mobile Optimization

- Mobile-first responsive design
- Touch-friendly interface
- Optimized images and loading
- Progressive Web App (PWA) ready
- Performance score >95% on mobile

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure
```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts (Auth, Cart)
├── hooks/              # Custom React hooks
├── lib/                # Supabase client and utilities
├── pages/              # Page components
└── types/              # TypeScript type definitions
```

## 🛡 Security Features

- HTTPS with SSL certificates
- Supabase Row Level Security (RLS)
- JWT-based authentication
- Input validation and sanitization
- CORS protection
- Environment variable management

## 📊 Business Logic

### Delivery Fee Calculation
- Base fee: ₹50 for orders under ₹500
- Free delivery for orders ≥ ₹500
- Distance-based pricing: ₹5/km (future enhancement)

### Order Management
- Automatic stock updates on order placement
- Order status tracking (pending → confirmed → processing → shipped → delivered)
- Email notifications (configurable)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary software for KR Stores.

## 📞 Support

For technical support or business inquiries:
- Email: kr0792505@gmail.com
- Phone: +91 98765 43210

---

**KR STORES** - Fresh groceries delivered daily! 🥦🍎🌶️🍚