import React from 'react';

// Mapping of category/subcategory names to icon names
const iconMapping = {
  // Categories
  'Juguetes': 'toys',
  'Ropa Niña': 'girl',
  'Ropa Niño': 'boy',
  'Ropa Dama': 'women-clothing',
  'Calzado Niño': 'boys-footwear',
  'Calzado Niña': 'girls-footwear',
  'Accesorios Dama': 'women-accessories',
  
  // Subcategories
  'Andaderas': 'walker',
  'Carriolas': 'strollers',
  'Cunas': 'cribs',
  'Autoasientos': 'car-seat',
  'Sillas para Comer': 'high-chairs',
  'Mecedoras': 'rocking-chair',
  'Procesador de Alimentos': 'food-processor',
  'Lactancia': 'breastfeeding',
  'Baño': 'bathroom',
  'Seguridad': 'safety',
  'Libros': 'books',
  'Accesorios Cunas': 'crib-accessories',
  'Correpasillos': 'ride-on',
  'Sobre Ruedas': 'bicycle',
  'Otros Paseo': 'other-travel',
  'Disfraces': 'costume',
  'Juegos Grandes': 'playground',
  'Montables de exterior': 'ride-on',
  'Triciclos y bicicletas': 'bicycle',
  'Sillas para bicicleta': 'car-seat',
};

// Component to display category icon
export const CategoryIcon = ({ categoryName, className = "", size = 32 }) => {
  const iconName = iconMapping[categoryName];
  
  if (!iconName) {
    // Return a default placeholder if no icon is found
    return (
      <div 
        className={`bg-pink-100 rounded-lg flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-pink-500 text-sm font-bold">
          {categoryName?.charAt(0) || '?'}
        </span>
      </div>
    );
  }
  
  return (
    <img 
      src={`/icons/ep-${iconName}.svg`}
      alt={categoryName}
      className={className}
      width={size}
      height={size}
      loading="lazy"
    />
  );
};

// Component to display a grid of categories with icons
export const CategoryGrid = ({ categories = [] }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
      {categories.map((category) => (
        <div 
          key={category.id || category.name}
          className="flex flex-col items-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer group"
        >
          <div className="mb-4 p-4 bg-gradient-to-br from-pink-50 to-yellow-50 rounded-full group-hover:scale-110 transition-transform">
            <CategoryIcon 
              categoryName={category.name} 
              size={48}
              className="text-pink-500"
            />
          </div>
          <h3 className="text-center font-semibold text-gray-800 group-hover:text-pink-600 transition-colors">
            {category.name}
          </h3>
          {category.productCount && (
            <span className="mt-2 text-sm text-gray-500">
              {category.productCount} productos
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

// Example usage component
export const CategoryIconsExample = () => {
  const sampleCategories = [
    { id: 1, name: 'Juguetes', productCount: 145 },
    { id: 2, name: 'Carriolas', productCount: 23 },
    { id: 3, name: 'Cunas', productCount: 18 },
    { id: 4, name: 'Ropa Niña', productCount: 89 },
    { id: 5, name: 'Calzado Niño', productCount: 34 },
    { id: 6, name: 'Autoasientos', productCount: 12 },
    { id: 7, name: 'Libros', productCount: 67 },
    { id: 8, name: 'Baño', productCount: 28 },
  ];
  
  return (
    <div className="max-w-7xl mx-auto p-8">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Nuestras Categorías
      </h2>
      <CategoryGrid categories={sampleCategories} />
    </div>
  );
};

export default CategoryIcon;