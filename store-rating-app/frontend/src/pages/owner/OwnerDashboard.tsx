import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { storesApi } from '../../services/api';
import { StarRating, Loading } from '../../components/Shared';

export const OwnerDashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('name');
  const [order, setOrder] = useState<'ASC' | 'DESC'>('ASC');

  useEffect(() => {
    storesApi.getOwnerDashboard()
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  const sortedRatings = [...(data?.ratings || [])].sort((a, b) => {
    const aVal = sort === 'rating' ? a.rating : (a.user?.[sort] || '');
    const bVal = sort === 'rating' ? b.rating : (b.user?.[sort] || '');
    return order === 'ASC' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
  });

  const handleSort = (field: string) => {
    if (sort === field) setOrder(o => o === 'ASC' ? 'DESC' : 'ASC');
    else { setSort(field); setOrder('ASC'); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Store Dashboard</h1>
          <p className="page-subtitle">{data?.store?.name || 'Your store overview'}</p>
        </div>
      </div>

      {!data?.store ? (
        <div className="card">
          <p style={{ color: 'var(--text-muted)' }}>No store is associated with your account yet. Please contact an administrator.</p>
        </div>
      ) : (
        <>
          <div className="stats-grid" style={{ marginBottom: 28 }}>
            <div className="stat-card">
              <div style={{ fontSize: 28, marginBottom: 12 }}>⭐</div>
              <div className="stat-value">{data.averageRating || '—'}</div>
              <div className="stat-label">Average Rating</div>
            </div>
            <div className="stat-card">
              <div style={{ fontSize: 28, marginBottom: 12 }}>👥</div>
              <div className="stat-value">{data.ratings?.length || 0}</div>
              <div className="stat-label">Total Reviews</div>
            </div>
            <div className="stat-card">
              <div style={{ fontSize: 16, marginBottom: 8, color: 'var(--text-muted)' }}>Store</div>
              <div style={{ fontFamily: 'Syne', fontSize: 18, fontWeight: 700 }}>{data.store.name}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>{data.store.address || '—'}</div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <h3>Overall Rating</h3>
              <StarRating value={Math.round(data.averageRating)} readonly />
            </div>
          </div>

          <h3 style={{ marginBottom: 16 }}>User Ratings</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                    User Name {sort === 'name' ? (order === 'ASC' ? '↑' : '↓') : '⇅'}
                  </th>
                  <th onClick={() => handleSort('email')} style={{ cursor: 'pointer' }}>
                    Email {sort === 'email' ? (order === 'ASC' ? '↑' : '↓') : '⇅'}
                  </th>
                  <th onClick={() => handleSort('rating')} style={{ cursor: 'pointer' }}>
                    Rating {sort === 'rating' ? (order === 'ASC' ? '↑' : '↓') : '⇅'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedRatings.length === 0 && (
                  <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>No ratings yet</td></tr>
                )}
                {sortedRatings.map((r: any) => (
                  <tr key={r.id}>
                    <td style={{ color: 'var(--text-primary)' }}>{r.user?.name || '—'}</td>
                    <td>{r.user?.email || '—'}</td>
                    <td><StarRating value={r.rating} readonly /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
