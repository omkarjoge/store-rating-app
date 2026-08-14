import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { validateName, validateAddress, validateEmail } from '../utils/validators';

const initial = { name: '', email: '', address: '', ownerId: '' };

export default function AdminAddStore() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const [owners, setOwners] = useState([]);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/admin/store-owners').then(({ data }) => setOwners(data.owners)).catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validateAll = () => {
    const next = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      address: validateAddress(form.address),
    };
    setErrors(next);
    return Object.values(next).every((v) => !v);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validateAll()) return;

    setLoading(true);
    try {
      await api.post('/admin/stores', { ...form, ownerId: form.ownerId || null });
      navigate('/admin/stores');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to create store');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Add store</h1>
          <div className="subtitle">Register a new store on the platform.</div>
        </div>
      </div>

      {serverError && <div className="banner banner-error">{serverError}</div>}

      <div className="card form-card">
        <form className="form-grid" onSubmit={handleSubmit} noValidate>
          <div className={`field ${errors.name ? 'invalid' : ''}`}>
            <label htmlFor="name">Store name</label>
            <input id="name" name="name" value={form.name} onChange={handleChange} />
            <span className="hint">20-60 characters</span>
            {errors.name && <span className="error">{errors.name}</span>}
          </div>
          <div className={`field ${errors.email ? 'invalid' : ''}`}>
            <label htmlFor="email">Store email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>
          <div className={`field ${errors.address ? 'invalid' : ''}`}>
            <label htmlFor="address">Address</label>
            <textarea id="address" name="address" rows={3} value={form.address} onChange={handleChange} />
            {errors.address && <span className="error">{errors.address}</span>}
          </div>
          <div className="field">
            <label htmlFor="ownerId">Store owner (optional)</label>
            <select id="ownerId" name="ownerId" value={form.ownerId} onChange={handleChange}>
              <option value="">No owner linked yet</option>
              {owners.map((o) => (
                <option key={o.id} value={o.id}>{o.name} ({o.email})</option>
              ))}
            </select>
            <span className="hint">Only users with the Store Owner role appear here. Create one first if needed.</span>
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Creating…' : 'Create store'}
          </button>
        </form>
      </div>
    </div>
  );
}
