import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { adminApi } from '../../services/api';
import { Badge, Modal, SortIndicator, Loading } from '../../components/Shared';
import { validators } from '../../utils/validators';

const ROLES = ['admin', 'user', 'store_owner'];

export const AdminUsersPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [sort, setSort] = useState('name');
  const [order, setOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', address: '', role: 'user' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getUsers({ ...filters, sort, order });
      setUsers(data);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, [filters, sort, order]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSort = (field: string) => {
    if (sort === field) setOrder(o => o === 'ASC' ? 'DESC' : 'ASC');
    else { setSort(field); setOrder('ASC'); }
  };

  const viewUser = async (id: number) => {
    setDetailLoading(true);
    try {
      const { data } = await adminApi.getUserById(id);
      setSelected(data);
    } catch { toast.error('Failed to load user'); }
    finally { setDetailLoading(false); }
  };

  const validateNew = () => {
    const errs: Record<string, string> = {};
    errs.name = validators.name(newUser.name);
    errs.email = validators.email(newUser.email);
    errs.password = validators.password(newUser.password);
    errs.address = validators.address(newUser.address);
    setFormErrors(errs);
    return !Object.values(errs).some(Boolean);
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateNew()) return;
    try {
      await adminApi.createUser(newUser);
      toast.success('User created');
      setShowCreate(false);
      setNewUser({ name: '', email: '', password: '', address: '', role: 'user' });
      fetchUsers();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || 'Failed to create user');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">Manage platform users</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Add User</button>
      </div>

      <div className="filters-row">
        {['name', 'email', 'address'].map(f => (
          <input key={f} className="form-input" placeholder={`Filter by ${f}`}
            value={(filters as any)[f]}
            onChange={e => setFilters(p => ({ ...p, [f]: e.target.value }))}
          />
        ))}
        <select className="form-select" style={{ maxWidth: 150 }} value={filters.role}
          onChange={e => setFilters(p => ({ ...p, role: e.target.value }))}>
          <option value="">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {loading ? <Loading /> : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                {['name', 'email', 'address', 'role'].map(col => (
                  <th key={col} onClick={() => handleSort(col)}>
                    {col.charAt(0).toUpperCase() + col.slice(1)}
                    <SortIndicator field={col} sort={sort} order={order} />
                  </th>
                ))}
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>No users found</td></tr>
              )}
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.address || '—'}</td>
                  <td><Badge role={u.role} /></td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => viewUser(u.id)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <Modal title="Add New User" onClose={() => setShowCreate(false)}>
          <form onSubmit={createUser}>
            {[
              { label: 'Name (20-60 chars)', field: 'name', type: 'text' },
              { label: 'Email', field: 'email', type: 'email' },
              { label: 'Address', field: 'address', type: 'text' },
              { label: 'Password (8-16 chars, uppercase + special)', field: 'password', type: 'password' },
            ].map(({ label, field, type }) => (
              <div key={field} className="form-group">
                <label className="form-label">{label}</label>
                <input className="form-input" type={type}
                  value={(newUser as any)[field]}
                  onChange={e => setNewUser(p => ({ ...p, [field]: e.target.value }))} />
                {(formErrors as any)[field] && <span className="form-error">{(formErrors as any)[field]}</span>}
              </div>
            ))}
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-select" value={newUser.role}
                onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))}>
                <option value="user">Normal User</option>
                <option value="admin">Admin</option>
                <option value="store_owner">Store Owner</option>
              </select>
            </div>
            <div className="flex gap-2" style={{ marginTop: 8 }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Create</button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {selected && (
        <Modal title="User Details" onClose={() => setSelected(null)}>
          {detailLoading ? <Loading /> : (
            <div>
              {[
                ['Name', selected.name],
                ['Email', selected.email],
                ['Address', selected.address || '—'],
                ['Role', <Badge role={selected.role} />],
              ].map(([label, value]) => (
                <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
                  <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                  <span>{value}</span>
                </div>
              ))}
              {selected.role === 'store_owner' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: 14 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Store Rating</span>
                  <span style={{ color: 'var(--gold)' }}>
                    {selected.averageRating ? `★ ${selected.averageRating}` : 'No ratings yet'}
                  </span>
                </div>
              )}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};
