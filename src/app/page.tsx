'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="container">
        <div className="loading-page">
          <h1>Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="home-page">
        <div className="hero-section">
          <h1>Welcome to ShoeBot</h1>
          <p>Your AI-powered shoe shopping assistant</p>

          {user ? (
            <div className="welcome-user">
              <h2>Hello, {user.name}! 👋</h2>
              <p>Ready to find your perfect pair of shoes? Start chatting with our AI assistant!</p>
            </div>
          ) : (
            <div className="welcome-guest">
              <h2>Get Started</h2>
              <p>Please login or register to start shopping with our AI chatbot.</p>
            </div>
          )}
        </div>

        <div className="features">
          <div className="feature">
            <h3>🤖 AI Assistant</h3>
            <p>Chat naturally to find shoes that match your style and needs</p>
          </div>
          <div className="feature">
            <h3>👟 Wide Selection</h3>
            <p>Browse through our curated collection of quality shoes</p>
          </div>
          <div className="feature">
            <h3>🛒 Easy Shopping</h3>
            <p>Add items to cart and checkout seamlessly through conversation</p>
          </div>
        </div>
      </div>
    </div>
  );
}
