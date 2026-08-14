import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="topbar">
      <div className="brand">
        <span className="mark">SR</span>
        Store Ratings
      </div>
      <nav>
        {user.role === 'ADMIN' && (
          <>
            <NavLink to="/admin" end className={({ isActive }) => (isActive ? 'active' : '')}>
              Dashboard
            </NavLink>
            <NavLink to="/admin/users" className={({ isActive }) => (isActive ? 'active' : '')}>
              Users
            </NavLink>
            <NavLink to="/admin/stores" className={({ isActive }) => (isActive ? 'active' : '')}>
              Stores
            </NavLink>
          </>
        )}
        {user.role === 'NORMAL' && (
          <>
            <NavLink to="/stores" end className={({ isActive }) => (isActive ? 'active' : '')}>
              Stores
            </NavLink>
            <NavLink to="/account/password" className={({ isActive }) => (isActive ? 'active' : '')}>
              Password
            </NavLink>
          </>
        )}
        {user.role === 'STORE_OWNER' && (
          <>
            <NavLink to="/owner" end className={({ isActive }) => (isActive ? 'active' : '')}>
              My Store
            </NavLink>
            <NavLink to="/account/password" className={({ isActive }) => (isActive ? 'active' : '')}>
              Password
            </NavLink>
          </>
        )}
        <span className="who">{user.name} · {user.role.replace('_', ' ')}</span>
        <button className="linklike" onClick={handleLogout}>Log out</button>
      </nav>
    </div>
  );
}
