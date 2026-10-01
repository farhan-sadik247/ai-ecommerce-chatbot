'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect, useRef, useCallback } from 'react';
import AuthModal from '@/components/auth/AuthModal';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import './home.scss';

const CATEGORIES = [
  { id: 'boots',        label: 'Boots',        emoji: '🥾', color: '#c0392b', bg: '#fff5f5' },
  { id: 'sneakers',     label: 'Sneakers',      emoji: '👟', color: '#2980b9', bg: '#f0f8ff' },
  { id: 'loafers',      label: 'Loafers',       emoji: '🩴', color: '#8e44ad', bg: '#f9f0ff' },
  { id: 'sandals',      label: 'Sandals',       emoji: '🌴', color: '#16a085', bg: '#f0fff8' },
  { id: 'flip_flops',   label: 'Flip Flops',    emoji: '🏖️', color: '#d35400', bg: '#fff8f0' },
  { id: 'soccer_shoes', label: 'Soccer Shoes',  emoji: '⚽', color: '#27ae60', bg: '#f0fff4' },
];

interface CategoryProducts { [key: string]: Product[] }

/* ─── Smooth Category Carousel ─────────────────────────── */
function CategoryCarousel({ category, products }: { category: typeof CATEGORIES[0]; products: Product[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener('scroll', sync, { passive: true });
    sync();
    return () => el.removeEventListener('scroll', sync);
  }, [sync, products]);

  const scroll = (dir: 'l' | 'r') =>
    trackRef.current?.scrollBy({ left: dir === 'l' ? -340 : 340, behavior: 'smooth' });

  if (!products?.length) return null;

  return (
    <section className="cat-section">
      <div className="container">
        {/* Header */}
        <div className="cat-header">
          <div className="cat-title-group">
            <div className="cat-icon" style={{ background: category.bg, color: category.color }}>
              {category.emoji}
            </div>
            <div>
              <h2 className="cat-title" style={{ '--accent': category.color } as React.CSSProperties}>
                {category.label}
              </h2>
              <p className="cat-count">{products.length} styles available</p>
            </div>
          </div>
          <div className="cat-nav">
            <button className={`nav-arrow ${canLeft ? '' : 'off'}`} onClick={() => scroll('l')} disabled={!canLeft}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <button className={`nav-arrow ${canRight ? '' : 'off'}`} onClick={() => scroll('r')} disabled={!canRight}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
            <Link href={`/products?category=${category.id}`} className="cat-view-all" style={{ color: category.color }}>
              View all →
            </Link>
          </div>
        </div>

        {/* Track */}
        <div className="cat-track-wrap">
          <div className="cat-track" ref={trackRef}>
            {products.map((product) => (
              <Link key={product._id} href={`/products/${product._id}`} className="shoe-card">
                <div className="shoe-card-img" style={{ background: category.bg }}>
                  <Image
                    src={product.image || '/placeholder-shoe.jpg'}
                    alt={product.name}
                    fill
                    sizes="(max-width: 600px) 200px, 280px"
                    className="shoe-img"
                  />
                  <div className="shoe-card-hover" style={{ background: `${category.color}cc` }}>
                    <span className="quick-view">Quick View ↗</span>
                  </div>
                </div>
                <div className="shoe-card-info">
                  <span className="shoe-brand">{product.brand}</span>
                  <h3 className="shoe-name">{product.name}</h3>
                  <div className="shoe-row">
                    <span className="shoe-price" style={{ color: category.color }}>${product.price.toFixed(2)}</span>
                    <span className="shoe-meta">{product.sizes.length} sizes</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Home Page ─────────────────────────────────────────── */
export default function Home() {
  const { user, loading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [categoryProducts, setCategoryProducts] = useState<CategoryProducts>({});
  const [fetching, setFetching] = useState(true);

  const openAuth = (mode: 'login' | 'register') => { setAuthMode(mode); setAuthModalOpen(true); };

  useEffect(() => {
    (async () => {
      try {
        const byCategory: CategoryProducts = {};
        await Promise.all(CATEGORIES.map(async (cat) => {
          const res = await fetch(`/api/products?category=${cat.id}&limit=12`);
          const data = await res.json();
          if (data.success && data.data?.products) byCategory[cat.id] = data.data.products;
        }));
        setCategoryProducts(byCategory);
      } catch (e) { console.error(e); }
      finally { setFetching(false); }
    })();
  }, []);

  if (loading) return (
    <div className="splash">
      <div className="splash-spinner" />
      <p>Loading ShoeBay…</p>
    </div>
  );


  return (
    <div className="home-page">

      {/* ═══════════ HERO ═══════════ */}
      <section className="hero">
        {/* Ambient blobs */}
        <div className="hero-blob blob-1" />
        <div className="hero-blob blob-2" />
        <div className="hero-blob blob-3" />

        <div className="container hero-inner">
          {/* ── Left ── */}
          <div className="hero-left">
            <div className="hero-badge">
              <span className="badge-dot" />
              AI-Powered Shopping
            </div>

            <h1 className="hero-headline">
              Find Your<br />
              <span className="hero-gradient-word">Perfect</span>{' '}
              <span className="hero-outline-word">Pair</span>
            </h1>

            <p className="hero-sub">
              Discover 215+ premium shoes across 6 categories. Let our AI assistant guide you to your ideal match.
            </p>

            {user ? (
              <div className="hero-cta">
                <Link href="/products" className="cta-primary">
                  Shop Now
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </Link>
                <Link href="/cart" className="cta-ghost">View Cart</Link>
                <p className="hero-welcome">Welcome back, <strong>{user.name}</strong> 👋</p>
              </div>
            ) : (
              <div className="hero-cta">
                <button onClick={() => openAuth('register')} className="cta-primary">
                  Get Started Free
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </button>
                <button onClick={() => openAuth('login')} className="cta-ghost">Sign In</button>
              </div>
            )}

            {/* Stats */}
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-num">215+</span>
                <span className="stat-label">Styles</span>
              </div>
              <div className="stat-divider" />
              <div className="stat">
                <span className="stat-num">6</span>
                <span className="stat-label">Categories</span>
              </div>
              <div className="stat-divider" />
              <div className="stat">
                <span className="stat-num">Free</span>
                <span className="stat-label">Shipping</span>
              </div>
              <div className="stat-divider" />
              <div className="stat">
                <span className="stat-num">AI</span>
                <span className="stat-label">Assistant</span>
              </div>
            </div>
          </div>

          {/* ── Right ── */}
          <div className="hero-right">
            <div className="hero-showcase">

              {/* ── Decorative animated rings ── */}
              <div className="shoe-stage">

                {/* Orbiting rings */}
                <div className="orbit orbit-1" />
                <div className="orbit orbit-2" />
                <div className="orbit orbit-3" />

                {/* Pulsing halo rings */}
                <div className="halo halo-1" />
                <div className="halo halo-2" />
                <div className="halo halo-3" />

                {/* Floating sparkle dots */}
                <div className="spark spark-1" />
                <div className="spark spark-2" />
                <div className="spark spark-3" />
                <div className="spark spark-4" />
                <div className="spark spark-5" />

                {/* Ground glow */}
                <div className="shoe-glow-ground" />

                {/* The shoe — floats up/down */}
                <div className="shoe-float">
                  <Image
                    src="/assets/sneaker.png"
                    alt="ShoeBay Hero Sneaker"
                    width={480}
                    height={380}
                    className="hero-shoe-photo"
                    style={{ width: '100%', height: 'auto' }}
                    priority
                  />
                </div>
              </div>

              {/* Floating chip — top left */}
              <div className="hero-chip chip-top">
                <span className="chip-price">215+</span>
                <span className="chip-name">Premium Styles</span>
              </div>

              {/* Floating chip — bottom right */}
              <div className="hero-chip chip-bottom">
                <span className="chip-badge">✦ AI Powered</span>
                <span className="chip-brand">ShoeBay</span>
              </div>

            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="hero-wave">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#f8f9ff" />
          </svg>
        </div>
      </section>

      {/* ═══════════ CATEGORY PILLS ═══════════ */}
      <section className="pills-section">
        <div className="container">
          <div className="pills-row">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.id}`}
                className="pill"
                style={{ '--pill-color': cat.color, '--pill-bg': cat.bg } as React.CSSProperties}
              >
                <span className="pill-emoji">{cat.emoji}</span>
                <span>{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CATEGORY CAROUSELS ═══════════ */}
      {fetching ? (
        <div className="fetch-loading">
          <div className="splash-spinner small" />
          <p>Loading collections…</p>
        </div>
      ) : (
        CATEGORIES.map(cat => (
          <CategoryCarousel key={cat.id} category={cat} products={categoryProducts[cat.id] || []} />
        ))
      )}

      {/* ═══════════ FOOTER ═══════════ */}
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
                  {CATEGORIES.map(cat => (
                    <li key={cat.id}><Link href={`/products?category=${cat.id}`}>{cat.label}</Link></li>
                  ))}
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
            <p>&copy; {new Date().getFullYear()} ShoeBay. All rights reserved.</p>
            <p>Developed by <span className="developer-name">MD. FARHAN SADIK</span></p>
          </div>
        </div>
      </footer>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} onSuccess={() => setAuthModalOpen(false)} initialMode={authMode} />
    </div>
  );
}
