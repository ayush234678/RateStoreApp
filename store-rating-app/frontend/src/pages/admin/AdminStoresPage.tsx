import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { adminApi } from '../../services/api';
import { StarRating, Modal, SortIndicator, Loading } from '../../components/Shared';
import { validators } from '../../utils/validators';

export const AdminStoresPage = () => {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [sort, setSort] = useState('name');
  const [order, setOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [showCreate, setShowCreate] = useState(false);
  const [newStore, setNewStore] = useState({ name: '', email: '', address: '', ownerEmail: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getStores({ ...filters, sort, order });
      setStores(data);
    } catch { toast.error('Failed to load stores'); }
    finally { setLoading(false); }
  }, [filters, sort, order]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  const handleSort = (field: string) => {
    if (sort === field) setOrder(o => o === 'ASC' ? 'DESC' : 'ASC');
    else { setSort(field); setOrder('ASC'); }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    errs.name = validators.name(newStore.name);
    errs.email = validators.email(newStore.email);
    errs.address = validators.address(newStore.address);
    if (newStore.ownerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newStore.ownerEmail)) {
      errs.ownerEmail = 'Invalid email';
    }
    setFormErrors(errs);
    return !Object.values(errs).some(Boolean);
  };

  const createStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await adminApi.createStore(newStore);
      toast.success('Store created');
      setShowCreate(false);
      setNewStore({ name: '', email: '', address: '', ownerEmail: '' });
      fetchStores();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || 'Failed to create store');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Stores</h1>
          <p className="page-subtitle">Manage registered stores</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Add Store</button>
      </div>

      <div className="filters-row">
        {['name', 'email', 'address'].map(f => (
          <input key={f} className="form-input" placeholder={`Filter by ${f}`}
            value={(filters as any)[f]}
            onChange={e => setFilters(p => ({ ...p, [f]: e.target.value }))} />
        ))}
      </div>

      {loading ? <Loading /> : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                {['name', 'email', 'address'].map(col => (
                  <th key={col} onClick={() => handleSort(col)}>
                    {col.charAt(0).toUpperCase() + col.slice(1)}
                    <SortIndicator field={col} sort={sort} order={order} />
                  </th>
                ))}
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {stores.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>No stores found</td></tr>
              )}
              {stores.map(s => (
                <tr key={s.id}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{s.name}</td>
                  <td>{s.email}</td>
                  <td>{s.address || '—'}</td>
                  <td>
                    {s.average_rating > 0
                      ? <StarRating value={Math.round(s.average_rating)} readonly />
                      : <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>No ratings</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <Modal title="Add New Store" onClose={() => setShowCreate(false)}>
          <form onSubmit={createStore}>
            {[
              { label: 'Store Name (20-60 chars)', field: 'name', type: 'text' },
              { label: 'Email', field: 'email', type: 'email' },
              { label: 'Address', field: 'address', type: 'text' },
              { label: 'Owner Email (optional, must be a store_owner)', field: 'ownerEmail', type: 'email' },
            ].map(({ label, field, type }) => (
              <div key={field} className="form-group">
                <label className="form-label">{label}</label>
                <input className="form-input" type={type}
                  value={(newStore as any)[field]}
                  onChange={e => setNewStore(p => ({ ...p, [field]: e.target.value }))} />
                {(formErrors as any)[field] && <span className="form-error">{(formErrors as any)[field]}</span>}
              </div>
            ))}
            <div className="flex gap-2" style={{ marginTop: 8 }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Create</button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
