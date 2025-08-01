'use client';

import { useAuth } from '@/contexts/AuthContext';
import ProductGrid from '@/components/products/ProductGrid';
import { Product } from '@/types';

export default function ProductsPage() {
  const { user } = useAuth();

  const handleAddToCart = (product: Product) => {
    if (!user) {
      alert('Please login to add items to cart');
      return;
    }
    
    // TODO: Implement add to cart functionality
    console.log('Adding to cart:', product);
    alert(`Added ${product.name} to cart!`);
  };

  const handleViewDetails = (product: Product) => {
    // TODO: Implement product details modal or navigation
    console.log('Viewing details for:', product);
    alert(`Viewing details for ${product.name}`);
  };

  return (
    <div className="container">
      <ProductGrid
        onAddToCart={handleAddToCart}
        onViewDetails={handleViewDetails}
      />
    </div>
  );
}
