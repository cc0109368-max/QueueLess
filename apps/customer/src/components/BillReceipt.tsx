import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface BillReceiptProps {
  order: any;
}

export const BillReceipt: React.FC<BillReceiptProps> = ({ order }) => {
  const createdDate = order.createdAt ? new Date(order.createdAt) : new Date();
  const dateStr = createdDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const timeStr = createdDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  const isOnline = order.paymentMethod === 'ONLINE';
  const isPaid = isOnline || order.status === 'CONFIRMED' || order.status === 'READY' || order.status === 'COMPLETED';

  return (
    <div className="receipt-card" id="digital-bill" style={{ background: '#ffffff', borderRadius: 8, padding: 20, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', borderBottom: '1px dashed #cbd5e1', paddingBottom: 14, marginBottom: 14 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
          {order.shop?.name || 'SRI LAKSHMI TEA & SNACKS'}
        </h2>
        <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#d97706', letterSpacing: 1, margin: '8px 0 4px' }}>
          Order #{order.orderNumber}
        </div>
        <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: 2 }}>
          Receipt ID: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{order.id || order.orderNumber}</span>
        </div>
        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
          {dateStr} • {timeStr}
        </div>
      </div>

      {/* QR Code */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '12px 0 16px' }}>
        <QRCodeSVG value={order.id || order.orderNumber} size={100} />
      </div>

      {/* Items Table */}
      <div style={{ margin: '14px 0', borderBottom: '1px dashed #cbd5e1', paddingBottom: 12 }}>
        {order.items?.map((item: any) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.9rem',
              marginBottom: 6,
              color: '#1e293b',
            }}
          >
            <span>
              {item.productName} × {item.quantity}
            </span>
            <span style={{ fontWeight: 600 }}>₹{item.totalPrice.toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div style={{ marginBottom: 14, fontSize: '0.9rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, color: '#64748b' }}>
          <span>Subtotal</span>
          <span>₹{order.subtotal?.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, color: '#64748b' }}>
          <span>Tax (5%)</span>
          <span>₹{order.taxAmount?.toFixed(2)}</span>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '1.15rem',
            fontWeight: 800,
            color: '#0f172a',
            borderTop: '1px dashed #cbd5e1',
            paddingTop: 8,
            marginTop: 4,
          }}
        >
          <span>TOTAL</span>
          <span style={{ color: '#d97706' }}>₹{order.total?.toFixed(2)}</span>
        </div>
      </div>

      {/* Payment & Status Info */}
      <div style={{ background: '#f8fafc', padding: 12, borderRadius: 6, marginBottom: 14, fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ color: '#64748b' }}>Payment Method:</span>
          <strong style={{ color: '#0f172a' }}>{order.paymentMethod}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#64748b' }}>Payment Status:</span>
          <span
            style={{
              fontWeight: 700,
              color: isPaid ? '#16a34a' : '#ca8a04',
            }}
          >
            {isPaid ? 'PAID ✓' : 'CASH PAYMENT PENDING'}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', borderTop: '1px dashed #cbd5e1', paddingTop: 12, color: '#64748b', fontSize: '0.78rem' }}>
        <div>Thank you</div>
        <div style={{ fontWeight: 600, color: '#94a3b8', marginTop: 2 }}>Powered by QueueLess</div>
      </div>
    </div>
  );
};
