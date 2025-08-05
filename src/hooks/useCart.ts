import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'

interface CartItem {
  id: string
  name: string
  price: number
  image_url: string | null
  unit: string
  quantity: number
  stock: number
}

interface CartState {
  items: CartItem[]
  loading: boolean
  error: string | null
}

export function useCart() {
  const { user } = useAuth()
  const [state, setState] = useState<CartState>({
    items: [],
    loading: false,
    error: null
  })

  useEffect(() => {
    loadCart()
  }, [user])

  const loadCart = () => {
    try {
      const cartKey = user ? `cart_${user.id}` : 'cart_guest'
      const savedCart = localStorage.getItem(cartKey)
      
      if (savedCart) {
        const items = JSON.parse(savedCart)
        setState(prev => ({ ...prev, items }))
      }
    } catch (error) {
      console.error('Error loading cart:', error)
      setState(prev => ({ ...prev, error: 'Failed to load cart' }))
    }
  }

  const saveCart = (items: CartItem[]) => {
    try {
      const cartKey = user ? `cart_${user.id}` : 'cart_guest'
      localStorage.setItem(cartKey, JSON.stringify(items))
      setState(prev => ({ ...prev, items }))
    } catch (error) {
      console.error('Error saving cart:', error)
      setState(prev => ({ ...prev, error: 'Failed to save cart' }))
    }
  }

  const addToCart = (product: {
    id: string
    name: string
    price: number
    image_url: string | null
    unit: string
    stock: number
  }, quantity = 1) => {
    setState(prev => {
      const existingItem = prev.items.find(item => item.id === product.id)
      
      if (existingItem) {
        const newQuantity = Math.min(existingItem.quantity + quantity, product.stock)
        const updatedItems = prev.items.map(item =>
          item.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        )
        saveCart(updatedItems)
        return { ...prev, items: updatedItems }
      } else {
        const newItem: CartItem = {
          ...product,
          quantity: Math.min(quantity, product.stock)
        }
        const updatedItems = [...prev.items, newItem]
        saveCart(updatedItems)
        return { ...prev, items: updatedItems }
      }
    })
  }

  const updateQuantity = (productId: string, quantity: number) => {
    setState(prev => {
      if (quantity <= 0) {
        const updatedItems = prev.items.filter(item => item.id !== productId)
        saveCart(updatedItems)
        return { ...prev, items: updatedItems }
      }

      const updatedItems = prev.items.map(item =>
        item.id === productId
          ? { ...item, quantity: Math.min(quantity, item.stock) }
          : item
      )
      saveCart(updatedItems)
      return { ...prev, items: updatedItems }
    })
  }

  const removeFromCart = (productId: string) => {
    setState(prev => {
      const updatedItems = prev.items.filter(item => item.id !== productId)
      saveCart(updatedItems)
      return { ...prev, items: updatedItems }
    })
  }

  const clearCart = () => {
    setState(prev => {
      saveCart([])
      return { ...prev, items: [] }
    })
  }

  const getCartTotal = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getCartItemCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0)
  }

  const calculateDeliveryFee = (total: number) => {
    return total >= 500 ? 0 : 50
  }

  return {
    ...state,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemCount,
    calculateDeliveryFee,
    total: getCartTotal(),
    itemCount: getCartItemCount(),
    deliveryFee: calculateDeliveryFee(getCartTotal()),
    finalTotal: getCartTotal() + calculateDeliveryFee(getCartTotal())
  }
}