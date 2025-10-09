import React, { useState, useEffect } from 'react';

function CategoriesStandalone() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('CategoriesStandalone: Fetching categories with product counts...');
        const API_URL = import.meta.env.PUBLIC_API_URL ||
          (import.meta.env.DEV ? 'http://localhost:3001/api' : 'https://entrepeques-api-19a57de16883.herokuapp.com/api');

        const response = await fetch(`${API_URL}/categories/with-counts`);
        console.log('Response status:', response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Data received:', data);

        // Extract categories from response
        const categoriesData = data.data || data || [];

        // Add emoji mapping (product counts come from API now)
        const categoriesWithIcons = categoriesData.map(cat => ({
          ...cat,
          productCount: cat.product_count || 0,
          emoji: {
            'A pasear': '🚗',
            'A dormir': '🛏️',
            'En Casa': '🏠',
            'A comer': '🍽️',
            'Ropa': '👗',
            'A jugar': '🧸',
          }[cat.name] || '🧸'
        }));

        setCategories(categoriesWithIcons);
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
          <div className="group bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-tr from-brand-verde-lima/20 to-brand-verde-oscuro/20 dark:from-brand-verde-lima/10 dark:to-brand-verde-oscuro/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-4xl">
                {category.emoji}
              </span>
            </div>
            <h3 className="font-heading text-lg font-bold text-brand-azul dark:text-brand-azul-light group-hover:text-brand-azul-profundo transition-colors">
              {category.name}
            </h3>
            {category.productCount > 0 && (
              <span className="inline-block mt-2 px-2 py-1 bg-brand-amarillo/20 dark:bg-brand-amarillo/10 text-gray-700 dark:text-gray-300 rounded-full text-xs font-semibold">
                {category.productCount} {category.productCount === 1 ? 'producto' : 'productos'}
              </span>
            )}
          </div>
        </a>
      ))}
    </div>
  );
}

export default CategoriesStandalone;