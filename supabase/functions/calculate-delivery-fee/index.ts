import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DeliveryRequest {
  address: string
  orderTotal: number
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { address, orderTotal }: DeliveryRequest = await req.json()
    
    // Business logic for delivery fee calculation
    const baseDistance = 5 // km
    const ratePerKm = 5 // ₹5 per km
    const freeDeliveryThreshold = 500
    
    let deliveryFee = 0
    
    if (orderTotal < freeDeliveryThreshold) {
      // In production, integrate with Google Maps API for actual distance
      const estimatedDistance = Math.random() * 15 + 2 // Mock: 2-17 km
      deliveryFee = Math.ceil(estimatedDistance) * ratePerKm
      deliveryFee = Math.max(deliveryFee, 20) // Minimum ₹20
      deliveryFee = Math.min(deliveryFee, 100) // Maximum ₹100
    }
    
    return new Response(
      JSON.stringify({
        deliveryFee,
        freeDelivery: orderTotal >= freeDeliveryThreshold,
        estimatedTime: '30-45 minutes'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})