'use client';

import Image from 'next/image';
import { useState, useCallback } from 'react';
import { Product } from '@/types';
import AddToCartModal from '@/components/cart/AddToCartModal';

interface ProductCardProps {
  product: Product;
  onViewDetails?: (product: Product) => void;
}

export default function ProductCard({ product, onViewDetails }: ProductCardProps) {
  const [addToCartModalOpen, setAddToCartModalOpen] = useState(false);

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAddToCartModalOpen(true);
  }, []);

  const handleViewDetails = useCallback(() => {
    if (onViewDetails) {
      onViewDetails(product);
    }
  }, [onViewDetails, product]);

  const handleAddToCartSuccess = useCallback(() => {
    // Could show a success message here
    console.log('Item added to cart successfully!');
  }, []);

  const handleCloseModal = useCallback(() => {
    setAddToCartModalOpen(false);
  }, []);

  return (
    <div className="product-card-wrapper">
      <div className="product-card">
        <div className="product-image">
          <Image
            src={product.image}
            alt={product.name}
            width={300}
            height={300}
            className="image"
            priority={false}
          />
          {product.stock <= 5 && product.stock > 0 && (
            <div className="low-stock-badge">Only {product.stock} left!</div>
          )}
          {product.stock === 0 && (
            <div className="out-of-stock-badge">Out of Stock</div>
          )}
        </div>

      <div className="product-info">
        <div className="product-header">
          <h3 className="product-name">{product.name}</h3>
          <span className="product-brand">{product.brand}</span>
        </div>

        <p className="product-description">{product.description}</p>

        <div className="product-details">
          <div className="product-category">
            <span className="category-badge">{product.category}</span>
            <span className="gender-badge">{product.gender}</span>
          </div>

          <div className="product-colors">
            <span className="colors-label">Colors:</span>
            <div className="colors-list">
              {product.colors.slice(0, 3).map((color, index) => (
                <span key={index} className="color-item">{color}</span>
              ))}
              {product.colors.length > 3 && (
                <span className="color-more">+{product.colors.length - 3} more</span>
              )}
            </div>
          </div>

          <div className="product-sizes">
            <span className="sizes-label">Sizes:</span>
            <div className="sizes-list">
              {product.sizes.slice(0, 4).map((size, index) => (
                <span key={index} className="size-item">{size}</span>
              ))}
              {product.sizes.length > 4 && (
                <span className="size-more">+{product.sizes.length - 4} more</span>
              )}
            </div>
          </div>
        </div>

        <div className="product-footer">
          <div className="product-price">
            <span className="price">${product.price.toFixed(2)}</span>
            <span className="stock-info">
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          <div className="product-actions">
            <button 
              onClick={handleViewDetails}
              className="view-details-btn"
            >
              View Details
            </button>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="add-to-cart-btn"
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>

      <AddToCartModal
        product={product}
        isOpen={addToCartModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleAddToCartSuccess}
      />
      </div>
    </div>
  );
}
