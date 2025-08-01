'use client';

import Image from 'next/image';
import { useState } from 'react';
import { CartItem as CartItemType, Product } from '@/types';
import { useCart } from '@/contexts/CartContext';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart();
  const [updating, setUpdating] = useState(false);

  // Handle both populated and non-populated product data
  const product = item.product || (item.productId as unknown as Product) || {} as Product;

  // Safety check - if no product data, don't render
  if (!product || !product.name) {
    console.error('CartItem: Missing product data', item);
    return null;
  }

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity === item.quantity) return;
    
    setUpdating(true);
    try {
      await updateQuantity(
        item.productId.toString(), 
        item.size, 
        item.color, 
        newQuantity
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleRemove = async () => {
    setUpdating(true);
    try {
      await removeFromCart(
        item.productId.toString(), 
        item.size, 
        item.color
      );
    } finally {
      setUpdating(false);
    }
  };

  const subtotal = item.price * item.quantity;

  return (
    <div className={`cart-item ${updating ? 'updating' : ''}`}>
      <div className="cart-item-image">
        <Image
          src={product.image}
          alt={product.name}
          width={80}
          height={80}
          className="image"
        />
      </div>

      <div className="cart-item-details">
        <div className="cart-item-header">
          <h4 className="product-name">{product.name}</h4>
          <span className="product-brand">{product.brand}</span>
        </div>

        <div className="cart-item-options">
          <span className="option">Size: {item.size}</span>
          <span className="option">Color: {item.color}</span>
        </div>

        <div className="cart-item-price">
          <span className="unit-price">${item.price.toFixed(2)} each</span>
          <span className="subtotal">${subtotal.toFixed(2)}</span>
        </div>
      </div>

      <div className="cart-item-controls">
        <div className="quantity-controls">
          <button
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={updating || item.quantity <= 1}
            className="quantity-btn"
          >
            -
          </button>
          <span className="quantity">{item.quantity}</span>
          <button
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={updating || item.quantity >= 10}
            className="quantity-btn"
          >
            +
          </button>
        </div>

        <button
          onClick={handleRemove}
          disabled={updating}
          className="remove-btn"
        >
          {updating ? 'Removing...' : 'Remove'}
        </button>
      </div>
    </div>
  );
}
