import React, { useEffect, useState } from 'react';
import { fetchProducts } from '../api/adminClient';
import { Plus, Minus, ShoppingCart } from 'lucide-react';

export const ManualOrderPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [successOrder, setSuccessOrder] = useState<any>(null);

  useEffect(() => {
    fetchProducts().then((data) => {
      setProducts(data.products?.filter((p: any) => p.availability === 'AVAILABLE') || []);
      setLoading(false);
    });
  }, []);

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  };

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => (item.productId === productId ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    const res = await fetch('/api/admin/orders/manual', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('queueless_admin_token')}`,
      },
      body: JSON.stringify({
        shopId: 'shop-sri-lakshmi',
        items: cart.map((c) => ({ productId: c.productId, quantity: c.quantity })),
        paymentMethod: 'CASH',
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
      }),
    });

    const data = await res.json();
    if (data.success) {
      setSuccessOrder(data.order);
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
    }
  };

  if (loading) return <div>Loading POS...</div>;

  return (
    <div>
      <div className="top-bar">
        <h1 className="page-title">Quick Counter POS Billing</h1>
      </div>

      {successOrder && (
        <div
          style={{
            background: '#dcfce7',
            color: '#15803d',
            padding: 16,
            borderRadius: 8,
            marginBottom: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <strong>Manual Order Placed & Cash Confirmed!</strong> Token: #{successOrder.orderNumber}
          </div>
          <button className="btn btn-secondary" onClick={() => setSuccessOrder(null)}>
            Dismiss
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        {/* Products Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
          {products.map((p) => (
            <div
              key={p.id}
              onClick={() => addToCart(p)}
              style={{
                background: '#ffffff',
                padding: 14,
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                textAlign: 'center',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{p.name}</div>
              <div style={{ color: '#d97706', fontWeight: 800, marginTop: 4 }}>₹{p.price.toFixed(2)}</div>
            </div>
          ))}
        </div>

        {/* Billing Cart */}
        <div className="table-card" style={{ padding: 16 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 12, display: 'flex', gap: 8 }}>
            <ShoppingCart size={20} /> Current Bill
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16, maxHeight: 300, overflowY: 'auto' }}>
            {cart.length === 0 ? (
              <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Click items on left to add to bill</div>
            ) : (
              cart.map((item) => (
                <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>₹{item.price} each</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button className="btn btn-secondary" style={{ padding: '2px 6px' }} onClick={() => updateQty(item.productId, -1)}>
                      <Minus size={12} />
                    </button>
                    <span style={{ fontWeight: 700 }}>{item.quantity}</span>
                    <button className="btn btn-secondary" style={{ padding: '2px 6px' }} onClick={() => updateQty(item.productId, 1)}>
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: 12, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.2rem' }}>
              <span>Total:</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>

          <input
            type="text"
            placeholder="Customer Name (Optional)"
            className="input-field"
            style={{ width: '100%', marginBottom: 8 }}
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />

          <button
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: 12, fontSize: '1rem' }}
            disabled={cart.length === 0}
            onClick={handlePlaceOrder}
          >
            Collect Cash & Print Bill
          </button>
        </div>
      </div>
    </div>
  );
};
