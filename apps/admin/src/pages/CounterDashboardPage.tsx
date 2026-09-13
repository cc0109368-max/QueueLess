import React, { useEffect, useState } from 'react';
import { fetchCounterOrders, updateCounterItemStatus } from '../api/adminClient';
import { useAuth } from '../context/AuthContext';
import { Check, Clock } from 'lucide-react';

export const CounterDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const counterId = user?.counterId || 'counter-tea';
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCounterItems = () => {
    fetchCounterOrders(counterId)
      .then((data) => {
        setItems(data.counterItems || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadCounterItems();
    const interval = setInterval(loadCounterItems, 3000);
    return () => clearInterval(interval);
  }, [counterId]);

  const handleUpdateStatus = async (itemId: string, newStatus: string) => {
    await updateCounterItemStatus(counterId, itemId, newStatus);
    loadCounterItems();
  };

  if (loading) return <div>Loading counter display...</div>;

  return (
    <div>
      <div className="top-bar">
        <div>
          <h1 className="page-title">Counter Preparation Screen (KOT)</h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
            Active items for: <strong>{user?.counterName || 'Counter'}</strong>
          </p>
        </div>
      </div>

      <div className="kot-grid">
        {items.length === 0 ? (
          <div style={{ padding: 40, color: '#64748b', textAlign: 'center', gridColumn: '1 / -1' }}>
            No pending items for this counter right now.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className={`kot-card ${item.status.toLowerCase()}`}>
              <div className="kot-header">
                <span className="kot-token">#{item.order.orderNumber}</span>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  <Clock size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  {new Date(item.createdAt).toLocaleTimeString()}
                </span>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                  {item.quantity}x {item.productName}
                </div>
                {item.order.customerName && (
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 4 }}>
                    Customer: {item.order.customerName}
                  </div>
                )}
              </div>

              <div>
                {item.status === 'PENDING' && (
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: 10 }}
                    onClick={() => handleUpdateStatus(item.id, 'PREPARING')}
                  >
                    Start Preparing
                  </button>
                )}
                {item.status === 'PREPARING' && (
                  <button
                    className="btn btn-success"
                    style={{ width: '100%', justifyContent: 'center', padding: 10 }}
                    onClick={() => handleUpdateStatus(item.id, 'READY')}
                  >
                    <Check size={18} /> Mark Ready
                  </button>
                )}
                {item.status === 'READY' && (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: 8,
                      background: '#dcfce7',
                      color: '#16a34a',
                      fontWeight: 700,
                      borderRadius: 6,
                    }}
                  >
                    Item Ready for Customer
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
