import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { Database } from '../lib/supabase'

type Order = Database['public']['Tables']['orders']['Row']
type OrderInsert = Database['public']['Tables']['orders']['Insert']
type OrderItem = Database['public']['Tables']['order_items']['Insert']

interface CreateOrderData {
  delivery_address: string
  delivery_date: string
  delivery_time_slot: string
  delivery_instructions?: string
  payment_method: 'cod' | 'online'
  items: Array<{
    product_id: string
    quantity: number
    unit_price: number
  }>
}

export function useOrders() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createOrder = async (orderData: CreateOrderData) => {
    if (!user) {
      setError('User must be logged in to create an order')
      return { data: null, error: 'User must be logged in' }
    }

    try {
      setLoading(true)
      setError(null)

      // Calculate totals
      const subtotal = orderData.items.reduce(
        (sum, item) => sum + (item.unit_price * item.quantity),
        0
      )

      // Calculate delivery fee
      const { data: deliveryFeeData, error: deliveryError } = await supabase
        .rpc('calculate_delivery_fee', {
          delivery_address: orderData.delivery_address,
          order_total: subtotal
        })

      if (deliveryError) throw deliveryError

      const deliveryFee = deliveryFeeData || (subtotal >= 500 ? 0 : 50)
      const total = subtotal + deliveryFee

      // Generate order number
      const { data: orderNumber, error: orderNumberError } = await supabase
        .rpc('generate_order_number')

      if (orderNumberError) throw orderNumberError

      // Create order
      const orderInsert: OrderInsert = {
        order_number: orderNumber,
        user_id: user.id,
        delivery_address: orderData.delivery_address,
        delivery_date: orderData.delivery_date,
        delivery_time_slot: orderData.delivery_time_slot,
        delivery_instructions: orderData.delivery_instructions,
        delivery_fee: deliveryFee,
        payment_method: orderData.payment_method,
        subtotal,
        total
      }

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderInsert)
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems: OrderItem[] = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.unit_price * item.quantity
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      return { data: order, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create order'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const getMyOrders = async () => {
    if (!user) {
      setError('User must be logged in to view orders')
      return { data: [], error: 'User must be logged in' }
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              name,
              image_url,
              unit
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      return { data: data || [], error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch orders'
      setError(errorMessage)
      return { data: [], error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const getOrder = async (orderId: string) => {
    if (!user) {
      setError('User must be logged in to view order')
      return { data: null, error: 'User must be logged in' }
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              name,
              image_url,
              unit
            )
          )
        `)
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch order'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update order status'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    createOrder,
    getMyOrders,
    getOrder,
    updateOrderStatus
  }
}