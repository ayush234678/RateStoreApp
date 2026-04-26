import React, { useEffect, useState } from 'react';
import { adminApi } from '../../services/api';
import { Loading } from '../../components/Shared';

export const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getDashboard().then(r => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Platform overview</p>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: '👥' },
          { label: 'Total Stores', value: stats?.totalStores ?? 0, icon: '🏪' },
          { label: 'Total Ratings', value: stats?.totalRatings ?? 0, icon: '⭐' },
        ].map(stat => (
          <div key={stat.label} className="stat-card">
            <div style={{ fontSize: 28, marginBottom: 12 }}>{stat.icon}</div>
            <div className="stat-value">{stat.value.toLocaleString()}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 12 }}>Quick Actions</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Navigate using the sidebar to manage users and stores. Use the Users page to add new administrators, normal users,
          and view store owners. Use the Stores page to add and manage stores on the platform.
        </p>
      </div>
    </div>
  );
};
