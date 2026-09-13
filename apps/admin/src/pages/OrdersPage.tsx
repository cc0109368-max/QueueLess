import React, { useEffect, useState } from 'react';
import { fetchOrders, updateOrderStatus, confirmCashPayment } from '../api/adminClient';
import { Printer, CheckCircle } from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = () => {
    fetchOrders()
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 5000); // Live polling fallback
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    await updateOrderStatus(orderId, newStatus);
    loadOrders();
  };

  const handleCashConfirm = async (orderId: string) => {
    await confirmCashPayment(orderId);
    loadOrders();
  };

  if (loading) return <div>Loading orders...</div>;

  return (
    <div>
      <div className="top-bar">
        <h1 className="page-title">Orders Management</h1>
      </div>

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Token #</th>
              <th>Time</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Payment Status</th>
              <th>Order Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', color: '#64748b' }}>
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                // Payment status comes from the first payment record
                const paymentStatus = order.payments?.[0]?.status ?? 'PENDING';

                return (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 900, color: '#d97706', fontSize: '1.1rem' }}>
                      {order.orderNumber}
                    </td>
                    <td>{new Date(order.createdAt).toLocaleTimeString()}</td>
                    <td>{order.customerName || 'Walk-in'}</td>
                    <td>{order.items?.map((i: any) => `${i.quantity}x ${i.productName}`).join(', ')}</td>
                    <td style={{ fontWeight: 700 }}>₹{(order.total ?? 0).toFixed(2)}</td>
                    <td>{order.paymentMethod}</td>
                    <td>
                      <span className={`badge badge-${paymentStatus.toLowerCase()}`}>
                        {paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${order.status?.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {order.paymentMethod === 'CASH' && order.status === 'CASH_PENDING' && (
                          <button
                            className="btn btn-success"
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            onClick={() => handleCashConfirm(order.id)}
                          >
                            <CheckCircle size={14} /> Cash Recd
                          </button>
                        )}
                        {order.status === 'CONFIRMED' && (
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            onClick={() => handleStatusChange(order.id, 'COMPLETED')}
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
