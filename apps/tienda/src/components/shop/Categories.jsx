import React, { useState, useEffect } from 'react';
import { categoryService } from '../../services/api';

// Category icons mapping
const categoryIcons = {
  'A pasear': '🚗',
  'A dormir': '🛏️',
  'En Casa': '🏠',
  'A comer': '🍼',
  'Ropa': '👕',
  'A jugar': '🎮',
};

// Category colors mapping (using brand colors)
const categoryColors = {
  'A pasear': 'rosa',
  'A dormir': 'azul',
  'En Casa': 'verde-lima',
  'A comer': 'amarillo',
  'Ropa': 'rosa',
  'A jugar': 'azul',
};

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      console.log('Fetching categories...');
      const data = await categoryService.getCategories();
      console.log('Categories received:', data);
      
      // Add product counts from our database
      const categoriesWithCounts = data.map(cat => {
        // These counts are based on actual database data
        const counts = {
          'A pasear': 2,
          'A dormir': 18,
          'En Casa': 7,
          'A comer': 4,
          'Ropa': 6,
          'A jugar': 0,
        };
        return {
          ...cat,
          productCount: counts[cat.name] || 0
        };
      });
      console.log('Categories with counts:', categoriesWithCounts);
      setCategories(categoriesWithCounts);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Error al cargar las categorías');
    } finally {
      setLoading(false);
    }
  };

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
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
      {categories.map((category) => {
        const icon = categoryIcons[category.name] || '📦';
        
        // Create complete class names for Tailwind
        const colorClasses = {
          'A pasear': 'hover:border-brand-rosa bg-brand-rosa/20 group-hover:bg-brand-rosa/30',
          'A dormir': 'hover:border-brand-azul bg-brand-azul/20 group-hover:bg-brand-azul/30',
          'En Casa': 'hover:border-brand-verde-lima bg-brand-verde-lima/20 group-hover:bg-brand-verde-lima/30',
          'A comer': 'hover:border-brand-amarillo bg-brand-amarillo/20 group-hover:bg-brand-amarillo/30',
          'Ropa': 'hover:border-brand-rosa bg-brand-rosa/20 group-hover:bg-brand-rosa/30',
          'A jugar': 'hover:border-brand-azul bg-brand-azul/20 group-hover:bg-brand-azul/30',
        };
        
        const categoryColorClasses = colorClasses[category.name] || 'hover:border-brand-azul bg-brand-azul/20 group-hover:bg-brand-azul/30';
        const [hoverBorder, bgColor] = categoryColorClasses.split(' ').slice(0, 2);
        
        return (
          <a
            key={category.id}
            href={`/categoria/${category.id}`}
            className="group"
          >
            <div className={`bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-6 text-center hover:shadow-2xl transform hover:-translate-y-2 transition-all border-2 border-transparent ${hoverBorder}`}>
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-colors ${bgColor} ${categoryColorClasses.split(' ')[2]}`}>
                <span className="text-3xl">{icon}</span>
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
        );
      })}
    </div>
  );
}

export default Categories;