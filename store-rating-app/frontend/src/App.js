import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Signup from './pages/Signup';
import UpdatePassword from './pages/UpdatePassword';

import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminAddUser from './pages/AdminAddUser';
import AdminUserDetail from './pages/AdminUserDetail';
import AdminStores from './pages/AdminStores';
import AdminAddStore from './pages/AdminAddStore';

import UserStores from './pages/UserStores';
import StoreOwnerDashboard from './pages/StoreOwnerDashboard';

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (user.role === 'STORE_OWNER') return <Navigate to="/owner" replace />;
  return <Navigate to="/stores" replace />;
}

function Layout({ children }) {
  return (
    <div className="app-shell">
      <Navbar />
      {children}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/" element={<Layout><HomeRedirect /></Layout>} />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <Layout><AdminDashboard /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <Layout><AdminUsers /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/new"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <Layout><AdminAddUser /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/:id"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <Layout><AdminUserDetail /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/stores"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <Layout><AdminStores /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/stores/new"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <Layout><AdminAddStore /></Layout>
              </ProtectedRoute>
            }
          />

          {/* Normal user */}
          <Route
            path="/stores"
            element={
              <ProtectedRoute roles={['NORMAL']}>
                <Layout><UserStores /></Layout>
              </ProtectedRoute>
            }
          />

          {/* Store owner */}
          <Route
            path="/owner"
            element={
              <ProtectedRoute roles={['STORE_OWNER']}>
                <Layout><StoreOwnerDashboard /></Layout>
              </ProtectedRoute>
            }
          />

          {/* Shared */}
          <Route
            path="/account/password"
            element={
              <ProtectedRoute roles={['NORMAL', 'STORE_OWNER', 'ADMIN']}>
                <Layout><UpdatePassword /></Layout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
