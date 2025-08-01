'use client';

import { useState } from 'react';

interface FiltersType {
  category: string;
  brand: string;
  gender: string;
  minPrice: string;
  maxPrice: string;
  search: string;
  sortBy: string;
  sortOrder: string;
}

interface ProductFiltersProps {
  filters: FiltersType;
  availableFilters: {
    categories: string[];
    brands: string[];
    genders: string[];
  };
  onFilterChange: (filters: FiltersType) => void;
}

export default function ProductFilters({ filters, availableFilters, onFilterChange }: ProductFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: FiltersType = {
      category: '',
      brand: '',
      gender: '',
      minPrice: '',
      maxPrice: '',
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => 
    key !== 'sortBy' && key !== 'sortOrder' && value !== ''
  );

  return (
    <div className="product-filters">
      <div className="filters-header">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search shoes..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters-controls">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="toggle-filters-btn"
          >
            Filters {hasActiveFilters && <span className="active-indicator">•</span>}
          </button>

          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              handleFilterChange('sortBy', sortBy);
              handleFilterChange('sortOrder', sortOrder);
            }}
            className="sort-select"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>
        </div>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filters-grid">
            <div className="filter-group">
              <label>Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="filter-select"
              >
                <option value="">All Categories</option>
                {availableFilters.categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Brand</label>
              <select
                value={filters.brand}
                onChange={(e) => handleFilterChange('brand', e.target.value)}
                className="filter-select"
              >
                <option value="">All Brands</option>
                {availableFilters.brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Gender</label>
              <select
                value={filters.gender}
                onChange={(e) => handleFilterChange('gender', e.target.value)}
                className="filter-select"
              >
                <option value="">All Genders</option>
                {availableFilters.genders.map((gender) => (
                  <option key={gender} value={gender}>
                    {gender.charAt(0).toUpperCase() + gender.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Price Range</label>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="price-input"
                  min="0"
                />
                <span>to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="price-input"
                  min="0"
                />
              </div>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="filters-actions">
              <button onClick={handleClearFilters} className="clear-filters-btn">
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
