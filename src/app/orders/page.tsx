'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import '@/styles/orders.css';

interface Order {
  _id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentInfo: {
    method: string;
  };
  createdAt: string;
  items: Array<{
    productName: string;
    quantity: number;
  }>;
}

interface OrdersResponse {
  orders: Order[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalOrders: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<OrdersResponse['pagination'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders?page=${currentPage}&limit=10`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setOrders(data.data.orders);
          setPagination(data.data.pagination);
        } else {
          setError(data.error || 'Failed to fetch orders');
        }
      } else {
        setError('Failed to fetch orders');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    if (!user) {
      // Don't redirect, just show login message
      setLoading(false);
      return;
    }

    fetchOrders();
  }, [user, fetchOrders]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#10b981';
      case 'processing': return '#3b82f6';
      case 'shipped': return '#8b5cf6';
      case 'delivered': return '#059669';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const handleCancelOrder = async (orderId: string, orderNumber: string) => {
    if (!window.confirm(`Are you sure you want to cancel order #${orderNumber}?`)) {
      return;
    }

    setCancellingOrder(orderId);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'cancel_order' }),
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        // Refresh orders list
        fetchOrders();
        alert('Order cancelled successfully');
      } else {
        alert(data.error || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Cancel order error:', error);
      alert('Failed to cancel order. Please try again.');
    } finally {
      setCancellingOrder(null);
    }
  };

  if (!user) {
    return (
      <div className="container">
        <div className="orders-error">
          <h3>Please Login</h3>
          <p>You need to be logged in to view your orders.</p>
          <Link href="/products" className="btn btn-primary">Go to Products</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container">
        <div className="orders-loading">
          <div className="loading-spinner"></div>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="orders-error">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={fetchOrders} className="btn btn-primary">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="orders-page">
        <div className="orders-header">
          <div className="header-content">
            <h1>My Orders</h1>
            <p>Track and manage your orders</p>
          </div>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-number">{pagination?.totalOrders || orders.length}</span>
              <span className="stat-label">Total Orders</span>
            </div>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="no-orders">
            <div className="no-orders-icon">📦</div>
            <h3>No Orders Yet</h3>
            <p>You haven&apos;t placed any orders yet. Start shopping to see your orders here.</p>
            <Link href="/products" className="btn btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <>
            <div className="orders-grid">
              {orders.map((order) => (
                <div key={order._id} className="modern-order-card">
                  <div className="order-card-header">
                    <div className="order-number">
                      <span className="order-hash">#</span>
                      <span className="order-id">{order.orderNumber}</span>
                    </div>
                    <div className="order-badges">
                      <span
                        className={`status-badge status-${order.status}`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <span
                        className={`payment-badge payment-${order.paymentStatus}`}
                      >
                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="order-card-content">
                    <div className="order-meta">
                      <div className="meta-item">
                        <span className="meta-icon">📅</span>
                        <span className="meta-text">{new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-icon">💳</span>
                        <span className="meta-text">{order.paymentInfo.method === 'bkash' ? 'bKash' : 'Cash on Delivery'}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-icon">📦</span>
                        <span className="meta-text">{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    <div className="order-items-preview">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="preview-item">
                          <span className="item-name">{item.productName}</span>
                          <span className="item-qty">×{item.quantity}</span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="preview-item more-items">
                          <span className="more-text">+{order.items.length - 3} more</span>
                        </div>
                      )}
                    </div>

                    <div className="order-total-section">
                      <span className="total-label">Total Amount</span>
                      <span className="total-amount">৳{order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="order-card-actions">
                    <Link
                      href={`/orders/${order._id}`}
                      className="btn btn-primary view-details-btn"
                    >
                      <span>View Details</span>
                      <span className="btn-icon">→</span>
                    </Link>
                    {(order.status === 'pending' || order.status === 'confirmed') && (
                      <button
                        onClick={() => handleCancelOrder(order._id, order.orderNumber)}
                        disabled={cancellingOrder === order._id}
                        className="btn btn-outline cancel-btn"
                      >
                        {cancellingOrder === order._id ? (
                          <>
                            <span className="loading-spinner"></span>
                            <span>Cancelling...</span>
                          </>
                        ) : (
                          <>
                            <span>Cancel</span>
                            <span className="btn-icon">×</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="modern-pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={!pagination.hasPrevPage}
                  className="pagination-btn"
                >
                  <span>←</span>
                  <span>Previous</span>
                </button>

                <div className="pagination-info">
                  <span className="current-page">{pagination.currentPage}</span>
                  <span className="separator">of</span>
                  <span className="total-pages">{pagination.totalPages}</span>
                </div>

                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!pagination.hasNextPage}
                  className="pagination-btn"
                >
                  <span>Next</span>
                  <span>→</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
