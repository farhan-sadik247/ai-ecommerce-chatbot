'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import AuthModal from '@/components/auth/AuthModal';
import Link from 'next/link';
import { Product } from '@/types';
import './home.scss';

export default function Home() {
  const { user, loading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [heroProducts, setHeroProducts] = useState<Product[]>([]);

  const handleAuthClick = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products?limit=12');
        const data = await response.json();

        console.log('API Response:', data); // Debug log

        if (data.success && data.data && data.data.products) {
          const products = data.data.products;

          // Ensure products is an array
          if (!Array.isArray(products)) {
            console.error('Products is not an array:', products);
            return;
          }

          if (products.length > 0) {
            // Get random products for different sections
            const shuffled = [...products].sort(() => 0.5 - Math.random());
            setHeroProducts(shuffled.slice(0, 3));
            setFeaturedProducts(shuffled.slice(3, 9));
            setRecentProducts(shuffled.slice(9, 15));
          }
        } else {
          console.error('API Error:', data.error || 'No products found');
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading ShoeBay...</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
        </div>

        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Welcome to <span className="brand-name">ShoeBay</span>
              </h1>
              <p className="hero-subtitle">
                Your intelligent AI shopping assistant for the perfect pair of shoes.
                Chat with our advanced AI to discover, compare, and purchase shoes effortlessly.
              </p>

              {user ? (
                <div className="user-welcome">
                  <p className="welcome-text">
                    Welcome back, <span className="user-name">{user.name}</span>! 👋
                  </p>
                  <div className="hero-buttons">
                    <Link href="/products" className="btn btn-primary">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      Browse Products
                    </Link>
                    <Link href="/cart" className="btn btn-secondary">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                      </svg>
                      View Cart
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="auth-section">
                  <p className="auth-text">
                    Join thousands of happy customers and start your shoe shopping journey
                  </p>
                  <div className="hero-buttons">
                    <button
                      onClick={() => handleAuthClick('register')}
                      className="btn btn-primary"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      Get Started Free
                    </button>
                    <button
                      onClick={() => handleAuthClick('login')}
                      className="btn btn-secondary"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                      Sign In
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="hero-image">
              {heroProducts.map((product, index) => (
                <div key={product._id} className={`floating-card card-${index + 1}`}>
                  <div className="card-content">
                    <div className="shoe-image">
                      <img
                        src={product.image || '/placeholder-shoe.jpg'}
                        alt={product.name}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-shoe.jpg';
                        }}
                      />
                    </div>
                    <div className="card-text">
                      <h4>{product.name}</h4>
                      <p>${product.price.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Fallback cards if products haven't loaded */}
              {heroProducts.length === 0 && (
                <>
                  <div className="floating-card card-1">
                    <div className="card-content">
                      <div className="shoe-icon">👟</div>
                      <div className="card-text">
                        <h4>Nike Air Max</h4>
                        <p>$129.99</p>
                      </div>
                    </div>
                  </div>
                  <div className="floating-card card-2">
                    <div className="card-content">
                      <div className="shoe-icon">🥾</div>
                      <div className="card-text">
                        <h4>Timberland Boots</h4>
                        <p>$189.99</p>
                      </div>
                    </div>
                  </div>
                  <div className="floating-card card-3">
                    <div className="card-content">
                      <div className="shoe-icon">👠</div>
                      <div className="card-text">
                        <h4>Elegant Heels</h4>
                        <p>$89.99</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="products-section featured-products">
        <div className="container">
          <div className="section-header">
            <div className="section-title">
              <h2>Featured Products</h2>
              <p>Discover our handpicked selection of premium shoes</p>
            </div>
            <div className="carousel-controls">
              <button
                className="carousel-btn prev-btn"
                onClick={() => {
                  const carousel = document.querySelector('.featured-carousel');
                  if (carousel) {
                    carousel.scrollBy({ left: -300, behavior: 'smooth' });
                  }
                }}
              >
                ←
              </button>
              <button
                className="carousel-btn next-btn"
                onClick={() => {
                  const carousel = document.querySelector('.featured-carousel');
                  if (carousel) {
                    carousel.scrollBy({ left: 300, behavior: 'smooth' });
                  }
                }}
              >
                →
              </button>
            </div>
          </div>

          <div className="carousel-container">
            <div className="carousel featured-carousel">
              {featuredProducts.map((product) => (
                <div key={product._id} className="carousel-item">
                  <Link href={`/products/${product._id}`} className="gallery-link">
                    <div className="gallery-image">
                      <img
                        src={product.image || '/placeholder-shoe.jpg'}
                        alt={product.name}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-shoe.jpg';
                        }}
                      />
                      <div className="gallery-overlay">
                        <div className="gallery-info">
                          <h3>{product.name}</h3>
                          <p className="gallery-brand">{product.brand}</p>
                          <p className="gallery-price">${product.price.toFixed(2)}</p>
                        </div>
                        <div className="gallery-action">
                          <span>View Details</span>
                        </div>
                      </div>
                    </div>
                    <div className="product-info">
                      <h3>{product.name}</h3>
                      <p className="product-brand">{product.brand}</p>
                      <p className="product-price">${product.price.toFixed(2)}</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="section-footer">
            <Link href="/products" className="btn btn-primary">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Products Section */}
      <section className="products-section recent-products">
        <div className="container">
          <div className="section-header">
            <div className="section-title">
              <h2>Recently Added</h2>
              <p>Check out our latest arrivals and trending styles</p>
            </div>
            <div className="carousel-controls">
              <button
                className="carousel-btn prev-btn"
                onClick={() => {
                  const carousel = document.querySelector('.recent-carousel');
                  if (carousel) {
                    carousel.scrollBy({ left: -300, behavior: 'smooth' });
                  }
                }}
              >
                ←
              </button>
              <button
                className="carousel-btn next-btn"
                onClick={() => {
                  const carousel = document.querySelector('.recent-carousel');
                  if (carousel) {
                    carousel.scrollBy({ left: 300, behavior: 'smooth' });
                  }
                }}
              >
                →
              </button>
            </div>
          </div>

          <div className="carousel-container">
            <div className="carousel recent-carousel">
              {recentProducts.map((product) => (
                <div key={product._id} className="carousel-item">
                  <Link href={`/products/${product._id}`} className="gallery-link">
                    <div className="gallery-image">
                      <img
                        src={product.image || '/placeholder-shoe.jpg'}
                        alt={product.name}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-shoe.jpg';
                        }}
                      />
                      <div className="gallery-overlay">
                        <div className="gallery-info">
                          <h3>{product.name}</h3>
                          <p className="gallery-brand">{product.brand}</p>
                          <p className="gallery-price">${product.price.toFixed(2)}</p>
                        </div>
                        <div className="gallery-action">
                          <span>View Details</span>
                        </div>
                      </div>
                    </div>
                    <div className="product-info">
                      <h3>{product.name}</h3>
                      <p className="product-brand">{product.brand}</p>
                      <p className="product-price">${product.price.toFixed(2)}</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="section-footer">
            <Link href="/products" className="btn btn-primary">
              Browse More
            </Link>
          </div>
        </div>
      </section>



      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>ShoeBay</h3>
              <p>Your intelligent AI shopping assistant for the perfect pair of shoes.</p>
            </div>

            <div className="footer-links">
              <div className="footer-column">
                <h4>Shop</h4>
                <ul>
                  <li><Link href="/products">All Products</Link></li>
                  <li><Link href="/products?category=sneakers">Sneakers</Link></li>
                  <li><Link href="/products?category=boots">Boots</Link></li>
                  <li><Link href="/products?category=formal">Formal</Link></li>
                </ul>
              </div>

              <div className="footer-column">
                <h4>Account</h4>
                <ul>
                  <li><Link href="/profile">My Profile</Link></li>
                  <li><Link href="/orders">My Orders</Link></li>
                  <li><Link href="/cart">Shopping Cart</Link></li>
                </ul>
              </div>

              <div className="footer-column">
                <h4>Support</h4>
                <ul>
                  <li><a href="#help">Help Center</a></li>
                  <li><a href="#contact">Contact Us</a></li>
                  <li><a href="#shipping">Shipping Info</a></li>
                  <li><a href="#returns">Returns</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-copyright">
              <p>&copy; 2025 ShoeBay. All rights reserved.</p>
            </div>
            <div className="footer-credit">
              <p>Developed by <span className="developer-name">MD. FARHAN SADIK</span></p>
            </div>
          </div>
        </div>
      </footer>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
}
