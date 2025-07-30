import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';
import { Product, CartItem, CartContextType } from '../types';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Load cart from API if user is logged in
      loadCart();
    } else {
      // Load cart from localStorage for guest users
      const storedCart = localStorage.getItem('kr_stores_cart');
      if (storedCart) {
        setItems(JSON.parse(storedCart));
      }
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      // Save cart to localStorage for guest users
      localStorage.setItem('kr_stores_cart', JSON.stringify(items));
    }
  }, [items]);

  const loadCart = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await cartAPI.get();
      if (response.data.success && response.data.data.cart.items) {
        const cartItems = response.data.data.cart.items.map((item: any) => ({
          product: item.product,
          quantity: item.quantity
        }));
        setItems(cartItems);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      // Fallback to localStorage
      const storedCart = localStorage.getItem('kr_stores_cart');
      if (storedCart) {
        setItems(JSON.parse(storedCart));
      }
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product: Product, quantity: number = 1) => {
    if (user) {
      try {
        setLoading(true);
        await cartAPI.add(product.id, quantity);
        await loadCart(); // Reload cart from server
      } catch (error) {
        console.error('Error adding to cart:', error);
        // Fallback to local storage
        addToCartLocal(product, quantity);
      } finally {
        setLoading(false);
      }
    } else {
      addToCartLocal(product, quantity);
    }
  };

  const addToCartLocal = (product: Product, quantity: number = 1) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevItems, { product, quantity }];
      }
    });
  };

  const removeFromCart = async (productId: string) => {
    if (user) {
      try {
        setLoading(true);
        await cartAPI.remove(productId);
        await loadCart(); // Reload cart from server
      } catch (error) {
        console.error('Error removing from cart:', error);
        // Fallback to local storage
        setItems(prevItems => prevItems.filter(item => item.product.id !== productId));
      } finally {
        setLoading(false);
      }
    } else {
      setItems(prevItems => prevItems.filter(item => item.product.id !== productId));
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    if (user) {
      try {
        setLoading(true);
        await cartAPI.update(productId, quantity);
        await loadCart(); // Reload cart from server
      } catch (error) {
        console.error('Error updating cart:', error);
        // Fallback to local storage
        updateQuantityLocal(productId, quantity);
      } finally {
        setLoading(false);
      }
    } else {
      updateQuantityLocal(productId, quantity);
    }
  };

  const updateQuantityLocal = (productId: string, quantity: number) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = async () => {
    if (user) {
      try {
        setLoading(true);
        await cartAPI.clear();
        setItems([]);
      } catch (error) {
        console.error('Error clearing cart:', error);
        // Fallback to local storage
        setItems([]);
      } finally {
        setLoading(false);
      }
    } else {
      setItems([]);
    }
  };

  const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const value: CartContextType = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    total,
    itemCount,
    loading
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};