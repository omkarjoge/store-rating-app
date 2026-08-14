import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { validateName, validateAddress, validateEmail, validatePassword } from '../utils/validators';

const initial = { name: '', email: '', address: '', password: '', role: 'NORMAL' };

export default function AdminAddUser() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validateAll = () => {
    const next = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      address: validateAddress(form.address),
      password: validatePassword(form.password),
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
      await api.post('/admin/users', form);
      navigate('/admin/users');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Add user</h1>
          <div className="subtitle">Create a new admin, normal user, or store owner account.</div>
        </div>
      </div>

      {serverError && <div className="banner banner-error">{serverError}</div>}

      <div className="card form-card">
        <form className="form-grid" onSubmit={handleSubmit} noValidate>
          <div className={`field ${errors.name ? 'invalid' : ''}`}>
            <label htmlFor="name">Full name</label>
            <input id="name" name="name" value={form.name} onChange={handleChange} />
            <span className="hint">20-60 characters</span>
            {errors.name && <span className="error">{errors.name}</span>}
          </div>
          <div className={`field ${errors.email ? 'invalid' : ''}`}>
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>
          <div className={`field ${errors.address ? 'invalid' : ''}`}>
            <label htmlFor="address">Address</label>
            <textarea id="address" name="address" rows={3} value={form.address} onChange={handleChange} />
            {errors.address && <span className="error">{errors.address}</span>}
          </div>
          <div className={`field ${errors.password ? 'invalid' : ''}`}>
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" value={form.password} onChange={handleChange} />
            <span className="hint">8-16 characters, 1 uppercase letter, 1 special character</span>
            {errors.password && <span className="error">{errors.password}</span>}
          </div>
          <div className="field">
            <label htmlFor="role">Role</label>
            <select id="role" name="role" value={form.role} onChange={handleChange}>
              <option value="NORMAL">Normal user</option>
              <option value="ADMIN">System administrator</option>
              <option value="STORE_OWNER">Store owner</option>
            </select>
            <span className="hint">Store owners can then be linked to a store from the "Add store" form.</span>
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Creating…' : 'Create user'}
          </button>
        </form>
      </div>
    </div>
  );
}
