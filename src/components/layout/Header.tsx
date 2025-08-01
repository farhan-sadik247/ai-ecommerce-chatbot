'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/auth/AuthModal';
import CartIcon from '@/components/cart/CartIcon';
import CartModal from '@/components/cart/CartModal';

export default function Header() {
  const { user, logout, loading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [cartModalOpen, setCartModalOpen] = useState(false);

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

  return (
    <>
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <Link href="/">
                <h1>ShoeBot</h1>
                <span>AI Shopping Assistant</span>
              </Link>
            </div>

            <div className="nav-links">
              <Link href="/products" className="nav-link">
                Products
              </Link>
              {user && (
                <>
                  <Link href="/orders" className="nav-link">
                    My Orders
                  </Link>
                  <Link href="/cart" className="nav-link">
                    Cart
                  </Link>
                </>
              )}
            </div>

            <nav className="nav">
              {loading ? (
                <div className="loading">Loading...</div>
              ) : user ? (
                <div className="user-menu">
                  <CartIcon onClick={handleCartClick} />
                  <span className="welcome">Welcome, {user.name}!</span>
                  <button onClick={handleLogout} className="logout-btn">
                    Logout
                  </button>
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
