'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';

interface OrderDetails {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  transactionId?: string;
  paymentMethod: string;
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshCart } = useCart();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const orderId = searchParams.get('orderId');
  const transactionId = searchParams.get('transactionId');

  const fetchOrderDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setOrderDetails({
            orderId: data.data._id,
            orderNumber: data.data.orderNumber,
            totalAmount: data.data.totalAmount,
            transactionId: data.data.paymentInfo?.bkashTransactionId || transactionId,
            paymentMethod: data.data.paymentInfo?.method
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    } finally {
      setLoading(false);
    }
  }, [orderId, transactionId]);

  useEffect(() => {
    if (!orderId) {
      router.push('/');
      return;
    }

    fetchOrderDetails();

    // Refresh cart to ensure it's cleared if payment was completed
    refreshCart();
  }, [orderId, router, fetchOrderDetails, refreshCart]);

  if (loading) {
    return (
      <div className="container">
        <div className="payment-status">
          <div className="loading">Loading order details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="payment-status success">
        <div className="status-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#10B981"/>
            <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h1>Payment Successful!</h1>
        <p>Thank you for your order. Your payment has been processed successfully.</p>

        {orderDetails && (
          <div className="order-details">
            <h3>Order Details</h3>
            <div className="detail-row">
              <span>Order Number:</span>
              <span>{orderDetails.orderNumber}</span>
            </div>
            <div className="detail-row">
              <span>Total Amount:</span>
              <span>৳{orderDetails.totalAmount.toFixed(2)}</span>
            </div>
            {orderDetails.transactionId && (
              <div className="detail-row">
                <span>Transaction ID:</span>
                <span>{orderDetails.transactionId}</span>
              </div>
            )}
            <div className="detail-row">
              <span>Payment Method:</span>
              <span>{orderDetails.paymentMethod === 'bkash' ? 'bKash' : 'Cash on Delivery'}</span>
            </div>
          </div>
        )}

        <div className="action-buttons">
          <Link href={`/orders/${orderId}`} className="btn btn-primary">
            View Order Details
          </Link>
          <Link href="/products" className="btn btn-secondary">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
