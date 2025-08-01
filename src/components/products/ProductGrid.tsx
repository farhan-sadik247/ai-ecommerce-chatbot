'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import ProductCard from './ProductCard';

import { Product, ApiResponse } from '@/types';
import ProductFilters from './ProductFilters';

interface ProductGridProps {
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

export default function ProductGrid({ onViewDetails }: ProductGridProps) {
  const [productsData, setProductsData] = useState<ProductsData | null>(null);
  const [loading, setLoading] = useState(false);
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

  // Use abort controller to cancel ongoing requests
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchProducts = useCallback(async () => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: '9'
    });



    // Add non-empty filter values
    if (filters.category) params.append('category', filters.category);
    if (filters.brand) params.append('brand', filters.brand);
    if (filters.gender) params.append('gender', filters.gender);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/products?${params}`, {
        signal: abortController.signal
      });

      if (abortController.signal.aborted) {
        return;
      }

      const data: ApiResponse<ProductsData> = await response.json();

      if (data.success && data.data) {
        setProductsData(data.data);
      } else {
        setError(data.error || 'Failed to fetch products');
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return;
      }
      console.error('Fetch products error:', error);
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
    }
  }, [
    currentPage,
    filters.category,
    filters.brand,
    filters.gender,
    filters.minPrice,
    filters.maxPrice,
    filters.search,
    filters.sortBy,
    filters.sortOrder
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);



  // Cleanup effect to cancel ongoing requests
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleFilterChange = useCallback((newFilters: typeof filters) => {
    // Only reset page if filters actually changed
    const filtersChanged = JSON.stringify(filters) !== JSON.stringify(newFilters);
    if (filtersChanged) {
      setFilters(newFilters);
      setCurrentPage(1); // Reset to first page when filters change
    }
  }, [filters]);

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
                  onViewDetails={onViewDetails}
                />
              ))}
            </div>

            {productsData.pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(productsData.pagination.currentPage - 1)}
                  disabled={!productsData.pagination.hasPrevPage}
                  className="pagination-btn"
                >
                  Previous
                </button>

                <div className="pagination-info">
                  Page {productsData.pagination.currentPage} of {productsData.pagination.totalPages}
                </div>

                <button
                  onClick={() => handlePageChange(productsData.pagination.currentPage + 1)}
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
