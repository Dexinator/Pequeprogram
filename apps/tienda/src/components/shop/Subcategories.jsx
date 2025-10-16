import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../services/api';

// Mapeo de subcategorías a íconos SVG
const subcategoryIconMapping = {
  // A pasear
  'Carriolas': 'strollers',
  'Autoasientos': 'car-seat',
  'Correpasillos': 'ride-on',
  'Andaderas': 'walker',
  'Otros Paseo': 'other-travel',
  
  // A dormir
  'Cunas': 'cribs',
  'Accesorios Cunas': 'crib-accessories',
  'Mecedoras': 'rocking-chair',
  
  // En Casa
  'Seguridad': 'safety',
  'Baño': 'bathroom',
  
  // A comer
  'Sillas para Comer': 'high-chairs',
  'Procesador de Alimentos': 'food-processor',
  'Lactancia': 'breastfeeding',
  
  // Ropa
  'Ropa Niña': 'girl',
  'Ropa Niño': 'boy',
  'Ropa Dama': 'women-clothing',
  'Calzado Niño': 'boys-footwear',
  'Calzado Niña': 'girls-footwear',
  'Accesorios Dama': 'women-accessories',
  'Disfraces': 'costume',
  
  // A jugar
  'Juguetes': 'toys',
  'Libros': 'books',
  'Juegos Grandes': 'playground',
  'Sobre Ruedas': 'bicycle',
  'Montables de exterior': 'ride-on',
  'Triciclos y bicicletas': 'bicycle',
  'Sillas para bicicleta': 'car-seat',
};

// Mapeo de categorías a íconos principales
const categoryIconMapping = {
  'A pasear': 'strollers',
  'A dormir': 'cribs',
  'En Casa': 'safety',
  'A comer': 'high-chairs',
  'Ropa': 'women-clothing',
  'A jugar': 'toys',
};

