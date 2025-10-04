// Estructura completa de categorías con agrupaciones
// Refleja exactamente cómo están organizadas en entrepeques.mx

export const categoryGroupsComplete = {
  'A pasear': {
    id: 1,
    icon: 'strollers',
    slug: 'a-pasear',
    groups: [
      {
        name: 'Autoasientos',
        type: 'grouped', // Indica que tiene subcategorías agrupadas
        icon: 'car-seat',
        slug: 'autoasientos',
        subcategories: [
          'Portabebé 0-13 kg',
          'Autoasientos 0-18 a 30 kg', 
          'Booster 0-18 a 49 Kg'
        ]
      },
      {
        name: 'Carriolas',
        type: 'grouped',
        icon: 'strollers',
        slug: 'carriolas',
        subcategories: [
          'Con Portabebé',
          'Sin Portabebé',
          'Doble'
        ]
      },
      {
        name: 'Sobre Ruedas',
        type: 'single',
        icon: 'wheels',
        slug: 'sobre-ruedas'
      },
      {
        name: 'Otros de paseo',
        type: 'single',
        icon: 'other-travel',
        slug: 'otros-paseo'
      }
    ]
  },

  'A dormir': {
    id: 2,
    icon: 'cribs',
    slug: 'a-dormir',
    groups: [
      {
        name: 'Cunas, colechos y muebles',
        type: 'grouped',
        icon: 'cribs',
        slug: 'cunas-colechos-muebles',
        subcategories: [
          'Cunas de madera',
          'Cunas de viaje',
          'Colechos y Moisés',
          'Muebles de recámara'
        ]
      },
      {
        name: 'Accesorios de cunas, colchones y almohadas',
        type: 'grouped',
        icon: 'crib-accessories',
        slug: 'accesorios-cunas',
        subcategories: [
          'Juegos de cuna',
          'Colchones',
          'Almohadas y donas',
          'Móviles de cuna',
          'Barandal para cama',
          'Accesorios recámara'
        ]
      }
    ]
  },

  'En casa': {
    id: 3,
    icon: 'safety',
    slug: 'en-casa',
    groups: [
      {
        name: 'Mecedoras y Columpios de bebé',
        type: 'single',
        icon: 'rocking-chair',
        slug: 'mecedoras-columpios'
      },
      {
        name: 'Andaderas, Brincolines y Corrales',
        type: 'grouped',
        icon: 'walker',
        slug: 'andaderas-brincolines',
        subcategories: [
          'Andaderas',
          'Brincolines',
          'Corrales'
        ]
      },
      {
        name: 'Seguridad',
        type: 'single',
        icon: 'safety',
        slug: 'seguridad'
      },
      {
        name: 'Baño y Accesorios',
        type: 'single',
        icon: 'bathroom',
        slug: 'bano-accesorios'
      }
    ]
  },

  'A comer': {
    id: 4,
    icon: 'high-chairs',
    slug: 'a-comer',
    groups: [
      {
        name: 'Lactancia',
        type: 'single',
        icon: 'breastfeeding',
        slug: 'lactancia'
      },
      {
        name: 'Sillas para comer',
        type: 'single',
        icon: 'high-chairs',
        slug: 'sillas-comer'
      },
      {
        name: 'Procesador de alimentos',
        type: 'single',
        icon: 'food-processor',
        slug: 'procesador-alimentos'
      }
    ]
  },

  'Ropa': {
    id: 5,
    icon: 'women-clothing',
    slug: 'ropa',
    groups: [
      {
        name: 'Niña',
        type: 'single',
        icon: 'girl',
        slug: 'nina'
      },
      {
        name: 'Calzado Niña',
        type: 'single',
        icon: 'girls-footwear',
        slug: 'calzado-nina'
      },
      {
        name: 'Niño',
        type: 'single',
        icon: 'boy',
        slug: 'nino'
      },
      {
        name: 'Calzado Niño',
        type: 'single',
        icon: 'boys-footwear',
        slug: 'calzado-nino'
      },
      {
        name: 'Ropa de Dama y Maternidad',
        type: 'grouped',
        icon: 'women-clothing',
        slug: 'ropa-dama-maternidad',
        subcategories: [
          'Ropa de Dama',
          'Ropa de Maternidad'
        ]
      }
    ]
  },

  'A jugar': {
    id: 6,
    icon: 'toys',
    slug: 'a-jugar',
    groups: [
      {
        name: 'Juguetes (por edad)',
        type: 'grouped',
        icon: 'toys',
        slug: 'juguetes-edad',
        subcategories: [
          '0-12 meses',
          '1-3 años',
          '3-5 años',
          '5+ años'
        ]
      },
      {
        name: 'Disfraces (por edad)',
        type: 'grouped',
        icon: 'costume',
        slug: 'disfraces-edad',
        subcategories: [
          '0-12 meses',
          '1-3 años',
          '3-5 años',
          '5+ años'
        ]
      },
      {
        name: 'Correpasillos, mesas y tapetes',
        type: 'grouped',
        icon: 'ride-on',
        slug: 'correpasillos-mesas',
        subcategories: [
          'Correpasillos',
          'Mesas de actividades',
          'Tapetes didácticos'
        ]
      },
      {
        name: 'Libros y juegos de mesa',
        type: 'grouped',
        icon: 'books',
        slug: 'libros-juegos',
        subcategories: [
          'Libros infantiles',
          'Juegos de mesa',
          'Rompecabezas'
        ]
      },
      {
        name: 'Juegos Grandes',
        type: 'single',
        icon: 'playground',
        slug: 'juegos-grandes'
      },
      {
        name: 'Sobre Ruedas',
        type: 'grouped',
        icon: 'bicycle',
        slug: 'sobre-ruedas-jugar',
        subcategories: [
          'Sobre ruedas',
          'Montables de exterior',
          'Triciclos y bicicletas',
          'Sillas para bicicleta'
        ]
      }
    ]
  }
};

// Función helper para obtener el ícono de una categoría o subcategoría
export function getIconForCategory(categoryName, subcategoryName = null) {
  // Buscar en categorías principales
  for (const [key, category] of Object.entries(categoryGroupsComplete)) {
    if (key === categoryName || category.slug === categoryName) {
      if (!subcategoryName) {
        return category.icon;
      }
      
      // Buscar en grupos
      for (const group of category.groups) {
        if (group.name === subcategoryName || group.slug === subcategoryName) {
          return group.icon;
        }
      }
    }
  }
  
  // Default
  return 'toys';
}

// Función para obtener todas las subcategorías de una categoría
export function getSubcategoriesForCategory(categorySlug) {
  for (const category of Object.values(categoryGroupsComplete)) {
    if (category.slug === categorySlug) {
      return category.groups;
    }
  }
  return [];
}

export default categoryGroupsComplete;