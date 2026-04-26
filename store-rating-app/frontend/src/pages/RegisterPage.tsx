import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../services/api';
import { validators } from '../utils/validators';

export const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const errs: Record<string, string> = {};
    errs.name = validators.name(form.name);
    errs.email = validators.email(form.email);
    errs.password = validators.password(form.password);
    errs.address = validators.address(form.address);
    setErrors(errs);
    return !Object.values(errs).some(Boolean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await authApi.register(form);
      toast.success('Account created! Please log in.');
      navigate('/login');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Create account</h1>
          <p>Join RateStore to rate your favorite stores</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name <span style={{color:'var(--text-muted)'}}>20-60 chars</span></label>
            <input className="form-input" type="text" placeholder="Your full name" value={form.name} onChange={set('name')} />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <input className="form-input" type="text" placeholder="Your address" value={form.address} onChange={set('address')} />
            {errors.address && <span className="form-error">{errors.address}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Password <span style={{color:'var(--text-muted)'}}>8-16 chars, uppercase + special</span></label>
            <input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} />
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 8, padding: '12px' }}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>
        <p style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};
