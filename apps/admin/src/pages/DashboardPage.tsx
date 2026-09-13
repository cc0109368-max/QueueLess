import React, { useEffect, useState } from 'react';
import { fetchDashboardData, fetchOrders } from '../api/adminClient';
import { MetricCard } from '../components/MetricCard';
import { IndianRupee, ShoppingBag, Banknote, CreditCard, Clock } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchDashboardData(), fetchOrders({ limit: '5' })])
      .then(([dashData, ordersData]) => {
        setData(dashData);
        setRecentOrders(ordersData.orders || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <div className="top-bar">
        <h1 className="page-title">Dashboard & Real-time Metrics</h1>
      </div>

      <div className="metrics-grid">
        <MetricCard
          label="Today's Total Sales"
          value={`₹${(data?.todaySales ?? data?.todayRevenue ?? 0).toFixed(2)}`}
          icon={IndianRupee}
        />
        <MetricCard
          label="Total Orders Placed"
          value={data?.todayOrders ?? data?.todayOrderCount ?? 0}
          icon={ShoppingBag}
        />
        <MetricCard
          label="Pending Cash Confirmation"
          value={data?.pendingCash ?? data?.pendingCashCount ?? 0}
          icon={Banknote}
          subtext="Awaiting cash at counter"
        />
        <MetricCard
          label="Online Orders Placed"
          value={data?.onlineOrders ?? 0}
          icon={CreditCard}
        />
      </div>

      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 12 }}>Recent Orders</h2>
      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Time</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment Method</th>
              <th>Payment Status</th>
              <th>Order Status</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: '#64748b' }}>
                  No recent orders today.
                </td>
              </tr>
            ) : (
              recentOrders.map((order) => {
                const paymentStatus = order.payments?.[0]?.status || order.paymentStatus || (order.paymentMethod === 'ONLINE' ? 'SUCCESS' : 'PENDING');
                const orderTotal = typeof order.total === 'number' ? order.total : (order.totalAmount || 0);
                const orderStatus = order.status || order.orderStatus || 'CONFIRMED';
                return (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 800, color: '#d97706' }}>{order.orderNumber}</td>
                    <td>{new Date(order.createdAt).toLocaleTimeString()}</td>
                    <td>{order.items?.map((i: any) => `${i.quantity}x ${i.productName}`).join(', ')}</td>
                    <td style={{ fontWeight: 700 }}>₹{orderTotal.toFixed(2)}</td>
                    <td>{order.paymentMethod}</td>
                    <td>
                      <span className={`badge badge-${paymentStatus.toLowerCase()}`}>
                        {paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${orderStatus.toLowerCase()}`}>
                        {orderStatus}
                      </span>
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
