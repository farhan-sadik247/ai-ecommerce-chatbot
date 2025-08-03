'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/auth/AuthModal';
import CartIcon from '@/components/cart/CartIcon';
import CartModal from '@/components/cart/CartModal';
import './Header.scss';

export default function Header() {
  const { user, logout, loading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleAuthClick = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleCartClick = () => {
    setCartModalOpen(true);
  };

  const handleCheckout = () => {
    setCartModalOpen(false);
    window.location.href = '/checkout';
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <Link href="/">
                <h1>ShoeBay</h1>
                <span>AI-Powered Shopping</span>
              </Link>
            </div>



            <nav className="nav">
              {loading ? (
                <div className="loading">Loading...</div>
              ) : user ? (
                <div className="user-menu">
                  <CartIcon onClick={handleCartClick} />

                  <div className="user-dropdown" ref={dropdownRef}>
                    <button
                      className="user-dropdown-trigger"
                      onClick={toggleDropdown}
                    >
                      <div className="user-avatar">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="user-name">{user.name}</span>
                      <svg
                        className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`}
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                      >
                        <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none"/>
                      </svg>
                    </button>

                    {dropdownOpen && (
                      <div className="dropdown-menu">
                        <Link
                          href="/profile"
                          className="dropdown-item"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                          </svg>
                          <div>
                            <div className="item-label">Profile</div>
                            <div className="item-description">Manage your account</div>
                          </div>
                        </Link>
                        <Link
                          href="/orders"
                          className="dropdown-item"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z"/>
                          </svg>
                          <div>
                            <div className="item-label">My Orders</div>
                            <div className="item-description">Track your purchases</div>
                          </div>
                        </Link>
                        <Link
                          href="/cart"
                          className="dropdown-item"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                          </svg>
                          <div>
                            <div className="item-label">Shopping Cart</div>
                            <div className="item-description">View your items</div>
                          </div>
                        </Link>
                        <div className="dropdown-divider"></div>
                        <button
                          onClick={() => {
                            handleLogout();
                            setDropdownOpen(false);
                          }}
                          className="dropdown-item logout"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M16 17v-3H9v-4h7V7l5 5-5 5M14 2a2 2 0 0 1 2 2v2h-2V4H5v16h9v-2h2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9z"/>
                          </svg>
                          <div>
                            <div className="item-label">Sign Out</div>
                            <div className="item-description">End your session</div>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="auth-buttons">
                  <button
                    onClick={() => handleAuthClick('login')}
                    className="login-btn"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => handleAuthClick('register')}
                    className="register-btn"
                  >
                    Register
                  </button>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          // Refresh user data after successful auth
          window.location.reload();
        }}
        initialMode={authMode}
      />

      <CartModal
        isOpen={cartModalOpen}
        onClose={() => setCartModalOpen(false)}
        onCheckout={handleCheckout}
      />
    </>
  );
}
