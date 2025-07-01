import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import AuthGuard from './auth/AuthGuard';
import AdminApp from './AdminApp';

export default function AdminDashboard() {
  return (
    <AuthProvider>
      <AuthGuard allowedRoles={['superadmin', 'admin']}>
        <AdminApp />
      </AuthGuard>
    </AuthProvider>
  );
}