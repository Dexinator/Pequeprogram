import React from 'react';
import { AuthProvider } from '../context/AuthContext';

export default function AuthProviderWrapper({ children }) {
  console.log('🌟 AuthProviderWrapper: Renderizando...');
  
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}