const Subcategories = ({ categoryId, categoryName, categoryIcon, categoryGroups }) => {
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Si tenemos grupos pasados como prop, usarlos directamente
    if (categoryGroups && categoryGroups.length > 0) {
      setSubcategories(categoryGroups);
      setLoading(false);
      return;
    }

    // Si no hay grupos, intentar cargar desde la API (fallback)
    const loadSubcategories = async () => {
      if (!categoryId) {
        setError('No se especificó una categoría');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await fetchApi(`/categories/${categoryId}/subcategories`);
        
        // La API devuelve directamente el array, no un objeto con success/data
        if (Array.isArray(response)) {
          setSubcategories(response);
        } else if (response.success && response.data) {
          // Por si acaso la API cambia en el futuro
          setSubcategories(response.data);
        } else {
          setSubcategories([]);
        }
      } catch (error) {
        console.error('Error al cargar subcategorías:', error);
        setError('Error al cargar las subcategorías');
      } finally {
        setLoading(false);
      }
    };

    loadSubcategories();
  }, [categoryId, categoryGroups]);

  // Colores temáticos por categoría
  const getCategoryColors = (categoryName) => {
    const colorMap = {
      'A pasear': {
        gradient: 'from-brand-azul/20 to-brand-verde-lima/20',
        dark: 'dark:from-brand-azul/10 dark:to-brand-verde-lima/10',
        accent: 'bg-brand-azul hover:bg-brand-azul-profundo',
        badge: 'bg-brand-verde-lima',
        border: 'border-brand-azul'
      },
      'A dormir': {
        gradient: 'from-brand-rosa/20 to-brand-amarillo/20',
        dark: 'dark:from-brand-rosa/10 dark:to-brand-amarillo/10',
        accent: 'bg-brand-rosa hover:bg-brand-rosa/80',
        badge: 'bg-brand-amarillo',
        border: 'border-brand-rosa'
      },
      'En Casa': {
        gradient: 'from-brand-verde-lima/20 to-brand-verde-oscuro/20',
        dark: 'dark:from-brand-verde-lima/10 dark:to-brand-verde-oscuro/10',
        accent: 'bg-brand-verde-lima hover:bg-brand-verde-oscuro',
        badge: 'bg-brand-azul',
        border: 'border-brand-verde-lima'
      },
      'A comer': {
        gradient: 'from-brand-amarillo/20 to-brand-rosa/20',
        dark: 'dark:from-brand-amarillo/10 dark:to-brand-rosa/10',
        accent: 'bg-brand-amarillo hover:bg-brand-amarillo/80',
        badge: 'bg-brand-rosa',
        border: 'border-brand-amarillo'
      },
      'Ropa': {
        gradient: 'from-brand-rosa/20 to-brand-azul/20',
        dark: 'dark:from-brand-rosa/10 dark:to-brand-azul/10',
        accent: 'bg-brand-rosa hover:bg-brand-rosa/80',
        badge: 'bg-brand-azul',
        border: 'border-brand-rosa'
      },
      'A jugar': {
        gradient: 'from-brand-azul/20 to-brand-amarillo/20',
        dark: 'dark:from-brand-azul/10 dark:to-brand-amarillo/10',
        accent: 'bg-brand-azul hover:bg-brand-azul-profundo',
        badge: 'bg-brand-amarillo',
        border: 'border-brand-azul'
      }
    };

    return colorMap[categoryName] || colorMap['A pasear'];
  };

  const colors = getCategoryColors(categoryName);

  // Función para generar un slug a partir del nombre
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
      .replace(/[^a-z0-9]+/g, '-') // Reemplazar caracteres especiales con guiones
      .replace(/^-+|-+$/g, ''); // Eliminar guiones al inicio y final
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-azul"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-body">Cargando subcategorías...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
          <p className="text-red-600 dark:text-red-400 font-body">{error}</p>
          <button 
            onClick={() => window.location.href = '/categorias'}
            className="mt-4 px-6 py-2 bg-brand-azul hover:bg-brand-azul-profundo text-white rounded-lg transition-colors"
          >
            Volver a categorías
          </button>
        </div>
      </div>
    );
  }

  if (!subcategories || subcategories.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 font-body text-lg">
            No hay subcategorías disponibles en esta categoría.
          </p>
          <button 
            onClick={() => window.location.href = '/categorias'}
            className="mt-4 px-6 py-2 bg-brand-azul hover:bg-brand-azul-profundo text-white rounded-lg transition-colors"
          >
            Volver a categorías
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <a href="/" className="text-brand-azul hover:text-brand-azul-profundo transition-colors">
                Inicio
              </a>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <a href="/categorias" className="text-brand-azul hover:text-brand-azul-profundo transition-colors">
                Categorías
              </a>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-700 dark:text-gray-300 font-semibold">{categoryName}</li>
          </ol>
        </nav>

        {/* Header Section */}
        <section className={`bg-gradient-to-br ${colors.gradient} ${colors.dark} rounded-3xl p-8 md:p-12 mb-12`}>
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6">
              <img 
                src={`/icons/ep-${categoryIcon || categoryIconMapping[categoryName] || 'toys'}.svg`}
                alt={categoryName}
                className="w-24 h-24 mx-auto opacity-80"
              />
            </div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-brand-rosa mb-4 animate-float">
              {categoryName}
            </h1>
            <p className="font-body text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-6">
              Explora todas nuestras opciones de {categoryName.toLowerCase()}
            </p>
            <div className="flex justify-center gap-3">
              <span className={`px-4 py-2 ${colors.badge} text-white rounded-full font-semibold text-sm`}>
                {subcategories.length} {subcategories.length === 1 ? 'grupo' : 'grupos'}
              </span>
              <span className="px-4 py-2 bg-brand-verde-lima text-white rounded-full font-semibold text-sm">
                ♻️ Segunda mano
              </span>
            </div>
          </div>
        </section>

        {/* Subcategories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {subcategories.map((group, index) => {
            // Verificar si es un grupo de la nueva estructura o una subcategoría de la API
            const isGroup = group.type !== undefined;
            const groupIcon = isGroup ? group.icon : (subcategoryIconMapping[group.name] || categoryIconMapping[categoryName] || 'toys');
            const groupSlug = isGroup ? group.slug : generateSlug(group.name);
            const groupName = isGroup ? group.name : group.name;
            const hasSubcategories = isGroup && group.type === 'grouped' && group.subcategories;
            const hasSubcategoryIds = isGroup && (group.subcategoryIds || group.subcategoryId);

            // Construir el href basado en si tiene IDs de subcategorías
            let href = `/productos?categoria=${categoryId}`;
            if (hasSubcategoryIds) {
              if (group.subcategoryIds) {
                // Grupo con múltiples subcategorías
                href += `&subcats=${group.subcategoryIds.join(',')}`;
              } else if (group.subcategoryId) {
                // Grupo con una sola subcategoría
                href += `&subcats=${group.subcategoryId}`;
              }
              href += `&nombre=${encodeURIComponent(groupName)}`;
            } else {
              // Fallback al comportamiento anterior para compatibilidad
              href += `&search=${encodeURIComponent(groupName)}&nombre=${encodeURIComponent(groupName)}`;
            }

            return (
              <a
                key={group.id || index}
                href={href}
                className={`group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 border-2 ${colors.border} border-opacity-20`}
              >
                {/* Imagen con ícono SVG */}
                <div className={`w-full h-48 bg-gradient-to-br ${colors.gradient} rounded-xl mb-4 flex items-center justify-center group-hover:scale-105 transition-transform`}>
                  <img 
                    src={`/icons/ep-${groupIcon}.svg`}
                    alt={groupName}
                    className="w-20 h-20 opacity-60 group-hover:opacity-80 transition-opacity"
                    loading="lazy"
                  />
                </div>

                {/* Contenido */}
                <h3 className="font-heading text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-brand-azul transition-colors">
                  {groupName}
                </h3>
                
                {/* Mostrar subcategorías si es un grupo agrupado */}
                {hasSubcategories && (
                  <ul className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {group.subcategories.slice(0, 3).map((sub, idx) => (
                      <li key={idx} className="truncate">• {sub}</li>
                    ))}
                    {group.subcategories.length > 3 && (
                      <li className="text-brand-azul">+{group.subcategories.length - 3} más...</li>
                    )}
                  </ul>
                )}
                
                {/* Badge */}
                <div className="flex items-center justify-between mt-4">
                  {isGroup && group.type === 'grouped' ? (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {group.subcategories.length} categorías
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                      {group.sku ? `SKU: ${group.sku}` : 'Ver productos'}
                    </span>
                  )}
                  <span className={`px-3 py-1 ${colors.accent} text-white rounded-full text-xs font-semibold transition-colors`}>
                    Ver →
                  </span>
                </div>
              </a>
            );
          })}
        </div>

        {/* CTA Section */}
        <section className="mt-16 bg-gradient-to-r from-brand-verde-lima to-brand-verde-oscuro rounded-3xl p-8 md:p-12 text-white">
          <div className="mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl mb-4">
              ¿No encuentras lo que buscas?
            </h2>
            <p className="font-body text-lg mb-6 opacity-90">
              Nuestro inventario se actualiza constantemente. Visítanos en tienda o contáctanos para más información.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="tel:5565883245"
                className="px-8 py-3 bg-white text-brand-verde-oscuro hover:bg-gray-100 font-semibold rounded-lg transition-colors shadow-lg"
              >
                Contáctanos
              </a>
              <a
                href="/#tienda"
                className="px-8 py-3 bg-brand-azul hover:bg-brand-azul-profundo text-white font-semibold rounded-lg transition-colors shadow-lg"
              >
                Visita nuestras tienda
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Subcategories;