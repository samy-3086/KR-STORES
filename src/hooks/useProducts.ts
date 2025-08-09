import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/supabase'
import { products as mockProducts } from '../data/products'

type Product = Database['public']['Tables']['products']['Row'] & {
  categories?: Database['public']['Tables']['categories']['Row']
}

interface ProductFilters {
  category?: string
  search?: string
  featured?: boolean
  minPrice?: number
  maxPrice?: number
}

interface ProductsState {
  products: Product[]
  loading: boolean
  error: string | null
}

export function useProducts(filters: ProductFilters = {}) {
  const [state, setState] = useState<ProductsState>({
    products: [],
    loading: true,
    error: null
  })

  useEffect(() => {
    fetchProducts()
  }, [filters])

  const fetchProducts = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      // Check if Supabase is properly configured
      if (!supabase.supabaseUrl || !supabase.supabaseKey) {
        // Fallback to mock data
        const filteredProducts = mockProducts.filter(product => {
          if (filters.category && product.category !== filters.category) return false
          if (filters.search && !product.name.toLowerCase().includes(filters.search.toLowerCase())) return false
          if (filters.featured !== undefined && product.featured !== filters.featured) return false
          if (filters.minPrice !== undefined && product.price < filters.minPrice) return false
          if (filters.maxPrice !== undefined && product.price > filters.maxPrice) return false
          return true
        })
        
        setState({
          products: filteredProducts.map(p => ({
            ...p,
            image_url: p.image,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })),
          loading: false,
          error: null
        })
        return
      }

      let query = supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            slug,
            icon
          )
        `)
        .eq('is_active', true)

      // Apply filters
      if (filters.category) {
        query = query.eq('categories.slug', filters.category)
      }

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      if (filters.featured !== undefined) {
        query = query.eq('featured', filters.featured)
      }

      if (filters.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice)
      }

      if (filters.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice)
      }

      // Order by featured first, then by name
      query = query.order('featured', { ascending: false })
      query = query.order('name', { ascending: true })

      const { data, error } = await query

      if (error) throw error

      setState({
        products: data || [],
        loading: false,
        error: null
      })
    } catch (error) {
      console.error('Error fetching products:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Database not configured. Using demo data.'
      }))
      
      // Fallback to mock data on error
      const filteredProducts = mockProducts.filter(product => {
        if (filters.category && product.category !== filters.category) return false
        if (filters.search && !product.name.toLowerCase().includes(filters.search.toLowerCase())) return false
        if (filters.featured !== undefined && product.featured !== filters.featured) return false
        if (filters.minPrice !== undefined && product.price < filters.minPrice) return false
        if (filters.maxPrice !== undefined && product.price > filters.maxPrice) return false
        return true
      })
      
      setState(prev => ({
        ...prev,
        products: filteredProducts.map(p => ({
          ...p,
          image_url: p.image,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })),
        loading: false,
        error: null
      }))
    }
  }

  const getProduct = async (id: string) => {
    try {
      // Fallback to mock data if Supabase not configured
      const mockProduct = mockProducts.find(p => p.id === id)
      if (mockProduct) {
        return { 
          data: {
            ...mockProduct,
            image_url: mockProduct.image,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, 
          error: null 
        }
      }

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            slug,
            icon
          )
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      console.error('Error fetching product:', error)
      return { data: null, error }
    }
  }

  const getFeaturedProducts = async (limit = 8) => {
    try {
      // Fallback to mock data if Supabase not configured
      const featuredMockProducts = mockProducts.filter(p => p.featured).slice(0, limit)
      if (featuredMockProducts.length > 0) {
        return { 
          data: featuredMockProducts.map(p => ({
            ...p,
            image_url: p.image,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })), 
          error: null 
        }
      }

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            slug,
            icon
          )
        `)
        .eq('is_active', true)
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return { data: data || [], error: null }
    } catch (error) {
      console.error('Error fetching featured products:', error)
      return { data: [], error }
    }
  }

  return {
    ...state,
    refetch: fetchProducts,
    getProduct,
    getFeaturedProducts
  }
}