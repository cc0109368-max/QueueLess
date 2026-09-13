import React, { useEffect, useState } from 'react';
import { fetchCounters } from '../api/adminClient';

export const CountersPage: React.FC = () => {
  const [counters, setCounters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCounters().then((data) => {
      setCounters(data.counters || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading counters...</div>;

  return (
    <div>
      <div className="top-bar">
        <h1 className="page-title">Counter Configuration</h1>
      </div>

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Counter Name</th>
              <th>Assigned Items</th>
              <th>Assigned Staff</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {counters.map((c) => (
              <tr key={c.id}>
                <td style={{ fontWeight: 700 }}>{c.name}</td>
                <td>{c.products?.length || 0} Products</td>
                <td>{c.staff?.length || 0} Staff Members</td>
                <td>
                  <span className="badge badge-paid">ACTIVE</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
