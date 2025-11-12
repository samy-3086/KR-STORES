import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { orderId, type } = await req.json() // type: 'confirmation' | 'status_update'
    
    // Get order with user details
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        profiles (
          full_name,
          email
        ),
        order_items (
          quantity,
          unit_price,
          products (
            name,
            unit
          )
        )
      `)
      .eq('id', orderId)
      .single()
    
    if (error || !order) {
      throw new Error('Order not found')
    }
    
    // Email content based on type
    let subject = ''
    let htmlContent = ''
    
    if (type === 'confirmation') {
      subject = `Order Confirmation - ${order.order_number}`
      htmlContent = `
        <h2>Thank you for your order!</h2>
        <p>Dear ${order.profiles.full_name},</p>
        <p>Your order <strong>${order.order_number}</strong> has been confirmed.</p>
        <h3>Order Details:</h3>
        <ul>
          ${order.order_items.map((item: any) => 
            `<li>${item.products.name} - ${item.quantity} ${item.products.unit} - ₹${item.unit_price * item.quantity}</li>`
          ).join('')}
        </ul>
        <p><strong>Total: ₹${order.total}</strong></p>
        <p>Delivery Date: ${new Date(order.delivery_date).toLocaleDateString()}</p>
        <p>Time Slot: ${order.delivery_time_slot}</p>
        <p>We'll notify you when your order is out for delivery.</p>
        <p>Thank you for choosing KR Stores!</p>
      `
    }
    
    // In production, integrate with email service (SendGrid, AWS SES, etc.)
    console.log('Email would be sent:', {
      to: order.profiles.email,
      subject,
      html: htmlContent
    })
    
    return new Response(
      JSON.stringify({ success: true, message: 'Notification sent' }),
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