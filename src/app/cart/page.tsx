'use client';

import { useRouter } from 'next/navigation';
import Cart from '@/components/cart/Cart';

export default function CartPage() {
  const router = useRouter();

  const handleCheckout = () => {
    router.push('/checkout');
  };

  return (
    <div className="container">
      <div style={{ padding: '2rem 0' }}>
        <Cart onCheckout={handleCheckout} />
      </div>
    </div>
  );
}
