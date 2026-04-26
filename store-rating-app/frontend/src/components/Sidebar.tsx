import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems: Record<string, { label: string; path: string; icon: string }[]> = {
  admin: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: '⊞' },
    { label: 'Users', path: '/admin/users', icon: '👥' },
    { label: 'Stores', path: '/admin/stores', icon: '🏪' },
  ],
  user: [
    { label: 'Stores', path: '/user/stores', icon: '🏪' },
    { label: 'Change Password', path: '/user/password', icon: '🔑' },
  ],
  store_owner: [
    { label: 'My Dashboard', path: '/owner/dashboard', icon: '⊞' },
    { label: 'Change Password', path: '/owner/password', icon: '🔑' },
  ],
};

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;
  const items = navItems[user.role] || [];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>RateStore</h2>
        <div><span>{user.role === 'store_owner' ? 'Store Owner' : user.role === 'admin' ? 'Administrator' : 'Member'}</span></div>
      </div>

      <nav className="sidebar-nav">
        <div style={{ padding: '8px 12px 16px', borderBottom: '1px solid var(--border)', marginBottom: 8 }}>
          <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.name.length > 22 ? user.name.slice(0, 22) + '…' : user.name}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{user.email}</div>
        </div>

        {items.map(item => (
          <button
            key={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item" onClick={logout} style={{ color: 'var(--danger)' }}>
          <span className="icon">⎋</span> Log Out
        </button>
      </div>
    </aside>
  );
};
