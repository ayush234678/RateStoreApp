import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { authApi } from '../../services/api';
import { validators } from '../../utils/validators';

export const ChangePasswordPage = () => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.currentPassword) errs.currentPassword = 'Current password is required';
    errs.newPassword = validators.password(form.newPassword);
    if (form.newPassword !== form.confirm) errs.confirm = 'Passwords do not match';
    setErrors(errs);
    return !Object.values(errs).some(Boolean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await authApi.updatePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success('Password updated successfully');
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err: any) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || 'Failed to update password');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Change Password</h1>
          <p className="page-subtitle">Update your account password</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 480 }}>
        <form onSubmit={handleSubmit}>
          {[
            { label: 'Current Password', field: 'currentPassword' },
            { label: 'New Password (8-16 chars, uppercase + special)', field: 'newPassword' },
            { label: 'Confirm New Password', field: 'confirm' },
          ].map(({ label, field }) => (
            <div key={field} className="form-group">
              <label className="form-label">{label}</label>
              <input className="form-input" type="password"
                value={(form as any)[field]}
                onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} />
              {(errors as any)[field] && <span className="form-error">{(errors as any)[field]}</span>}
            </div>
          ))}
          <button className="btn btn-primary" type="submit" disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
            {loading ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};
