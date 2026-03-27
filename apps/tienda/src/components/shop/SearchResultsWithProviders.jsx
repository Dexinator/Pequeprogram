import React from 'react';
import { AuthProvider } from '../../context/AuthContext';
import { CartProvider } from '../../context/CartContext';
import SearchResults from './SearchResults';

const SearchResultsWithProviders = ({ initialQuery = '' }) => {
  return (
    <AuthProvider>
      <CartProvider>
        <SearchResults initialQuery={initialQuery} />
      </CartProvider>
    </AuthProvider>
  );
};

export default SearchResultsWithProviders;
