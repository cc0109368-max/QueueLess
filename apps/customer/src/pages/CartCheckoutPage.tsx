import React, { useState } from 'react';
import { ArrowLeft, Trash2, CreditCard, Banknote, AlertCircle, RefreshCw } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { createCustomerOrder } from '../api/client';
import { Language, translations } from '../i18n/translations';

interface CartCheckoutPageProps {
  shopId: string;
  onBack: () => void;
  onOrderSuccess: (orderNumber: string) => void;
  language: Language;
}

export const CartCheckoutPage: React.FC<CartCheckoutPageProps> = ({
  shopId,
  onBack,
  onOrderSuccess,
  language,
}) => {
  const { items, updateQuantity, removeItem, totalAmount, clearCart } = useCart();
  const t = translations[language];

  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'CASH'>('ONLINE');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const subtotal = totalAmount;
  const tax = Math.round(subtotal * 0.05 * 100) / 100; // 5% tax
  const grandTotal = subtotal + tax;
  const formattedTotal = Number.isInteger(grandTotal) ? grandTotal.toString() : grandTotal.toFixed(2);

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    setLoading(true);
    setPaymentFailed(false);
    setErrorMessage(null);

    try {
      const effectiveShopId = shopId || 'shop-sri-lakshmi';
      const payload = {
        shopId: effectiveShopId,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        paymentMethod,
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        idempotencyKey: `cust-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      };

      const result = await createCustomerOrder(payload);
      if (result && result.success && result.order) {
        clearCart();
        onOrderSuccess(result.order.orderNumber);
      } else {
        throw new Error(result?.error || 'Order could not be processed');
      }
    } catch (err: any) {
      setPaymentFailed(true);
      setErrorMessage(err.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <button
        onClick={onBack}
        style={{
          background: 'none',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontWeight: 600,
          marginBottom: 16,
          cursor: 'pointer',
          color: '#475569',
        }}
      >
        <ArrowLeft size={18} />
        {t.backToMenu}
      </button>

      <h1 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 16, color: '#0f172a' }}>
        Checkout & Payment
      </h1>

      {paymentFailed && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: 16,
            borderRadius: 8,
            marginBottom: 20,
            textAlign: 'center',
          }}
        >
          <AlertCircle size={28} color="#dc2626" style={{ margin: '0 auto 8px' }} />
          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>Payment failed</div>
          <div style={{ fontSize: '0.85rem', color: '#7f1d1d', marginBottom: 12 }}>
            {errorMessage || 'Your order has not been confirmed. Please try again.'}
          </div>
          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              background: '#dc2626',
              color: '#ffffff',
              border: 'none',
              borderRadius: 6,
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} /> Try Again
          </button>
        </div>
      )}

      {/* Items Summary Card */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 12, color: '#1e293b' }}>
          Your Items ({items.length})
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((item) => (
            <div
              key={item.productId}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: 8,
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  ₹{item.price.toFixed(2)} × {item.quantity} = ₹{(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="qty-control" style={{ padding: '2px 8px' }}>
                  <button className="qty-btn" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>
                    -
                  </button>
                  <span style={{ fontSize: '0.9rem' }}>{item.quantity}</span>
                  <button className="qty-btn" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>
                    +
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item.productId)}
                  style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: 4 }}
                  title="Remove item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Details */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: 16, borderRadius: 8, marginBottom: 16 }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 12, color: '#1e293b' }}>
          Customer Details (Optional)
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            type="text"
            placeholder={t.customerName || 'Your Name'}
            className="search-input"
            style={{ background: '#f8fafc' }}
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
          <input
            type="tel"
            placeholder={t.customerPhone || 'Mobile Number'}
            className="search-input"
            style={{ background: '#f8fafc' }}
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
          />
        </div>
      </div>

      {/* Payment Method Selector */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: 16, borderRadius: 8, marginBottom: 16 }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 12, color: '#1e293b' }}>
          Payment Method
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: 14,
              border: `2px solid ${paymentMethod === 'ONLINE' ? '#d97706' : '#e2e8f0'}`,
              borderRadius: 8,
              background: paymentMethod === 'ONLINE' ? '#fffbeb' : '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <input
              type="radio"
              name="paymentMethod"
              checked={paymentMethod === 'ONLINE'}
              onChange={() => setPaymentMethod('ONLINE')}
            />
            <CreditCard size={20} color="#d97706" />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>Online Payment</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>UPI, Cards, NetBanking (Instant Confirmation)</div>
            </div>
          </label>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: 14,
              border: `2px solid ${paymentMethod === 'CASH' ? '#d97706' : '#e2e8f0'}`,
              borderRadius: 8,
              background: paymentMethod === 'CASH' ? '#fffbeb' : '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <input
              type="radio"
              name="paymentMethod"
              checked={paymentMethod === 'CASH'}
              onChange={() => setPaymentMethod('CASH')}
            />
            <Banknote size={20} color="#16a34a" />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>Pay at Counter</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Pay cash at billing counter after ordering</div>
            </div>
          </label>
        </div>
      </div>

      {/* Pricing Breakdown */}
      <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 20 }}>
        <div className="receipt-row">
          <span style={{ color: '#64748b' }}>Subtotal</span>
          <span style={{ fontWeight: 600 }}>₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="receipt-row">
          <span style={{ color: '#64748b' }}>GST / Tax (5%)</span>
          <span style={{ fontWeight: 600 }}>₹{tax.toFixed(2)}</span>
        </div>
        <div className="receipt-row receipt-total" style={{ borderTop: '1px dashed #cbd5e1', paddingTop: 8, marginTop: 8 }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>TOTAL</span>
          <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#d97706' }}>₹{formattedTotal}</span>
        </div>
      </div>

      {/* Primary Payment Action Button */}
      <button
        className="checkout-btn"
        style={{
          width: '100%',
          justifyContent: 'center',
          padding: 16,
          fontSize: '1.05rem',
          fontWeight: 800,
          background: loading ? '#94a3b8' : '#d97706',
          boxShadow: '0 4px 12px rgba(217, 119, 6, 0.3)',
          cursor: loading || items.length === 0 ? 'not-allowed' : 'pointer',
        }}
        onClick={handlePlaceOrder}
        disabled={loading || items.length === 0}
      >
        {loading ? (
          'Processing...'
        ) : paymentMethod === 'ONLINE' ? (
          `Pay ₹${formattedTotal}`
        ) : (
          'Place Cash Order'
        )}
      </button>
    </div>
  );
};
