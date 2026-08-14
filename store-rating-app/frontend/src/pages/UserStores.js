import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import StarRating from '../components/StarRating';
import SortableTable from '../components/SortableTable';

export default function UserStores() {
  const [filters, setFilters] = useState({ name: '', address: '' });
  const [sort, setSort] = useState({ by: 'name', dir: 'asc' });
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    api
      .get('/stores', { params: { ...filters, sortBy: sort.by, sortDir: sort.dir } })
      .then(({ data }) => setStores(data.stores))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load stores'))
      .finally(() => setLoading(false));
  }, [filters, sort]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const handleSort = (key) => {
    setSort((prev) => (prev.by === key ? { by: key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { by: key, dir: 'asc' }));
  };

  const submitRating = async (storeId, rating) => {
    setSavingId(storeId);
    try {
      await api.post(`/ratings/${storeId}`, { rating });
      setStores((prev) =>
        prev.map((s) =>
          s.id === storeId
            ? { ...s, user_rating: rating }
            : s
        )
      );
      // overall rating may have shifted; refresh in the background
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSavingId(null);
    }
  };

  const columns = [
    { key: 'name', label: 'Store' },
    { key: 'address', label: 'Address', render: (r) => <span title={r.address}>{r.address.length > 45 ? r.address.slice(0, 45) + '…' : r.address}</span> },
    {
      key: 'rating',
      label: 'Overall rating',
      render: (r) => (Number(r.overall_rating) > 0 ? <span className="rating-pill">★ {r.overall_rating}</span> : <span style={{ color: 'var(--text-muted)' }}>No ratings yet</span>),
    },
    {
      key: 'user_rating',
      label: 'Your rating',
      sortable: false,
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <StarRating value={r.user_rating || 0} onChange={(n) => submitRating(r.id, n)} />
          {savingId === r.id && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Saving…</span>}
        </div>
      ),
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Browse stores</h1>
          <div className="subtitle">Search by name or address, then click a star to rate.</div>
        </div>
      </div>

      <div className="filters-bar">
        <div className="field">
          <label>Store name</label>
          <input value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} placeholder="Search by name" />
        </div>
        <div className="field">
          <label>Address</label>
          <input value={filters.address} onChange={(e) => setFilters({ ...filters, address: e.target.value })} placeholder="Search by address" />
        </div>
      </div>

      {error && <div className="banner banner-error">{error}</div>}

      {loading ? (
        <div className="spinner-row">Loading stores…</div>
      ) : (
        <SortableTable columns={columns} rows={stores} sortBy={sort.by} sortDir={sort.dir} onSort={handleSort} emptyMessage="No stores match your search." />
      )}
    </div>
  );
}
