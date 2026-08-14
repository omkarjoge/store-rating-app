import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateName, validateAddress, validateEmail, validatePassword } from '../utils/validators';

const initial = { name: '', email: '', address: '', password: '' };

export default function Signup() {
  const { signup } = useAuth();
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
      await signup(form);
      navigate('/stores');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="brand"><span className="mark" style={{ background: 'linear-gradient(155deg,#b8863f,#93692c)' }}>SR</span>Store Ratings</div>
        <div className="lede">Create a normal user account to browse stores and leave ratings.</div>

        {serverError && <div className="banner banner-error">{serverError}</div>}

        <form className="form-grid" onSubmit={handleSubmit} noValidate>
          <div className={`field ${errors.name ? 'invalid' : ''}`}>
            <label htmlFor="name">Full name</label>
            <input id="name" name="name" value={form.name} onChange={handleChange} placeholder="At least 20 characters" />
            <span className="hint">20-60 characters</span>
            {errors.name && <span className="error">{errors.name}</span>}
          </div>
          <div className={`field ${errors.email ? 'invalid' : ''}`}>
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>
          <div className={`field ${errors.address ? 'invalid' : ''}`}>
            <label htmlFor="address">Address</label>
            <textarea id="address" name="address" rows={3} value={form.address} onChange={handleChange} placeholder="Street, city, state" />
            {errors.address && <span className="error">{errors.address}</span>}
          </div>
          <div className={`field ${errors.password ? 'invalid' : ''}`}>
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" />
            <span className="hint">8-16 characters, 1 uppercase letter, 1 special character</span>
            {errors.password && <span className="error">{errors.password}</span>}
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <div className="switcher">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
