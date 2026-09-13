import React, { useEffect, useState } from 'react';
import { fetchStaff } from '../api/adminClient';

export const StaffPage: React.FC = () => {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff().then((data) => {
      setStaff(data.staffMembers || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading staff members...</div>;

  return (
    <div>
      <div className="top-bar">
        <h1 className="page-title">Staff & Access Control</h1>
      </div>

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Staff Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Assigned Counter</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id}>
                <td style={{ fontWeight: 600 }}>{s.user?.name}</td>
                <td>{s.user?.email}</td>
                <td>
                  <span className="badge badge-ready">{s.role}</span>
                </td>
                <td>{s.counter?.name || 'All Counters / Management'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
