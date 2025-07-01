import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import AuthGuard from './auth/AuthGuard';
import POSApp from './POSApp';

export default function POSDashboard() {
  return (
    <AuthProvider>
      <AuthGuard allowedRoles={['superadmin', 'admin', 'gerente', 'vendedor']}>
        <POSApp />
      </AuthGuard>
    </AuthProvider>
  );
}