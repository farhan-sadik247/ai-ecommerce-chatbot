'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { ApiResponse } from '@/types';
import './ChatWidget.scss';

interface ChatMessage {
  id: string;
  message: string;
  response: string;
  timestamp: Date;
  isUser: boolean;
  intent?: string;
  products?: any[];
}

interface ChatWidgetProps {
  className?: string;
}

export default function ChatWidget({ className }: ChatWidgetProps) {
  const { user } = useAuth();
  const { refreshCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Format message text with HTML styling
  const formatMessage = (text: string) => {
    // Convert markdown-like formatting to HTML
    let formatted = text
      // Convert **bold** to <strong>
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Convert *italic* to <em>
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Convert bullet points (• or -)
      .replace(/^[•-]\s*(.*$)/gim, '<li>$1</li>')
      // Convert numbered lists
      .replace(/^\d+\.\s*(.*$)/gim, '<li>$1</li>')
      // Convert price patterns like $99.99 or ৳1,500
      .replace(/(\$\d+(?:\.\d{2})?|৳[\d,]+)/g, '<span class="price">$1</span>')
      // Convert product names in quotes or after **
      .replace(/"([^"]+)"/g, '<span class="product-name">"$1"</span>')
      .replace(/\*\*([^*]+)\*\*/g, '<span class="product-name">$1</span>');

    // Split by double line breaks to create sections
    const sections = formatted.split(/\n\s*\n/);

    formatted = sections.map(section => {
      const lines = section.split('\n');
      let processedSection = '';
      let currentList = [];
      let inList = false;

      for (const line of lines) {
        if (line.includes('<li>')) {
          currentList.push(line);
          inList = true;
        } else {
          if (inList && currentList.length > 0) {
            processedSection += `<ul>${currentList.join('')}</ul>`;
            currentList = [];
            inList = false;
          }
          if (line.trim()) {
            processedSection += `<p>${line}</p>`;
          }
        }
      }

      // Handle remaining list items
      if (currentList.length > 0) {
        processedSection += `<ul>${currentList.join('')}</ul>`;
      }

      return processedSection;
    }).join('');

    // If no formatting was applied, wrap in paragraph
    if (!formatted.includes('<p>') && !formatted.includes('<ul>')) {
      formatted = `<p>${formatted}</p>`;
    }

    return formatted;
  };

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Initialize chat with welcome message
  useEffect(() => {
    if (user && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        message: '',
        response: `Hi ${user.name}! 👋 I'm your AI shopping assistant. I can help you find shoes, add items to your cart, or complete your checkout. What are you looking for today?`,
        timestamp: new Date(),
        isUser: false,
        intent: 'greeting'
      };
      setMessages([welcomeMessage]);
    }
  }, [user, messages.length]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !user) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      message: inputMessage,
      response: '',
      timestamp: new Date(),
      isUser: true
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          sessionId: sessionId || undefined
        }),
        credentials: 'include'
      });

      const data: ApiResponse<any> = await response.json();

      if (data.success && data.data) {
        const botMessage: ChatMessage = {
          id: `bot-${Date.now()}`,
          message: inputMessage,
          response: data.data.response,
          timestamp: new Date(),
          isUser: false,
          intent: data.data.intent,
          products: data.data.products
        };

        setMessages(prev => [...prev, botMessage]);

        if (data.data.sessionId && !sessionId) {
          setSessionId(data.data.sessionId);
        }

        // Refresh cart if it was updated
        if (data.data.cartUpdated) {
          refreshCart();
        }
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        message: inputMessage,
        response: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        isUser: false
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  if (!user) {
    return null; // Don't show chat if user is not logged in
  }

  return (
    <div className={`chat-widget ${className || ''}`}>
      {/* Chat Toggle Button */}
      <button 
        className={`chat-toggle ${isOpen ? 'open' : ''}`}
        onClick={toggleChat}
        aria-label="Toggle chat"
      >
        {isOpen ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )}
        {!isOpen && (
          <div className="chat-notification">
            <span>💬</span>
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="bot-avatar">
                <span>🤖</span>
              </div>
              <div className="bot-info">
                <h3>ShoeBot Assistant</h3>
                <span className="status">Online</span>
              </div>
            </div>
            <button 
              className="close-button"
              onClick={toggleChat}
              aria-label="Close chat"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.isUser ? 'user' : 'bot'}`}>
                {!msg.isUser && (
                  <div className="message-avatar">
                    <span>🤖</span>
                  </div>
                )}
                <div className="message-content">
                  <div
                    className="message-bubble"
                    dangerouslySetInnerHTML={{
                      __html: msg.isUser ? msg.message : formatMessage(msg.response || '')
                    }}
                  />
                  {msg.products && msg.products.length > 0 && (
                    <div className="product-suggestions">
                      {msg.products.map((product, index) => (
                        <div key={index} className="product-card">
                          <div className="product-info">
                            <h4>{product.name}</h4>
                            <p className="brand">{product.brand}</p>
                            <p className="price">${product.price}</p>
                            <div className="product-details">
                              <span className="colors">Colors: {product.colors.join(', ')}</span>
                              <span className="sizes">Sizes: {product.sizes.join(', ')}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="message-time">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {msg.isUser && (
                  <div className="message-avatar user-avatar">
                    <span>{user.name.charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="message bot">
                <div className="message-avatar">
                  <span>🤖</span>
                </div>
                <div className="message-content">
                  <div className="message-bubble typing">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chat-input">
            <div className="input-container">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about shoes, add to cart, or checkout..."
                disabled={isLoading}
                className="message-input"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="send-button"
                aria-label="Send message"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
                </svg>
              </button>
            </div>
            <div className="input-suggestions">
              <button onClick={() => setInputMessage("Show me running shoes")}>
                🏃 Running shoes
              </button>
              <button onClick={() => setInputMessage("What's in my cart?")}>
                🛒 View cart
              </button>
              <button onClick={() => setInputMessage("I'm ready to checkout")}>
                💳 Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
