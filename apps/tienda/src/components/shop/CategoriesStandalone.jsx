import React, { useState, useEffect } from 'react';

function CategoriesStandalone() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('CategoriesStandalone: Fetching categories...');
        const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3001/api';
        
        const response = await fetch(`${API_URL}/categories`);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Data received:', data);
        
        // Extract categories from response
        const categoriesData = data.data || data || [];
        
        // Add product counts
        const categoriesWithCounts = categoriesData.map(cat => ({
          ...cat,
          productCount: {
            'A pasear': 2,
            'A dormir': 18,
            'En Casa': 7,
            'A comer': 4,
            'Ropa': 6,
            'A jugar': 0,
          }[cat.name] || 0,
          icon: {
            'A pasear': '🚗',
            'A dormir': '🛏️',
            'En Casa': '🏠',
            'A comer': '🍼',
            'Ropa': '👕',
            'A jugar': '🎮',
          }[cat.name] || '📦'
        }));
        
        setCategories(categoriesWithCounts);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl p-8 h-40"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400">Error: {error}</p>
      </div>
    );
  }

          // Función para generar slug
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
      .replace(/[^a-z0-9]+/g, '-') // Reemplazar caracteres especiales con guiones
      .replace(/^-+|-+$/g, ''); // Eliminar guiones al inicio y final
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
      {categories.map((category) => (
        <a
          key={category.id}
          href={`/categoria/${generateSlug(category.name)}`}
          className="group"
        >
          <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-6 text-center hover:shadow-2xl transform hover:-translate-y-2 transition-all border-2 border-transparent hover:border-brand-azul">
            <div className="w-16 h-16 mx-auto mb-4 bg-brand-azul/20 rounded-2xl flex items-center justify-center group-hover:bg-brand-azul/30 transition-colors">
              <span className="text-3xl">{category.icon}</span>
            </div>
            <h3 className="font-heading text-lg font-semibold text-gray-800 dark:text-gray-200">
              {category.name}
            </h3>
            {category.productCount > 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {category.productCount} {category.productCount === 1 ? 'producto' : 'productos'}
              </p>
            )}
          </div>
        </a>
      ))}
    </div>
  );
}

export default CategoriesStandalone;