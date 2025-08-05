import React, { createContext, useContext, ReactNode } from 'react'
import { useCart as useCartHook } from '../hooks/useCart'

const CartContext = createContext<ReturnType<typeof useCartHook> | undefined>(undefined)

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

interface CartProviderProps {
  children: ReactNode
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const cart = useCartHook()

  return (
    <CartContext.Provider value={cart}>
      {children}
    </CartContext.Provider>
  )
}
<boltContext.Provider value={cartContextValue}>
  {/* children */}
</boltContext.Provider>

