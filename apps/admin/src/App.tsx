import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { Sidebar } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { OrdersPage } from './pages/OrdersPage';
import { MenuPage } from './pages/MenuPage';
import { CountersPage } from './pages/CountersPage';
import { CounterDashboardPage } from './pages/CounterDashboardPage';
import { StaffPage } from './pages/StaffPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { SettingsPage } from './pages/SettingsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { PrintersPage } from './pages/PrintersPage';
import { ManualOrderPage } from './pages/ManualOrderPage';
import './styles/admin.css';

const MainLayout: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(
    user?.role === 'COUNTER_STAFF' ? 'kot' : 'dashboard'
  );

  if (!user) return <LoginPage />;

  return (
    <div className="admin-layout">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        {activeTab === 'dashboard' && <DashboardPage />}
        {activeTab === 'manual-order' && <ManualOrderPage />}
        {activeTab === 'orders' && <OrdersPage />}
        {activeTab === 'menu' && <MenuPage />}
        {activeTab === 'categories' && <CategoriesPage />}
        {activeTab === 'counters' && <CountersPage />}
        {activeTab === 'kot' && <CounterDashboardPage />}
        {activeTab === 'staff' && <StaffPage />}
        {activeTab === 'printers' && <PrintersPage />}
        {activeTab === 'analytics' && <AnalyticsPage />}
        {activeTab === 'audit' && <AuditLogPage />}
        {activeTab === 'settings' && <SettingsPage />}
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
};
