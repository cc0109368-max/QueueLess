import React, { useEffect, useState } from 'react';
import { fetchOrderDetails } from '../api/client';
import { BillReceipt } from '../components/BillReceipt';
import { CheckCircle2, Clock, Printer, ArrowLeft } from 'lucide-react';
import { Language, translations } from '../i18n/translations';

interface OrderConfirmationPageProps {
  orderNumber: string;
  onBackToMenu: () => void;
  language: Language;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  orderNumber,
  onBackToMenu,
  language,
}) => {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const t = translations[language];

  useEffect(() => {
    fetchOrderDetails(orderNumber)
      .then((data) => {
        setOrder(data.order);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [orderNumber]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ padding: 60, textAlign: 'center', color: '#64748b' }}>
        <div style={{ display: 'inline-block', width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#ea580c', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: 16, fontWeight: 500 }}>Fetching receipt...</p>
      </div>
    );
  }

  const isCash = order?.paymentMethod === 'CASH';

  return (
    <div style={{ padding: 16 }}>
      {/* Status Banner */}
      <div
        style={{
          textAlign: 'center',
          padding: '24px 16px',
          background: isCash ? '#fefce8' : '#f0fdf4',
          border: `1px solid ${isCash ? '#fef08a' : '#bbf7d0'}`,
          borderRadius: 8,
          marginBottom: 20,
        }}
      >
        {isCash ? (
          <>
            <Clock size={44} color="#ca8a04" style={{ margin: '0 auto 8px' }} />
            <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#854d0e', margin: '0 0 4px' }}>
              ORDER CREATED
            </h1>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#a16207', margin: '4px 0' }}>
              Order #{order?.orderNumber || orderNumber}
            </div>
            <div style={{ display: 'inline-block', background: '#fef08a', color: '#854d0e', padding: '4px 12px', borderRadius: 20, fontWeight: 700, fontSize: '0.85rem', margin: '6px 0' }}>
              Cash Payment Pending • ₹{order?.total?.toFixed(2)}
            </div>
            <p style={{ fontSize: '0.88rem', color: '#713f12', margin: '8px 0 0', lineHeight: 1.4 }}>
              Please show <strong>Order #{order?.orderNumber || orderNumber}</strong> at the payment counter.
            </p>
          </>
        ) : (
          <>
            <CheckCircle2 size={44} color="#16a34a" style={{ margin: '0 auto 8px' }} />
            <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#15803d', margin: '0 0 4px' }}>
              ORDER CONFIRMED
            </h1>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16a34a', margin: '4px 0' }}>
              Order #{order?.orderNumber || orderNumber}
            </div>
            <div style={{ display: 'inline-block', background: '#dcfce7', color: '#15803d', padding: '4px 12px', borderRadius: 20, fontWeight: 700, fontSize: '0.85rem', margin: '6px 0' }}>
              Payment Successful ✓
            </div>
            <p style={{ fontSize: '0.88rem', color: '#166534', margin: '8px 0 0', lineHeight: 1.4 }}>
              Please collect your order from the shop counters when ready.
            </p>
          </>
        )}
      </div>

      {/* Bill Receipt Component */}
      {order && <BillReceipt order={order} />}

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
        <button
          onClick={handlePrint}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: 14,
            background: '#ffffff',
            border: '2px solid #d97706',
            color: '#d97706',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
          }}
        >
          <Printer size={18} />
          {t.downloadBill || 'Download / Print Bill'}
        </button>

        <button
          onClick={onBackToMenu}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: 12,
            background: '#f1f5f9',
            border: 'none',
            color: '#334155',
            borderRadius: 8,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={16} />
          {t.backToMenu || 'Back to Menu'}
        </button>
      </div>
    </div>
  );
};
