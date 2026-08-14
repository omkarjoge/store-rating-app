import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import SortableTable from '../components/SortableTable';

export default function StoreOwnerDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [sort, setSort] = useState({ by: 'updated_at', dir: 'desc' });

  useEffect(() => {
    api
      .get('/ratings/my-store')
      .then(({ data }) => setData(data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load your store dashboard'));
  }, []);

  const handleSort = (key) => {
    setSort((prev) => (prev.by === key ? { by: key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { by: key, dir: 'asc' }));
  };

  const sortedRaters = data
    ? [...data.raters].sort((a, b) => {
        const dir = sort.dir === 'asc' ? 1 : -1;
        if (a[sort.by] < b[sort.by]) return -1 * dir;
        if (a[sort.by] > b[sort.by]) return 1 * dir;
        return 0;
      })
    : [];

  const columns = [
    { key: 'name', label: 'User' },
    { key: 'email', label: 'Email' },
    { key: 'rating', label: 'Rating', render: (r) => <span className="rating-pill">★ {r.rating}</span> },
    { key: 'updated_at', label: 'Submitted', render: (r) => new Date(r.updated_at).toLocaleDateString() },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>My store</h1>
          <div className="subtitle">Track ratings your customers have left.</div>
        </div>
      </div>

      {error && <div className="banner banner-error">{error}</div>}

      {!data && !error && <div className="spinner-row">Loading…</div>}

      {data && (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-label">Store</div>
              <div className="stat-value" style={{ fontSize: 22 }}>{data.store.name}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Average rating</div>
              <div className="stat-value">{data.averageRating > 0 ? `★ ${data.averageRating}` : '—'}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Ratings received</div>
              <div className="stat-value">{data.ratingCount}</div>
            </div>
          </div>

          <h2 className="section-gap" style={{ marginBottom: 12 }}>Ratings from users</h2>
          <SortableTable
            columns={columns}
            rows={sortedRaters}
            sortBy={sort.by}
            sortDir={sort.dir}
            onSort={handleSort}
            emptyMessage="No one has rated your store yet."
          />
        </>
      )}
    </div>
  );
}
