'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case 'missing-payment-id':
        return 'Payment ID is missing. Please try again.';
      case 'order-not-found':
        return 'Order not found. Please contact support.';
      case 'execution-failed':
        return 'Payment execution failed. Please try again.';
      case 'execution-error':
        return 'An error occurred during payment processing.';
      case 'payment-cancelled':
        return 'Payment was cancelled by user.';
      case 'callback-error':
        return 'An error occurred during payment callback.';
      default:
        return 'Payment failed. Please try again or contact support.';
    }
  };

  return (
    <div className="container">
      <div className="payment-status failed">
        <div className="status-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#EF4444"/>
            <path d="M15 9l-6 6M9 9l6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h1>Payment Failed</h1>
        <p>{getErrorMessage(error)}</p>

        <div className="error-details">
          <p>Don&apos;t worry! Your cart items are still saved. You can try again or choose a different payment method.</p>
        </div>

        <div className="action-buttons">
          <Link href="/checkout" className="btn btn-primary">
            Try Again
          </Link>
          <Link href="/cart" className="btn btn-secondary">
            Back to Cart
          </Link>
          <Link href="/products" className="btn btn-secondary">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentFailedContent />
    </Suspense>
  );
}
