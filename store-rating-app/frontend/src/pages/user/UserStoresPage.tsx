import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { storesApi } from '../../services/api';
import { ratingsApi } from '../../services/api';
import { StarRating, Loading } from '../../components/Shared';

export const UserStoresPage = () => {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', address: '' });
  const [ratingStore, setRatingStore] = useState<number | null>(null);
  const [tempRating, setTempRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await storesApi.getStores(filters);
      setStores(data);
    } catch { toast.error('Failed to load stores'); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  const openRating = (store: any) => {
    setRatingStore(store.id);
    setTempRating(store.user_rating || 0);
  };

  const submitRating = async (storeId: number) => {
    if (!tempRating) { toast.error('Please select a rating'); return; }
    setSubmitting(true);
    try {
      await ratingsApi.submitRating(storeId, tempRating);
      toast.success('Rating submitted!');
      setRatingStore(null);
      fetchStores();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit rating');
    } finally { setSubmitting(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Stores</h1>
          <p className="page-subtitle">Browse and rate stores</p>
        </div>
      </div>

      <div className="filters-row" style={{ marginBottom: 24 }}>
        <input className="form-input" placeholder="Search by name…" value={filters.name}
          onChange={e => setFilters(p => ({ ...p, name: e.target.value }))} />
        <input className="form-input" placeholder="Search by address…" value={filters.address}
          onChange={e => setFilters(p => ({ ...p, address: e.target.value }))} />
      </div>

      {loading ? <Loading /> : (
        <div className="stores-grid">
          {stores.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              No stores found
            </div>
          )}
          {stores.map(store => (
            <div key={store.id} className="store-card">
              <div className="store-name">{store.name}</div>
              <div className="store-address">📍 {store.address || 'Address not available'}</div>

              <div className="rating-section">
                <div className="rating-row">
                  <span className="rating-label">Overall Rating</span>
                  {store.average_rating > 0
                    ? <StarRating value={Math.round(store.average_rating)} readonly />
                    : <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>No ratings yet</span>
                  }
                </div>

                <div className="rating-row">
                  <span className="rating-label">Your Rating</span>
                  {store.user_rating
                    ? <StarRating value={store.user_rating} readonly />
                    : <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Not rated</span>
                  }
                </div>

                {ratingStore === store.id ? (
                  <div>
                    <div style={{ marginBottom: 10 }}>
                      <StarRating value={tempRating} onChange={setTempRating} />
                    </div>
                    <div className="flex gap-2">
                      <button className="btn btn-primary btn-sm" onClick={() => submitRating(store.id)} disabled={submitting}>
                        {submitting ? '…' : 'Save'}
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setRatingStore(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button className="btn btn-ghost btn-sm" onClick={() => openRating(store)}>
                    {store.user_rating ? '✏️ Edit Rating' : '⭐ Rate Store'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
