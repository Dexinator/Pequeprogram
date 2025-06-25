import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import AuthGuard from './auth/AuthGuard';

export default function AuthProviderWrapper({ children }) {
  console.log('🌟 AuthProviderWrapper: Renderizando...');
  
  return (
    <AuthProvider>
      <AuthGuard>
        {children}
      </AuthGuard>
    </AuthProvider>
  );
}