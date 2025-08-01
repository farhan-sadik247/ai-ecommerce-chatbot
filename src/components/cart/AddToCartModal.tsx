'use client';

import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

interface AddToCartModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddToCartModal({ product, isOpen, onClose, onSuccess }: AddToCartModalProps) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before rendering portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Define callbacks before early return
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const handleClose = useCallback(() => {
    setSelectedSize('');
    setSelectedColor('');
    setQuantity(1);
    setError('');
    onClose();
  }, [onClose]);

  // Don't render anything if not explicitly opened, no product, or not mounted
  if (!isOpen || !product || !mounted) {
    return null;
  }

  const handleAddToCart = async () => {
    if (!user) {
      setError('Please login to add items to cart');
      return;
    }

    if (!selectedSize) {
      setError('Please select a size');
      return;
    }

    if (!selectedColor) {
      setError('Please select a color');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const success = await addToCart(product._id, quantity, selectedSize, selectedColor);
      
      if (success) {
        if (onSuccess) onSuccess();
        // Show success message briefly before closing
        setError('');
        alert(`✅ ${product.name} added to cart successfully!`);
        onClose();
        // Reset form
        setSelectedSize('');
        setSelectedColor('');
        setQuantity(1);
      } else {
        setError('Failed to add item to cart');
      }
    } catch {
      setError('An error occurred while adding to cart');
    } finally {
      setLoading(false);
    }
  };



  const modalContent = (
    <div className="add-to-cart-modal-overlay" onClick={handleOverlayClick}>
      <div className="add-to-cart-modal-content">
        <div className="add-to-cart-modal-header">
          <h3>Add to Cart</h3>
          <button className="modal-close" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="add-to-cart-modal-body">
          <div className="product-preview">
            <Image
              src={product.image}
              alt={product.name}
              width={120}
              height={120}
              className="product-image"
            />
            <div className="product-info">
              <h4>{product.name}</h4>
              <p className="brand">{product.brand}</p>
              <p className="price">${product.price.toFixed(2)}</p>
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="selection-options">
            <div className="option-group">
              <label>Size:</label>
              <div className="size-options">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`size-option ${selectedSize === size ? 'selected' : ''}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="option-group">
              <label>Color:</label>
              <div className="color-options">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            <div className="option-group">
              <label>Quantity:</label>
              <div className="quantity-controls">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="quantity-btn"
                >
                  -
                </button>
                <span className="quantity">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  disabled={quantity >= 10}
                  className="quantity-btn"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button
              onClick={handleClose}
              className="cancel-btn"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleAddToCart}
              disabled={loading || !selectedSize || !selectedColor}
              className="add-to-cart-btn"
            >
              {loading ? 'Adding...' : `Add to Cart - $${(product.price * quantity).toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render modal in a portal to prevent CSS inheritance
  return createPortal(modalContent, document.body);
}
