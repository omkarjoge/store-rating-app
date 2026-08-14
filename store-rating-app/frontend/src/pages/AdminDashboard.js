import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/admin/dashboard')
      .then(({ data }) => setStats(data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'));
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Administrator dashboard</h1>
          <div className="subtitle">Platform-wide totals at a glance.</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/admin/users/new" className="btn btn-accent">+ Add user</Link>
          <Link to="/admin/stores/new" className="btn btn-primary">+ Add store</Link>
        </div>
      </div>

      {error && <div className="banner banner-error">{error}</div>}

      {!stats && !error && <div className="spinner-row">Loading stats…</div>}

      {stats && (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-label">Total users</div>
            <div className="stat-value">{stats.totalUsers}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total stores</div>
            <div className="stat-value">{stats.totalStores}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Ratings submitted</div>
            <div className="stat-value">{stats.totalRatings}</div>
          </div>
        </div>
      )}

      <div className="card">
        <h3>Quick links</h3>
        <p className="subtitle" style={{ marginBottom: 12 }}>Jump straight to a listing or management form.</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link to="/admin/users" className="btn btn-ghost">View all users</Link>
          <Link to="/admin/stores" className="btn btn-ghost">View all stores</Link>
        </div>
      </div>
    </div>
  );
}
