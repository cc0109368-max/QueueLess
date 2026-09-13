import React, { useEffect, useState } from 'react';
import { fetchAuditLogs } from '../api/adminClient';

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditLogs().then((data) => {
      setLogs(data.logs || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading audit trail...</div>;

  return (
    <div>
      <div className="top-bar">
        <h1 className="page-title">Immutable Action Audit Logs</h1>
      </div>

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Entity ID</th>
              <th>User ID</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: '#64748b' }}>
                  No audit logs recorded yet.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.createdAt).toLocaleString()}</td>
                  <td style={{ fontWeight: 700, color: '#d97706' }}>{log.action}</td>
                  <td>{log.entity}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{log.entityId}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{log.userId}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
