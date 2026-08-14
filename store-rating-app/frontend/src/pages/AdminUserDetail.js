import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import RoleBadge from '../components/RoleBadge';

export default function AdminUserDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/admin/users/${id}`)
      .then(({ data }) => setUser(data.user))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load user'));
  }, [id]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>User detail</h1>
          <div className="subtitle"><Link to="/admin/users">← Back to users</Link></div>
        </div>
      </div>

      {error && <div className="banner banner-error">{error}</div>}

      {!user && !error && <div className="spinner-row">Loading…</div>}

      {user && (
        <div className="card" style={{ maxWidth: 520 }}>
          <div style={{ marginBottom: 14 }}><RoleBadge role={user.role} /></div>
          <dl style={{ display: 'grid', gridTemplateColumns: '120px 1fr', rowGap: 12, columnGap: 8, margin: 0 }}>
            <dt style={{ color: 'var(--text-muted)', fontSize: 13 }}>Name</dt>
            <dd style={{ margin: 0 }}>{user.name}</dd>
            <dt style={{ color: 'var(--text-muted)', fontSize: 13 }}>Email</dt>
            <dd style={{ margin: 0 }}>{user.email}</dd>
            <dt style={{ color: 'var(--text-muted)', fontSize: 13 }}>Address</dt>
            <dd style={{ margin: 0 }}>{user.address}</dd>
            {user.role === 'STORE_OWNER' && (
              <>
                <dt style={{ color: 'var(--text-muted)', fontSize: 13 }}>Store rating</dt>
                <dd style={{ margin: 0 }}>
                  {user.rating ? <span className="rating-pill">★ {user.rating}</span> : <span style={{ color: 'var(--text-muted)' }}>No ratings yet</span>}
                </dd>
              </>
            )}
            <dt style={{ color: 'var(--text-muted)', fontSize: 13 }}>Joined</dt>
            <dd style={{ margin: 0 }}>{new Date(user.created_at).toLocaleDateString()}</dd>
          </dl>
        </div>
      )}
    </div>
  );
}
