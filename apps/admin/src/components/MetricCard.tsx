import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  subtext?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value, icon: Icon, subtext }) => {
  return (
    <div className="metric-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="metric-label">{label}</div>
          <div className="metric-value">{value}</div>
          {subtext && <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>{subtext}</div>}
        </div>
        {Icon && <Icon size={24} color="#d97706" />}
      </div>
    </div>
  );
};
