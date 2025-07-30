import React from 'react';

function CategoriesSimple() {
  // Datos hardcodeados para probar
  const categories = [
    { id: 1, name: 'A pasear', productCount: 2, icon: '🚗' },
    { id: 2, name: 'A dormir', productCount: 18, icon: '🛏️' },
    { id: 3, name: 'En Casa', productCount: 7, icon: '🏠' },
    { id: 4, name: 'A comer', productCount: 4, icon: '🍼' },
    { id: 5, name: 'Ropa', productCount: 6, icon: '👕' },
    { id: 6, name: 'A jugar', productCount: 0, icon: '🎮' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
      {categories.map((category) => (
        <a
          key={category.id}
          href={`/categoria/${category.id}`}
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

export default CategoriesSimple;