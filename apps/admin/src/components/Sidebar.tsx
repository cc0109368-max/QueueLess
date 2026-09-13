import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Layers,
  Users,
  MonitorPlay,
  BarChart3,
  Settings,
  ShieldAlert,
  LogOut,
  PlusCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['OWNER', 'ADMIN', 'BILLING'] },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, roles: ['OWNER', 'ADMIN', 'BILLING'] },
    { id: 'manual-order', label: 'Quick POS Billing', icon: PlusCircle, roles: ['OWNER', 'ADMIN', 'BILLING'] },
    { id: 'menu', label: 'Menu', icon: UtensilsCrossed, roles: ['OWNER', 'ADMIN'] },
    { id: 'categories', label: 'Categories', icon: Layers, roles: ['OWNER', 'ADMIN'] },
    { id: 'counters', label: 'Counters', icon: MonitorPlay, roles: ['OWNER', 'ADMIN'] },
    { id: 'kot', label: 'Kitchen / Counter Screen', icon: MonitorPlay, roles: ['OWNER', 'ADMIN', 'COUNTER_STAFF'] },
    { id: 'staff', label: 'Staff', icon: Users, roles: ['OWNER', 'ADMIN'] },
    { id: 'printers', label: 'Printers', icon: Settings, roles: ['OWNER', 'ADMIN'] },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, roles: ['OWNER', 'ADMIN'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['OWNER', 'ADMIN'] },
    { id: 'audit', label: 'Audit Log', icon: ShieldAlert, roles: ['OWNER', 'ADMIN'] },
  ];

  const allowedNav = navItems.filter((item) => user && item.roles.includes(user.role));

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">
          <UtensilsCrossed size={22} color="#d97706" />
          <span>QueueLess</span>
        </div>
        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
          {user?.shopName || 'Business Portal'}
        </div>
      </div>

      <nav className="sidebar-nav">
        {allowedNav.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff' }}>{user?.name}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Role: {user?.role}</div>
        </div>
        <button className="nav-item" onClick={logout} style={{ color: '#ef4444' }}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
