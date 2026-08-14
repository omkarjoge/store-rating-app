import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import SortableTable from '../components/SortableTable';
import RoleBadge from '../components/RoleBadge';

export default function AdminUsers() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [sort, setSort] = useState({ by: 'name', dir: 'asc' });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    api
      .get('/admin/users', {
        params: { ...filters, sortBy: sort.by, sortDir: sort.dir },
      })
      .then(({ data }) => setUsers(data.users))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load users'))
      .finally(() => setLoading(false));
  }, [filters, sort]);

  useEffect(() => {
    const t = setTimeout(load, 250); // light debounce for text filters
    return () => clearTimeout(t);
  }, [load]);

  const handleSort = (key) => {
    setSort((prev) => (prev.by === key ? { by: key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { by: key, dir: 'asc' }));
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'address', label: 'Address', render: (r) => <span title={r.address}>{r.address.length > 40 ? r.address.slice(0, 40) + '…' : r.address}</span> },
    { key: 'role', label: 'Role', render: (r) => <RoleBadge role={r.role} /> },
    {
      key: 'actions',
      label: '',
      sortable: false,
      render: (r) => <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/admin/users/${r.id}`)}>View</button>,
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Users</h1>
          <div className="subtitle">Normal users, admins, and store owners on the platform.</div>
        </div>
        <Link to="/admin/users/new" className="btn btn-accent">+ Add user</Link>
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
        <div className="field">
          <label>Role</label>
          <select value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })}>
            <option value="">All roles</option>
            <option value="ADMIN">Admin</option>
            <option value="NORMAL">Normal</option>
            <option value="STORE_OWNER">Store Owner</option>
          </select>
        </div>
      </div>

      {error && <div className="banner banner-error">{error}</div>}

      {loading ? (
        <div className="spinner-row">Loading users…</div>
      ) : (
        <SortableTable
          columns={columns}
          rows={users}
          sortBy={sort.by}
          sortDir={sort.dir}
          onSort={handleSort}
          emptyMessage="No users match these filters."
        />
      )}
    </div>
  );
}
