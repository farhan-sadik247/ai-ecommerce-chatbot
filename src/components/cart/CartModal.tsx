'use client';

import Cart from './Cart';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export default function CartModal({ isOpen, onClose, onCheckout }: CartModalProps) {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCheckout = () => {
    onCheckout();
    onClose();
  };

  return (
    <div className="cart-modal-overlay" onClick={handleOverlayClick}>
      <div className="cart-modal-content">
        <div className="cart-modal-header">
          <h2>Shopping Cart</h2>
          <button className="cart-modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="cart-modal-body">
          <Cart onCheckout={handleCheckout} />
        </div>
      </div>
    </div>
  );
}
