'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/auth/AuthModal';

export default function Header() {
  const { user, logout, loading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const handleAuthClick = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleLogout = async () => {
    await logout();
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
            </div>

            <nav className="nav">
              {loading ? (
                <div className="loading">Loading...</div>
              ) : user ? (
                <div className="user-menu">
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
    </>
  );
}
