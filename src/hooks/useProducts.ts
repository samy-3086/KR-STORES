import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/supabase'

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
        error: error instanceof Error ? error.message : 'Failed to fetch products'
      }))
    }
  }

  const getProduct = async (id: string) => {
    try {
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