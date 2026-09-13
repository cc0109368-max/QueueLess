import React, { useEffect, useState } from 'react';
import { MetricCard } from '../components/MetricCard';
import { BarChart3, TrendingUp, DollarSign } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/admin/analytics', {
      headers: { Authorization: `Bearer ${localStorage.getItem('queueless_admin_token')}` },
    })
      .then((r) => r.json())
      .then((d) => setData(d.analytics));
  }, []);

  return (
    <div>
      <div className="top-bar">
        <h1 className="page-title">Business Analytics & Insights</h1>
      </div>

      <div className="metrics-grid">
        <MetricCard
          label="Total Revenue Generated"
          value={`₹${data?.totalRevenue ? data.totalRevenue.toFixed(2) : '0.00'}`}
          icon={DollarSign}
        />
        <MetricCard
          label="Total Orders Handled"
          value={data?.totalOrders || 0}
          icon={TrendingUp}
        />
        <MetricCard
          label="Average Order Value"
          value={`₹${data?.averageOrderValue ? data.averageOrderValue.toFixed(2) : '0.00'}`}
          icon={BarChart3}
        />
      </div>

      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '20px 0 12px' }}>Most Popular Items</h2>
      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Quantity Sold</th>
              <th>Total Revenue</th>
            </tr>
          </thead>
          <tbody>
            {data?.topProducts?.map((p: any, idx: number) => (
              <tr key={idx}>
                <td style={{ fontWeight: 600 }}>{p.name}</td>
                <td style={{ fontWeight: 700 }}>{p.quantity} units</td>
                <td style={{ fontWeight: 700, color: '#16a34a' }}>₹{p.revenue.toFixed(2)}</td>
              </tr>
            )) || (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', color: '#64748b' }}>
                  No sales data recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
