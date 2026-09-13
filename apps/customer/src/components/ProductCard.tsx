import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Language, translations } from '../i18n/translations';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  availability: 'AVAILABLE' | 'SOLD_OUT' | 'DISABLED';
  counter?: { name: string };
}

interface ProductCardProps {
  product: Product;
  language: Language;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, language }) => {
  const { items, addItem, updateQuantity } = useCart();
  const t = translations[language];

  const cartItem = items.find((i) => i.productId === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;
  const isSoldOut = product.availability === 'SOLD_OUT';

  return (
    <div className="product-card">
      <div className="product-info">
        <div className="product-name">
          {product.name}
          {product.counter?.name && (
            <span className="counter-badge">{product.counter.name}</span>
          )}
        </div>
        {product.description && <p className="product-desc">{product.description}</p>}
        <div className="product-price">₹{product.price.toFixed(2)}</div>
      </div>

      <div>
        {isSoldOut ? (
          <span className="sold-out-badge">{t.soldOut}</span>
        ) : quantity === 0 ? (
          <button className="add-btn" onClick={() => addItem(product)}>
            {t.addToCart}
          </button>
        ) : (
          <div className="qty-control">
            <button className="qty-btn" onClick={() => updateQuantity(product.id, quantity - 1)}>
              <Minus size={16} />
            </button>
            <span>{quantity}</span>
            <button className="qty-btn" onClick={() => updateQuantity(product.id, quantity + 1)}>
              <Plus size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
