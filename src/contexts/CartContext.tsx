'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { Cart, ApiResponse } from '@/types';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  itemCount: number;
  addToCart: (productId: string, quantity: number, size: string, color: string) => Promise<boolean>;
  removeFromCart: (productId: string, size: string, color: string) => Promise<boolean>;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  const itemCount = cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/cart', {
        credentials: 'include'
      });

      if (response.ok) {
        const data: ApiResponse<Cart> = await response.json();
        if (data.success && data.data) {
          setCart(data.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addToCart = async (
    productId: string, 
    quantity: number, 
    size: string, 
    color: string
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, quantity, size, color }),
        credentials: 'include'
      });

      const data: ApiResponse<Cart> = await response.json();
      
      if (data.success && data.data) {
        setCart(data.data);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to add to cart:', error);
      return false;
    }
  };

  const removeFromCart = async (
    productId: string, 
    size: string, 
    color: string
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const response = await fetch('/api/cart/remove', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, size, color }),
        credentials: 'include'
      });

      const data: ApiResponse<Cart> = await response.json();
      
      if (data.success && data.data) {
        setCart(data.data);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      return false;
    }
  };

  const updateQuantity = async (
    productId: string, 
    size: string, 
    color: string, 
    quantity: number
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, size, color, quantity }),
        credentials: 'include'
      });

      const data: ApiResponse<Cart> = await response.json();
      
      if (data.success && data.data) {
        setCart(data.data);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to update cart:', error);
      return false;
    }
  };

  const clearCart = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        credentials: 'include'
      });

      const data: ApiResponse<Cart> = await response.json();
      
      if (data.success && data.data) {
        setCart(data.data);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to clear cart:', error);
      return false;
    }
  };

  // Load cart when user changes
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const value = {
    cart,
    loading,
    itemCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    refreshCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
