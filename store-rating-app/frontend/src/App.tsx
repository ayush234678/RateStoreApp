import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminStoresPage } from './pages/admin/AdminStoresPage';
import { UserStoresPage } from './pages/user/UserStoresPage';
import { ChangePasswordPage } from './pages/user/ChangePasswordPage';
import { OwnerDashboard } from './pages/owner/OwnerDashboard';
import './index.css';

const ProtectedLayout = ({ roles }: { roles?: string[] }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" replace />;
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

const RootRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'store_owner') return <Navigate to="/owner/dashboard" replace />;
  return <Navigate to="/user/stores" replace />;
};

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#16161f', color: '#f0f0fa', border: '1px solid #1e1e2e' },
        success: { iconTheme: { primary: '#10b981', secondary: '#0a0a0f' } },
        error: { iconTheme: { primary: '#ef4444', secondary: '#0a0a0f' } },
      }} />
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedLayout roles={['admin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/stores" element={<AdminStoresPage />} />
        </Route>

        <Route element={<ProtectedLayout roles={['user']} />}>
          <Route path="/user/stores" element={<UserStoresPage />} />
          <Route path="/user/password" element={<ChangePasswordPage />} />
        </Route>

        <Route element={<ProtectedLayout roles={['store_owner']} />}>
          <Route path="/owner/dashboard" element={<OwnerDashboard />} />
          <Route path="/owner/password" element={<ChangePasswordPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
