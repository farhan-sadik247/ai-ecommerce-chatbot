'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import '@/styles/order-details.css';

interface OrderItem {
  _id?: string;
  productId: {
    _id: string;
    name: string;
    image: string;
    brand: string;
  };
  productName: string;
  quantity: number;
  size: string;
  color: string;
  price: number;
  subtotal: number;
}

interface OrderDetails {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentInfo: {
    method: string;
    bkashTransactionId?: string;
    paymentDate?: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
}

function OrderDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingOrder, setCancellingOrder] = useState(false);
  const [cancellingItem, setCancellingItem] = useState<string | null>(null);

  const orderId = params.id as string;

  const fetchOrderDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setOrder(data.data);
        } else {
          setError(data.error || 'Failed to fetch order details');
        }
      } else if (response.status === 404) {
        setError('Order not found');
      } else {
        setError('Failed to fetch order details');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (!user) {
      // Don't redirect, just show login message
      setLoading(false);
      return;
    }

    if (!orderId) {
      router.push('/');
      return;
    }

    fetchOrderDetails();
  }, [orderId, user, router, fetchOrderDetails]);

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

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'failed': return '#ef4444';
      case 'refunded': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const handleCancelOrder = async () => {
    if (!order || !window.confirm('Are you sure you want to cancel this entire order?')) {
      return;
    }

    setCancellingOrder(true);
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
        setOrder(data.data);
        alert('Order cancelled successfully');
      } else {
        alert(data.error || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Cancel order error:', error);
      alert('Failed to cancel order. Please try again.');
    } finally {
      setCancellingOrder(false);
    }
  };

  const handleCancelItem = async (itemId: string, itemName: string) => {
    if (!order || !window.confirm(`Are you sure you want to cancel "${itemName}" from this order?`)) {
      return;
    }

    setCancellingItem(itemId);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'cancel_item', itemId }),
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        setOrder(data.data);
        alert('Item cancelled successfully');
      } else {
        alert(data.error || 'Failed to cancel item');
      }
    } catch (error) {
      console.error('Cancel item error:', error);
      alert('Failed to cancel item. Please try again.');
    } finally {
      setCancellingItem(null);
    }
  };

  if (!user) {
    return (
      <div className="container">
        <div className="order-error">
          <h3>Please Login</h3>
          <p>You need to be logged in to view order details.</p>
          <Link href="/products" className="btn btn-primary">Go to Products</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container">
        <div className="order-loading">
          <div className="loading-spinner"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="order-error">
          <h3>Error</h3>
          <p>{error}</p>
          <div className="error-actions">
            <Link href="/products" className="btn btn-primary">Continue Shopping</Link>
            <button onClick={() => window.history.back()} className="btn btn-secondary">Go Back</button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container">
        <div className="order-error">
          <h3>Order Not Found</h3>
          <p>The order you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.</p>
          <Link href="/products" className="btn btn-primary">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="order-details-page">
        <div className="order-header">
          <div className="order-title">
            <h1>Order #{order.orderNumber}</h1>
            <Link href="/orders" className="back-btn">
              <span>←</span>
              <span>Back to Orders</span>
            </Link>
          </div>

          <div className="order-meta">
            <div className="meta-group">
              <span className="meta-label">Order Date</span>
              <span className="meta-value">{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="meta-group">
              <span className="meta-label">Total Amount</span>
              <span className="meta-value">৳{order.totalAmount.toFixed(2)}</span>
            </div>
            <div className="meta-group">
              <span className="meta-label">Items</span>
              <span className="meta-value">{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
            </div>
          </div>

          <div className="order-badges">
            <span className={`status-badge status-${order.status}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
            <span className={`payment-status-badge payment-${order.paymentStatus}`}>
              Payment: {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
            </span>
          </div>
        </div>

        <div className="order-content">
          {/* Order Items */}
          <div className="order-section">
            <div className="section-header">
              <h3>Order Items</h3>
              <span className="items-count">{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
            </div>

            <div className="order-items-grid">
              {order.items.map((item, index) => (
                <div key={index} className="order-item-card">
                  <div className="item-number">#{index + 1}</div>

                  <div className="item-content">
                    <div className="item-image-section">
                      <Image
                        src={item.productId?.image || '/placeholder-product.jpg'}
                        alt={item.productName}
                        width={80}
                        height={80}
                        className="item-image"
                      />
                    </div>

                    <div className="item-details">
                      <h4 className="item-name">{item.productName}</h4>
                      <p className="item-brand">{item.productId?.brand}</p>
                      <div className="item-specs">
                        <span className="spec-item">Size: {item.size}</span>
                        <span className="spec-item">Color: {item.color}</span>
                      </div>
                    </div>

                    <div className="item-pricing">
                      <div className="price-info">
                        <span className="unit-price">৳{item.price.toFixed(2)} each</span>
                        <span className="quantity">Qty: {item.quantity}</span>
                      </div>
                      <div className="subtotal">৳{item.subtotal.toFixed(2)}</div>
                    </div>

                    <div className="item-actions">
                      {(order.status === 'pending' || order.status === 'confirmed') && (
                        <button
                          onClick={() => handleCancelItem(item._id || '', item.productName)}
                          disabled={cancellingItem === item._id}
                          className="cancel-item-btn"
                        >
                          {cancellingItem === item._id ? 'Cancelling...' : 'Cancel Item'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="order-section">
            <div className="section-header">
              <h3>Order Summary</h3>
            </div>

            <div className="summary-card">
              <div className="summary-row">
                <span>Subtotal ({order.items.length} items)</span>
                <span>৳{order.totalAmount.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="summary-row total-row">
                <span>Total</span>
                <span>৳{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment & Shipping Information */}
          <div className="order-section">
            <div className="section-header">
              <h3>Payment & Shipping Details</h3>
            </div>

            <div className="info-cards-grid">
              <div className="info-card">
                <h4>Payment Information</h4>
                <div className="info-content">
                  <div className="info-row">
                    <span className="label">Method:</span>
                    <span className="value">{order.paymentInfo.method === 'bkash' ? 'bKash Payment' : 'Cash on Delivery'}</span>
                  </div>
                  {order.paymentInfo.bkashTransactionId && (
                    <div className="info-row">
                      <span className="label">Transaction ID:</span>
                      <span className="value">{order.paymentInfo.bkashTransactionId}</span>
                    </div>
                  )}
                  <div className="info-row">
                    <span className="label">Status:</span>
                    <span className={`value status-${order.paymentStatus}`}>
                      {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </span>
                  </div>
                  {order.paymentInfo.paymentDate && (
                    <div className="info-row">
                      <span className="label">Payment Date:</span>
                      <span className="value">{new Date(order.paymentInfo.paymentDate).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="info-card">
                <h4>Shipping Address</h4>
                <div className="info-content">
                  <div className="address-text">
                    <p>{order.shippingAddress.street}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                    <p>{order.shippingAddress.country}</p>
                  </div>
                </div>
              </div>

              <div className="info-card">
                <h4>Order Timeline</h4>
                <div className="info-content">
                  <div className="info-row">
                    <span className="label">Order Placed:</span>
                    <span className="value">{new Date(order.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Last Updated:</span>
                    <span className="value">{new Date(order.updatedAt).toLocaleString()}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Order Status:</span>
                    <span className={`value status-${order.status}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="order-actions">
          <Link href="/products" className="btn btn-primary">Continue Shopping</Link>
          <button onClick={() => window.history.back()} className="btn btn-secondary">Go Back</button>
          {(order.status === 'pending' || order.status === 'confirmed') && (
            <button
              onClick={handleCancelOrder}
              disabled={cancellingOrder}
              className="btn btn-danger"
            >
              {cancellingOrder ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderDetailsContent />
    </Suspense>
  );
}
