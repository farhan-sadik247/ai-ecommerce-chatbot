'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { ApiResponse } from '@/types';
import PaymentDetailsModal from './PaymentDetailsModal';

interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export default function CheckoutForm() {
  const router = useRouter();
  const { cart, refreshCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Bangladesh'
  });

  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'cash'>('bkash');
  const [customerPhone, setCustomerPhone] = useState('');
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);

  if (!user) {
    return (
      <div className="checkout-container">
        <div className="checkout-error">
          <h3>Please Login</h3>
          <p>You need to be logged in to checkout.</p>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="checkout-container">
        <div className="checkout-error">
          <h3>Cart is Empty</h3>
          <p>Add some items to your cart before checkout.</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode) {
      setError('Please fill in all shipping address fields');
      return false;
    }

    if (!/^\d{4}$/.test(shippingAddress.zipCode)) {
      setError('Please enter a valid 4-digit postal code');
      return false;
    }

    if (paymentMethod === 'bkash' && !customerPhone) {
      setError('Phone number is required for bKash payment');
      return false;
    }

    if (customerPhone && !/^(\+88)?01[3-9]\d{8}$/.test(customerPhone)) {
      setError('Please enter a valid Bangladeshi phone number');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shippingAddress,
          paymentMethod,
          customerPhone: customerPhone || user.email
        }),
        credentials: 'include'
      });

      const data: ApiResponse<{
        orderId: string;
        orderNumber: string;
        paymentUrl?: string;
        paymentId?: string;
        totalAmount: number;
        paymentMethod?: string;
      }> = await response.json();

      if (data.success) {
        if (paymentMethod === 'bkash' && data.data?.paymentUrl) {
          // Redirect to bKash payment page
          window.location.href = data.data.paymentUrl;
        } else {
          // For cash on delivery, refresh cart and redirect to success page
          await refreshCart();
          router.push(`/payment/success?orderId=${data.data?.orderId}`);
        }
      } else {
        setError(data.error || 'Checkout failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-container">
      <div className="checkout-form">
        <h2>Checkout</h2>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Shipping Address */}
          <div className="form-section">
            <h3>Shipping Address</h3>
            
            <div className="form-group">
              <label htmlFor="street">Street Address *</label>
              <input
                type="text"
                id="street"
                value={shippingAddress.street}
                onChange={(e) => handleInputChange('street', e.target.value)}
                placeholder="Enter your street address"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City *</label>
                <input
                  type="text"
                  id="city"
                  value={shippingAddress.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="City"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="state">State/Division *</label>
                <input
                  type="text"
                  id="state"
                  value={shippingAddress.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="State/Division"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="zipCode">Postal Code *</label>
                <input
                  type="text"
                  id="zipCode"
                  value={shippingAddress.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  placeholder="1234"
                  pattern="[0-9]{4}"
                  maxLength={4}
                  required
                />
                <small>Enter 4-digit postal code</small>
              </div>

              <div className="form-group">
                <label htmlFor="country">Country</label>
                <input
                  type="text"
                  id="country"
                  value={shippingAddress.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="form-section">
            <h3>Payment Method</h3>
            
            <div className="payment-methods">
              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bkash"
                  checked={paymentMethod === 'bkash'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'bkash')}
                />
                <span className="payment-label">
                  <Image src="/assets/bkash-logo.svg" alt="bKash" width={32} height={32} className="payment-logo" />
                  bKash Payment
                </span>
              </label>

              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'cash')}
                />
                <span className="payment-label">
                  Cash on Delivery
                </span>
              </label>
            </div>

            {paymentMethod === 'bkash' && (
              <div className="form-group">
                <label htmlFor="phone">Phone Number (for bKash) *</label>
                <input
                  type="tel"
                  id="phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  required
                />
                <small>Enter your bKash registered phone number</small>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="form-section">
            <h3>Order Summary</h3>
            <div className="order-summary">
              <div className="summary-row">
                <span>Items ({cart.items.length})</span>
                <span>৳{cart.totalAmount.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>৳{cart.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPaymentDetails(true)}
              className="payment-details-btn"
            >
              View Payment Details
            </button>
          </div>

          <button
            type="submit"
            className="checkout-btn"
            disabled={loading}
          >
            {loading ? 'Processing...' : `Place Order - ৳${cart.totalAmount.toFixed(2)}`}
          </button>
        </form>
      </div>

      <PaymentDetailsModal
        isOpen={showPaymentDetails}
        onClose={() => setShowPaymentDetails(false)}
        cart={cart}
        paymentMethod={paymentMethod}
        customerPhone={customerPhone}
        shippingAddress={shippingAddress}
      />
    </div>
  );
}
