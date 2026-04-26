import React, { useState } from 'react';

// Star Rating Component
export const StarRating = ({ value, onChange, readonly = false }: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${readonly ? 'readonly' : ''} ${star <= (hover || value) ? 'filled' : ''}`}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
        >★</span>
      ))}
      {readonly && value > 0 && (
        <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginLeft: 4 }}>
          {typeof value === 'number' ? value.toFixed(1) : value}
        </span>
      )}
    </div>
  );
};

// Badge
export const Badge = ({ role }: { role: string }) => (
  <span className={`badge badge-${role}`}>
    {role === 'store_owner' ? 'Store Owner' : role.charAt(0).toUpperCase() + role.slice(1)}
  </span>
);

// Modal
export const Modal = ({ title, onClose, children }: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) => (
  <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
    <div className="modal">
      <div className="modal-header">
        <h3 className="modal-title">{title}</h3>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

// Form Input
export const FormField = ({ label, error, ...props }: {
  label: string;
  error?: string;
  [key: string]: any;
}) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    <input className="form-input" {...props} />
    {error && <span className="form-error">{error}</span>}
  </div>
);

// Sort Indicator
export const SortIndicator = ({ field, sort, order }: { field: string; sort: string; order: string }) => {
  if (sort !== field) return <span style={{ color: 'var(--text-muted)' }}> ⇅</span>;
  return <span style={{ color: 'var(--accent)' }}> {order === 'ASC' ? '↑' : '↓'}</span>;
};

// Loading
export const Loading = () => (
  <div className="loading"><div className="spinner" /> Loading...</div>
);
