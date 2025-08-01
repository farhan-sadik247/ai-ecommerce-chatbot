'use client';

import { useState, useEffect, useCallback } from 'react';
import ProductCard from './ProductCard';
import ProductFilters from './ProductFilters';
import { Product, ApiResponse } from '@/types';

interface ProductGridProps {
  onAddToCart?: (product: Product) => void;
  onViewDetails?: (product: Product) => void;
}

interface ProductsData {
  products: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters: {
    categories: string[];
    brands: string[];
    genders: string[];
  };
}

export default function ProductGrid({ onAddToCart, onViewDetails }: ProductGridProps) {
  const [productsData, setProductsData] = useState<ProductsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    category: '',
    brand: '',
    gender: '',
    minPrice: '',
    maxPrice: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...Object.fromEntries(
          Object.entries(filters).filter(([, value]) => value !== '')
        )
      });

      const response = await fetch(`/api/products?${params}`);
      const data: ApiResponse<ProductsData> = await response.json();

      if (data.success && data.data) {
        setProductsData(data.data);
      } else {
        setError(data.error || 'Failed to fetch products');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="products-loading">
        <div className="loading-spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-error">
        <p>Error: {error}</p>
        <button onClick={fetchProducts} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  if (!productsData) {
    return (
      <div className="products-error">
        <p>No products data available</p>
      </div>
    );
  }

  return (
    <div className="products-container">
      <div className="products-header">
        <h2>Our Shoe Collection</h2>
        <p>Discover the perfect pair for every occasion</p>
      </div>

      <ProductFilters
        filters={filters}
        availableFilters={productsData.filters}
        onFilterChange={handleFilterChange}
      />

      <div className="products-results">
        <div className="results-info">
          <p>
            Showing {productsData.products.length} of {productsData.pagination.totalProducts} products
            {filters.search && ` for "${filters.search}"`}
          </p>
        </div>

        {productsData.products.length === 0 ? (
          <div className="no-products">
            <h3>No products found</h3>
            <p>Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <>
            <div className="products-grid">
              {productsData.products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onAddToCart={onAddToCart}
                  onViewDetails={onViewDetails}
                />
              ))}
            </div>

            {productsData.pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!productsData.pagination.hasPrevPage}
                  className="pagination-btn"
                >
                  Previous
                </button>

                <div className="pagination-info">
                  Page {productsData.pagination.currentPage} of {productsData.pagination.totalPages}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!productsData.pagination.hasNextPage}
                  className="pagination-btn"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
