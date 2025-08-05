import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/supabase'

type Category = Database['public']['Tables']['categories']['Row']

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
        error: error instanceof Error ? error.message : 'Failed to fetch categories'
      }))
    }
  }

  return {
    ...state,
    refetch: fetchCategories
  }
}