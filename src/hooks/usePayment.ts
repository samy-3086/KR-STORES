import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface PaymentData {
  orderId: string
  amount: number
  paymentMethod: 'stripe' | 'razorpay' | 'cod'
}

interface PaymentResult {
  success: boolean
  paymentId?: string
  error?: string
}

export function usePayment() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const processPayment = async (paymentData: PaymentData): Promise<PaymentResult> => {
    try {
      setLoading(true)
      setError(null)

      if (paymentData.paymentMethod === 'cod') {
        // For COD, just update order status
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            payment_method: 'cod',
            payment_status: 'pending',
            status: 'confirmed'
          })
          .eq('id', paymentData.orderId)

        if (updateError) throw updateError

        return { success: true, paymentId: 'cod_' + Date.now() }
      }

      // For online payments, call edge function
      const { data, error: functionError } = await supabase.functions.invoke('process-payment', {
        body: {
          orderId: paymentData.orderId,
          amount: paymentData.amount,
          paymentMethod: paymentData.paymentMethod
        }
      })

      if (functionError) throw functionError

      return {
        success: data.success,
        paymentId: data.paymentIntent?.id,
        error: data.error
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const calculateDeliveryFee = async (address: string, orderTotal: number) => {
    try {
      const { data, error } = await supabase.functions.invoke('calculate-delivery-fee', {
        body: { address, orderTotal }
      })

      if (error) throw error
      return data
    } catch (err) {
      console.error('Error calculating delivery fee:', err)
      // Fallback calculation
      return {
        deliveryFee: orderTotal >= 500 ? 0 : 50,
        freeDelivery: orderTotal >= 500,
        estimatedTime: '30-45 minutes'
      }
    }
  }

  return {
    loading,
    error,
    processPayment,
    calculateDeliveryFee
  }
}