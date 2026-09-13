import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Language, translations } from '../i18n/translations';

interface CartFooterProps {
  onCheckout: () => void;
  language: Language;
}

export const CartFooter: React.FC<CartFooterProps> = ({ onCheckout, language }) => {
  const { itemCount, totalAmount } = useCart();
  const t = translations[language];

  if (itemCount === 0) return null;

  return (
    <div className="cart-bar">
      <div className="cart-summary">
        <span className="cart-count">
          {itemCount} {t.items}
        </span>
        <span className="cart-total">₹{totalAmount.toFixed(2)}</span>
      </div>
      <button className="checkout-btn" onClick={onCheckout}>
        <ShoppingBag size={18} />
        {t.viewCart}
        <ArrowRight size={18} />
      </button>
    </div>
  );
};
