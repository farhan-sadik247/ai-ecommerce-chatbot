'use client';

import { Cart } from '@/types';

interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface PaymentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: Cart;
  paymentMethod: 'bkash' | 'cash';
  customerPhone: string;
  shippingAddress: ShippingAddress;
}

export default function PaymentDetailsModal({
  isOpen,
  onClose,
  cart,
  paymentMethod,
  customerPhone,
  shippingAddress
}: PaymentDetailsModalProps) {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="payment-details-modal-overlay" onClick={handleOverlayClick}>
      <div className="payment-details-modal-content">
        <div className="payment-details-modal-header">
          <h2>Payment Details</h2>
          <button className="payment-details-modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="payment-details-modal-body">
          {/* Order Items Table */}
          <div className="payment-section">
            <h3>Order Items</h3>
            <table className="payment-items-table">
              <thead>
                <tr>
                  <th>Serial</th>
                  <th>Product Details</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {cart.items.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="product-details">
                        <div className="product-name">{item.product?.name || 'Product'}</div>
                        <div className="product-specs">Size: {item.size}, Color: {item.color}</div>
                      </div>
                    </td>
                    <td>৳{item.price.toFixed(2)}</td>
                    <td>{item.quantity}</td>
                    <td>৳{(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Payment & Shipping Details */}
          <div className="payment-section">
            <h3>Payment & Shipping Details</h3>
            <table className="payment-info-table">
              <tbody>
                <tr>
                  <td><strong>Payment Method:</strong></td>
                  <td>{paymentMethod === 'bkash' ? 'bKash Payment' : 'Cash on Delivery'}</td>
                </tr>
                {paymentMethod === 'bkash' && customerPhone && (
                  <tr>
                    <td><strong>Phone Number:</strong></td>
                    <td>{customerPhone}</td>
                  </tr>
                )}
                <tr>
                  <td><strong>Shipping Address:</strong></td>
                  <td>
                    {shippingAddress.street}, {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}, {shippingAddress.country}
                  </td>
                </tr>
                <tr>
                  <td><strong>Total Amount:</strong></td>
                  <td><strong>৳{cart.totalAmount.toFixed(2)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="payment-details-modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
