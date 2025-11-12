import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

interface AnalyticsData {
  totalOrders: number
  totalRevenue: number
  avgOrderValue: number
  completedOrders: number
  cancelledOrders: number
  recentOrders: any[]
  topProducts: any[]
  dailyStats: any[]
}

export function useAnalytics() {
  const { isAdmin } = useAuth()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isAdmin) {
      fetchAnalytics()
    }
  }, [isAdmin])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch order analytics
      const { data: orderStats, error: orderError } = await supabase
        .from('order_analytics')
        .select('*')
        .order('date', { ascending: false })
        .limit(30)

      if (orderError) throw orderError

      // Fetch recent orders
      const { data: recentOrders, error: recentError } = await supabase
        .from('orders')
        .select(`
          *,
          profiles (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      if (recentError) throw recentError

      // Fetch top products
      const { data: topProducts, error: productsError } = await supabase
        .from('order_items')
        .select(`
          product_id,
          products (
            name,
            image_url
          ),
          quantity
        `)
        .order('quantity', { ascending: false })
        .limit(5)

      if (productsError) throw productsError

      // Calculate totals
      const totals = orderStats?.reduce((acc, day) => ({
        totalOrders: acc.totalOrders + day.total_orders,
        totalRevenue: acc.totalRevenue + day.total_revenue,
        completedOrders: acc.completedOrders + day.completed_orders,
        cancelledOrders: acc.cancelledOrders + day.cancelled_orders
      }), {
        totalOrders: 0,
        totalRevenue: 0,
        completedOrders: 0,
        cancelledOrders: 0
      }) || {
        totalOrders: 0,
        totalRevenue: 0,
        completedOrders: 0,
        cancelledOrders: 0
      }

      setData({
        ...totals,
        avgOrderValue: totals.totalOrders > 0 ? totals.totalRevenue / totals.totalOrders : 0,
        recentOrders: recentOrders || [],
        topProducts: topProducts || [],
        dailyStats: orderStats || []
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }

  return {
    data,
    loading,
    error,
    refetch: fetchAnalytics
  }
}