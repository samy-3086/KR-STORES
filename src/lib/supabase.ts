import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Allow the app to work without Supabase configuration for demo purposes
const supabaseClient = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null

export const supabase = supabaseClient || {
  supabaseUrl: null,
  supabaseKey: null,
  from: () => ({ select: () => ({ eq: () => ({ order: () => Promise.resolve({ data: [], error: null }) }) }) }),
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signUp: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
    signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
    signOut: () => Promise.resolve({ error: null })
  }
}

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string | null
          address: string | null
          role: 'customer' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          phone?: string | null
          address?: string | null
          role?: 'customer' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          phone?: string | null
          address?: string | null
          role?: 'customer' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          icon: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          icon?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          icon?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          category_id: string | null
          price: number
          original_price: number | null
          unit: string
          stock: number
          min_stock: number
          image_url: string | null
          images: string[]
          featured: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          category_id?: string | null
          price: number
          original_price?: number | null
          unit?: string
          stock?: number
          min_stock?: number
          image_url?: string | null
          images?: string[]
          featured?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          category_id?: string | null
          price?: number
          original_price?: number | null
          unit?: string
          stock?: number
          min_stock?: number
          image_url?: string | null
          images?: string[]
          featured?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          user_id: string
          status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          delivery_address: string
          delivery_date: string
          delivery_time_slot: string
          delivery_instructions: string | null
          delivery_fee: number
          payment_method: 'cod' | 'online'
          payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_id: string | null
          subtotal: number
          total: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number: string
          user_id: string
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          delivery_address: string
          delivery_date: string
          delivery_time_slot: string
          delivery_instructions?: string | null
          delivery_fee?: number
          payment_method?: 'cod' | 'online'
          payment_status?: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_id?: string | null
          subtotal: number
          total: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          user_id?: string
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          delivery_address?: string
          delivery_date?: string
          delivery_time_slot?: string
          delivery_instructions?: string | null
          delivery_fee?: number
          payment_method?: 'cod' | 'online'
          payment_status?: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_id?: string | null
          subtotal?: number
          total?: number
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          created_at?: string
        }
      }
      feedback: {
        Row: {
          id: string
          user_id: string
          order_id: string | null
          product_id: string | null
          rating: number | null
          title: string | null
          comment: string | null
          is_public: boolean
          admin_response: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          order_id?: string | null
          product_id?: string | null
          rating?: number | null
          title?: string | null
          comment?: string | null
          is_public?: boolean
          admin_response?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          order_id?: string | null
          product_id?: string | null
          rating?: number | null
          title?: string | null
          comment?: string | null
          is_public?: boolean
          admin_response?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      delivery_areas: {
        Row: {
          id: string
          name: string
          pincode: string | null
          distance_km: number
          delivery_fee: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          pincode?: string | null
          distance_km: number
          delivery_fee: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          pincode?: string | null
          distance_km?: number
          delivery_fee?: number
          is_active?: boolean
          created_at?: string
        }
      }
    }
  }
}