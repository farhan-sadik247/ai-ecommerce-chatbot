'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProductGrid from '@/components/products/ProductGrid';
import { Product } from '@/types';

export default function ProductsPage() {
  const router = useRouter();

  const handleViewDetails = (product: Product) => {
    router.push(`/products/${product._id}`);
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
