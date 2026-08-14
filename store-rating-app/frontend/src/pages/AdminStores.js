import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import SortableTable from '../components/SortableTable';

export default function AdminStores() {
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [sort, setSort] = useState({ by: 'name', dir: 'asc' });
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    api
      .get('/admin/stores', { params: { ...filters, sortBy: sort.by, sortDir: sort.dir } })
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

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'address', label: 'Address', render: (r) => <span title={r.address}>{r.address.length > 40 ? r.address.slice(0, 40) + '…' : r.address}</span> },
    {
      key: 'rating',
      label: 'Rating',
      render: (r) => (Number(r.rating) > 0 ? <span className="rating-pill">★ {r.rating}</span> : <span style={{ color: 'var(--text-muted)' }}>No ratings</span>),
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Stores</h1>
          <div className="subtitle">All stores registered on the platform.</div>
        </div>
        <Link to="/admin/stores/new" className="btn btn-accent">+ Add store</Link>
      </div>

      <div className="filters-bar">
        <div className="field">
          <label>Name</label>
          <input value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} placeholder="Filter by name" />
        </div>
        <div className="field">
          <label>Email</label>
          <input value={filters.email} onChange={(e) => setFilters({ ...filters, email: e.target.value })} placeholder="Filter by email" />
        </div>
        <div className="field">
          <label>Address</label>
          <input value={filters.address} onChange={(e) => setFilters({ ...filters, address: e.target.value })} placeholder="Filter by address" />
        </div>
      </div>

      {error && <div className="banner banner-error">{error}</div>}

      {loading ? (
        <div className="spinner-row">Loading stores…</div>
      ) : (
        <SortableTable columns={columns} rows={stores} sortBy={sort.by} sortDir={sort.dir} onSort={handleSort} emptyMessage="No stores match these filters." />
      )}
    </div>
  );
}
