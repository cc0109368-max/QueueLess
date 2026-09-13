import React, { useState } from 'react';
import { adminLogin } from '../api/adminClient';
import { useAuth } from '../context/AuthContext';
import { UtensilsCrossed } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@queueless.local');
  const [password, setPassword] = useState('QueueLess@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await adminLogin({ email, password });
      login(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#0f172a',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          padding: 32,
          borderRadius: 8,
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            style={{
              display: 'inline-flex',
              padding: 12,
              background: '#fef3c7',
              borderRadius: 8,
              marginBottom: 12,
            }}
          >
            <UtensilsCrossed size={30} color="#d97706" />
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>QueueLess Business Portal</h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 4 }}>
            Sign in to manage orders, menu & operations
          </p>
        </div>

        {error && (
          <div
            style={{
              background: '#fee2e2',
              color: '#dc2626',
              padding: 12,
              borderRadius: 6,
              marginBottom: 16,
              fontSize: '0.85rem',
              fontWeight: 500,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
              Email Address
            </label>
            <input
              type="email"
              required
              className="input-field"
              style={{ width: '100%' }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password"
              required
              className="input-field"
              style={{ width: '100%' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ justifyContent: 'center', padding: 12, marginTop: 8, fontSize: '0.95rem' }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #e2e8f0', fontSize: '0.75rem', color: '#64748b' }}>
          <strong>Development Admin Login:</strong>
          <div style={{ marginTop: 4 }}>
            <div>Email: <code>admin@queueless.local</code></div>
            <div>Password: <code>QueueLess@123</code></div>
          </div>
        </div>
      </div>
    </div>
  );
};
