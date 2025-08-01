'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import CartItem from './CartItem';

interface CartProps {
  onCheckout?: () => void;
}

export default function Cart({ onCheckout }: CartProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, loading, clearCart } = useCart();

  if (!user) {
    return (
      <div className="cart-container">
        <div className="cart-empty">
          <h3>Please Login</h3>
          <p>You need to be logged in to view your cart.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="cart-container">
        <div className="cart-loading">
          <div className="loading-spinner"></div>
          <p>Loading cart...</p>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="cart-container">
        <div className="cart-empty">
          <h3>Your Cart is Empty</h3>
          <p>Add some shoes to your cart to get started!</p>
        </div>
      </div>
    );
  }

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      await clearCart();
    }
  };

  const handleCheckout = () => {
    if (onCheckout) {
      onCheckout();
    } else {
      router.push('/checkout');
    }
  };

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h2>Shopping Cart</h2>
        <span className="cart-count">
          {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      <div className="cart-items">
        {cart.items.map((item, index) => (
          <CartItem
            key={`${item.productId || 'unknown'}-${item.size || 'no-size'}-${item.color || 'no-color'}-${index}`}
            item={item}
          />
        ))}
      </div>

      <div className="cart-summary">
        <div className="cart-total">
          <div className="total-row">
            <span className="total-label">Subtotal:</span>
            <span className="total-amount">${cart.totalAmount.toFixed(2)}</span>
          </div>
          <div className="total-row">
            <span className="total-label">Shipping:</span>
            <span className="total-amount">Free</span>
          </div>
          <div className="total-row total-final">
            <span className="total-label">Total:</span>
            <span className="total-amount">${cart.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <div className="cart-actions">
          <button
            onClick={handleClearCart}
            className="clear-cart-btn"
          >
            Clear Cart
          </button>
          <button
            onClick={handleCheckout}
            className="checkout-btn"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
