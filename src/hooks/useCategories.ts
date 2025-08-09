import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/supabase'

type Category = Database['public']['Tables']['categories']['Row']

// Mock categories for fallback
const mockCategories = [
  { id: '1', name: 'vegetables', slug: 'vegetables', description: 'Fresh vegetables', icon: '🥦', is_active: true, created_at: new Date().toISOString() },
  { id: '2', name: 'fruits', slug: 'fruits', description: 'Fresh fruits', icon: '🍎', is_active: true, created_at: new Date().toISOString() },
  { id: '3', name: 'spices', slug: 'spices', description: 'Aromatic spices', icon: '🌶️', is_active: true, created_at: new Date().toISOString() },
  { id: '4', name: 'groceries', slug: 'groceries', description: 'Daily essentials', icon: '🍚', is_active: true, created_at: new Date().toISOString() }
]

interface CategoriesState {
  categories: Category[]
  loading: boolean
  error: string | null
}

export function useCategories() {
  const [state, setState] = useState<CategoriesState>({
    categories: [],
    loading: true,
    error: null
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      // Check if Supabase is properly configured
      if (!supabase.supabaseUrl || !supabase.supabaseKey) {
        setState({
          categories: mockCategories,
          loading: false,
          error: null
        })
        return
      }

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (error) throw error

      setState({
        categories: data || [],
        loading: false,
        error: null
      })
    } catch (error) {
      console.error('Error fetching categories:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Database not configured. Using demo data.'
      }))
      
      // Fallback to mock data
      setState(prev => ({
        ...prev,
        categories: mockCategories,
        loading: false,
        error: null
      }))
    }
  }

  return {
    ...state,
    refetch: fetchCategories
  }
}