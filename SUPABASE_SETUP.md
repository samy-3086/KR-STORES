# Supabase Setup Instructions for KR STORES

This guide will help you set up Supabase backend for the KR STORES e-commerce platform in just 5 minutes.

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- A web browser
- GitHub account (for Supabase signup)

## Step 1: Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" and sign up with GitHub
3. Create a new organization (or use existing)

## Step 2: Create New Project

1. Click "New Project"
2. Choose your organization
3. Fill in project details:
   - **Name**: KR Stores
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users
4. Click "Create new project"
5. Wait for project to be ready (2-3 minutes)

## Step 3: Get Project Credentials

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Project API Key** (anon public key)

## Step 4: Configure Environment Variables

1. In your project root, copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` file with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 5: Create Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the contents of `supabase/migrations/20250809_fix_rls_policies.sql`
4. Click "Run" to execute the schema creation
5. Then run `supabase/migrations/seed_initial_data.sql` to add sample data

## Step 5.1: Deploy Edge Functions (Optional - For Advanced Features)

For payment processing and business logic:

```bash
# Install Supabase CLI
npm install -g supabase

# Login and link project  
supabase login
supabase link --project-ref YOUR_PROJECT_ID

# Deploy functions
supabase functions deploy calculate-delivery-fee
supabase functions deploy process-payment  
supabase functions deploy send-order-notification
```
## Step 6: Configure Row Level Security (RLS)

The new migration scripts fix RLS infinite recursion issues:

1. Go to **Authentication** → **Policies**
2. Verify policies exist for each table (profiles, products, orders, etc.)
3. Admin access is now properly secured server-side

## Step 7: Test the Connection

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. The demo notice should disappear
3. Try registering a new user account
4. Browse products and add items to cart
5. Test admin access with kr0792505@gmail.com / vidhya

## Step 8: Admin Access

Admin access is restricted to:
- **Email**: kr0792505@gmail.com
- **Password**: vidhya
- **Features**: Product management, order tracking, analytics dashboard

## Step 9: Enable Advanced Features (Optional)

### Payment Processing
1. Create Stripe account at stripe.com
2. Get API keys from Stripe dashboard
3. Add to Supabase Edge Function secrets:
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
```

### Email Notifications  
1. Configure SMTP service (Gmail, SendGrid, etc.)
2. Add credentials to Edge Function environment
3. Test order confirmation emails
## Step 9: Deploy to Production

### For Netlify:
1. Go to Netlify dashboard
2. Site settings → Environment variables
3. Add the same environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Configure CORS:
1. In Supabase: **Settings** → **API**
2. Add your deployed domain to **CORS origins**
3. Example: `https://your-site.netlify.app`

## Troubleshooting

### Common Issues:

1. **404 Errors**: Tables don't exist
   - Solution: Run the migration scripts in SQL Editor

2. **500 Errors**: RLS policies blocking access
   - Solution: Check policies in Authentication → Policies

3. **Auth Errors**: User registration failing
   - Solution: Check if email confirmations are disabled in Auth settings

4. **CORS Errors**: Frontend can't connect
   - Solution: Add your domain to CORS origins in Supabase

### Getting Help:

- **Supabase Logs**: Check **Logs** section for errors
- **RLS Policies**: Review in **Authentication** → **Policies**  
- **API Testing**: Use **API** → **Tables** section
- **Edge Functions**: Monitor in **Functions** section

## 🎯 Success Checklist

After setup, verify these work:
- [ ] Demo notice disappears
- [ ] User registration/login works
- [ ] Products load from database
- [ ] Shopping cart persists
- [ ] Orders save to database  
- [ ] Admin dashboard accessible
- [ ] No console errors
## Database Schema Overview

The application uses these main tables:
- **profiles**: User information extending Supabase auth
- **categories**: Product categories (vegetables, fruits, etc.)
- **products**: Product catalog with inventory
- **orders**: Customer orders with delivery details
- **order_items**: Individual items in orders
- **feedback**: Customer reviews and ratings
- **delivery_areas**: Supported delivery locations

All tables have Row Level Security enabled for data protection.

## 🚀 What You Get After Setup

### Customer Features
- **Secure Authentication**: Registration, login, profile management
- **Product Catalog**: Real-time inventory with search and filtering
- **Shopping Cart**: Persistent cart with quantity management
- **Order Management**: Complete order lifecycle with tracking
- **Delivery System**: Distance-based fee calculation

### Admin Features  
- **Dashboard**: Real-time analytics and business metrics
- **Product Management**: Add, edit, delete products with inventory
- **Order Management**: View all orders, update status, track delivery
- **Customer Management**: View customer profiles and order history
- **Security**: Role-based access with server-side validation

**KR STORES transforms from demo to production-ready e-commerce platform!** 🛒✨