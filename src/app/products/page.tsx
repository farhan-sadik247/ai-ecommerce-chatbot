'use client';

import { useEffect } from 'react';
import ProductGrid from '@/components/products/ProductGrid';
import { Product } from '@/types';

export default function ProductsPage() {
  const handleViewDetails = (product: Product) => {
    // TODO: Implement product details modal or navigation
    console.log('Viewing details for:', product);
    alert(`Viewing details for ${product.name}`);
  };

  // Auto-seed products if database is empty
  useEffect(() => {
    const checkAndSeedProducts = async () => {
      try {
        const response = await fetch('/api/seed');
        const data = await response.json();
        if (data.seeded) {
          console.log('Products seeded:', data.message);
        }
      } catch (error) {
        console.error('Failed to check/seed products:', error);
      }
    };

    checkAndSeedProducts();
  }, []);

  return (
    <div className="container">
      <ProductGrid
        onViewDetails={handleViewDetails}
      />
    </div>
  );
}
