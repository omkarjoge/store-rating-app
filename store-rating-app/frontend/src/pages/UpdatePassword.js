import React, { useState } from 'react';
import api from '../api/axios';
import { validatePassword } from '../utils/validators';

export default function UpdatePassword() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBanner(null);

    const next = {};
    if (!form.currentPassword) next.currentPassword = 'Current password is required';
    const pwErr = validatePassword(form.newPassword);
    if (pwErr) next.newPassword = pwErr;
    if (form.newPassword !== form.confirmPassword) next.confirmPassword = 'Passwords do not match';
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      await api.put('/auth/password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setBanner({ type: 'success', text: 'Password updated successfully.' });
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setBanner({ type: 'error', text: err.response?.data?.message || 'Failed to update password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Update password</h1>
          <div className="subtitle">Change the password used to sign in to your account.</div>
        </div>
      </div>

      {banner && <div className={`banner banner-${banner.type}`}>{banner.text}</div>}

      <div className="card form-card">
        <form className="form-grid" onSubmit={handleSubmit} noValidate>
          <div className={`field ${errors.currentPassword ? 'invalid' : ''}`}>
            <label htmlFor="currentPassword">Current password</label>
            <input id="currentPassword" name="currentPassword" type="password" value={form.currentPassword} onChange={handleChange} />
            {errors.currentPassword && <span className="error">{errors.currentPassword}</span>}
          </div>
          <div className={`field ${errors.newPassword ? 'invalid' : ''}`}>
            <label htmlFor="newPassword">New password</label>
            <input id="newPassword" name="newPassword" type="password" value={form.newPassword} onChange={handleChange} />
            <span className="hint">8-16 characters, 1 uppercase letter, 1 special character</span>
            {errors.newPassword && <span className="error">{errors.newPassword}</span>}
          </div>
          <div className={`field ${errors.confirmPassword ? 'invalid' : ''}`}>
            <label htmlFor="confirmPassword">Confirm new password</label>
            <input id="confirmPassword" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} />
            {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
}
