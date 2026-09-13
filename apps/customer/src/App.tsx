import React, { useState } from 'react';
import { CartProvider } from './context/CartContext';
import { ShopMenuPage } from './pages/ShopMenuPage';
import { CartCheckoutPage } from './pages/CartCheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import './styles/index.css';

export const App: React.FC = () => {
  // Extract shop slug from URL path (e.g., /s/sri-lakshmi-tea) or fallback to seed shop
  const pathParts = window.location.pathname.split('/');
  const slugFromPath = pathParts[2] || 'sri-lakshmi-tea';

  const [page, setPage] = useState<'MENU' | 'CHECKOUT' | 'CONFIRMATION'>('MENU');
  const [shopId, setShopId] = useState<string>('');
  const [activeOrderNumber, setActiveOrderNumber] = useState<string | null>(null);

  const handleOrderSuccess = (orderNumber: string) => {
    setActiveOrderNumber(orderNumber);
    setPage('CONFIRMATION');
  };

  return (
    <CartProvider>
      {page === 'MENU' && (
        <ShopMenuPage
          slug={slugFromPath}
          onNavigateToCheckout={() => setPage('CHECKOUT')}
          onShopLoaded={(shop) => setShopId(shop.id)}
        />
      )}
      {page === 'CHECKOUT' && (
        <CartCheckoutPage
          shopId={shopId}
          onBack={() => setPage('MENU')}
          onOrderSuccess={handleOrderSuccess}
          language="en"
        />
      )}
      {page === 'CONFIRMATION' && activeOrderNumber && (
        <OrderConfirmationPage
          orderNumber={activeOrderNumber}
          onBackToMenu={() => setPage('MENU')}
          language="en"
        />
      )}
    </CartProvider>
  );
};
