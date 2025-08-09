# Supabase Setup Instructions for KR STORES

This guide will help you set up Supabase backend for the KR STORES e-commerce platform.

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
3. Copy and paste the contents of `supabase/migrations/create_initial_schema.sql`
4. Click "Run" to execute the schema creation
5. Repeat for `supabase/migrations/seed_initial_data.sql` to add sample data

## Step 6: Configure Row Level Security (RLS)

The migration scripts automatically set up RLS policies, but verify:

1. Go to **Authentication** → **Policies**
2. You should see policies for each table
3. If missing, re-run the migration scripts

## Step 7: Test the Connection

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. The demo notice should disappear
3. Try registering a new user account
4. Browse products and add items to cart

## Step 8: Admin Access

The admin user is automatically created with:
- **Email**: kr0792505@gmail.com
- **Password**: vidhya

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

- Check Supabase logs in **Logs** section
- Review RLS policies in **Authentication** → **Policies**
- Test API calls in **API** → **Tables** section

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