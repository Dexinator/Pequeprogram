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
        type: 'single', // Cambiado a single porque solo hay una subcategoría real
        icon: 'car-seat',
        slug: 'autoasientos',
        subcategoryId: 1 // ID de Autoasientos
      },
      {
        name: 'Cargando al peque',
        type: 'single',
        icon: 'baby-carrier',
        slug: 'cargando-al-peque',
        subcategoryId: 2 // ID de Cargando al peque
      },
      {
        name: 'Carriolas',
        type: 'single', // Cambiado a single porque solo hay una subcategoría real
        icon: 'strollers',
        slug: 'carriolas',
        subcategoryId: 3 // ID de Carriolas
      },
      {
        name: 'Accesorios Carriola y Auto',
        type: 'single',
        icon: 'accessories',
        slug: 'accesorios-carriola',
        subcategoryId: 4 // ID de Accesorios Carriola y Auto
      },
      {
        name: 'Sobre Ruedas',
        type: 'grouped',
        icon: 'wheels',
        slug: 'sobre-ruedas',
        subcategoryIds: [8, 5, 6, 7], // IDs reales: Sobre ruedas, Montables de exterior, Triciclos y bicicletas, Sillas para bicicleta
        subcategories: [
          'Sobre ruedas',
          'Montables de exterior',
          'Triciclos y bicicletas',
          'Sillas para bicicleta'
        ]
      },
      {
        name: 'Otros de paseo',
        type: 'single',
        icon: 'other-travel',
        slug: 'otros-paseo',
        subcategoryId: 9 // ID de Otros de Paseo
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
        subcategoryIds: [10, 12, 11, 18], // IDs: Cunas de madera, Cunas de viaje, Colechos y Moisés, Muebles de recámara
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
        subcategoryIds: [13, 14, 15, 16, 17, 19], // IDs: Juegos de cuna, Colchones, Almohadas y donas, Móviles de cuna, Barandal para cama, Accesorios Recámara
        subcategories: [
          'Juegos de cuna',
          'Colchones',
          'Almohadas y donas',
          'Móviles de cuna',
          'Barandal para cama',
          'Accesorios Recámara'
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
        slug: 'mecedoras-columpios',
        subcategoryId: 21 // ID de Mecedoras y Columpios de bebé
      },
      {
        name: 'Brincolines y Corrales',
        type: 'grouped',
        icon: 'walker',
        slug: 'brincolines-corrales',
        subcategoryIds: [22, 23], // IDs: Brincolines, Corrales
        subcategories: [
          'Brincolines',
          'Corrales'
        ]
      },
      {
        name: 'Andaderas',
        type: 'single',
        icon: 'walker',
        slug: 'andaderas',
        subcategoryId: 52 // ID de Andaderas
      },
      {
        name: 'Seguridad',
        type: 'grouped',
        icon: 'safety',
        slug: 'seguridad',
        subcategoryIds: [24, 25, 26], // IDs: Protectores y seguros, Puertas de seguridad, Monitores
        subcategories: [
          'Protectores y seguros',
          'Puertas de seguridad',
          'Monitores'
        ]
      },
      {
        name: 'Baño y Accesorios',
        type: 'grouped',
        icon: 'bathroom',
        slug: 'bano-accesorios',
        subcategoryIds: [27, 28, 29], // IDs: Higiene y accesorios, Bañeras, Pañales
        subcategories: [
          'Higiene y accesorios',
          'Bañeras',
          'Pañales'
        ]
      }
    ]
  },

  'A comer': {
    id: 4,
    icon: 'high-chairs',
    slug: 'a-comer',
    groups: [
      {
        name: 'Sillas para comer',
        type: 'single',
        icon: 'high-chairs',
        slug: 'sillas-comer',
        subcategoryId: 20 // ID de Sillas para comer
      },
      {
        name: 'Lactancia y Biberones',
        type: 'grouped',
        icon: 'breastfeeding',
        slug: 'lactancia',
        subcategoryIds: [30, 31, 32, 33], // IDs: Lactancia, Calentador de biberones, Esterilizador de biberones, Extractores de leche
        subcategories: [
          'Lactancia',
          'Calentador de biberones',
          'Esterilizador de biberones',
          'Extractores de leche'
        ]
      },
      {
        name: 'Procesador de alimentos',
        type: 'single',
        icon: 'food-processor',
        slug: 'procesador-alimentos',
        subcategoryId: 34 // ID de Procesador de alimentos
      },
      {
        name: 'Accesorios de alimentación',
        type: 'single',
        icon: 'feeding-accessories',
        slug: 'accesorios-alimentacion',
        subcategoryId: 35 // ID de Accesorios de alimentación
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
        type: 'grouped',
        icon: 'girl',
        slug: 'nina',
        subcategoryIds: [36, 37, 38], // IDs: Niña cuerpo completo, Niña arriba de cintura, Niña abajo de cintura
        subcategories: [
          'Niña cuerpo completo',
          'Niña arriba de cintura',
          'Niña abajo de cintura'
        ]
      },
      {
        name: 'Calzado Niña',
        type: 'single',
        icon: 'girls-footwear',
        slug: 'calzado-nina',
        subcategoryId: 42 // ID de Calzado Niña
      },
      {
        name: 'Niño',
        type: 'grouped',
        icon: 'boy',
        slug: 'nino',
        subcategoryIds: [39, 40, 41], // IDs: Niño cuerpo completo, Niño arriba de cintura, Niño abajo de cintura
        subcategories: [
          'Niño cuerpo completo',
          'Niño arriba de cintura',
          'Niño abajo de cintura'
        ]
      },
      {
        name: 'Calzado Niño',
        type: 'single',
        icon: 'boys-footwear',
        slug: 'calzado-nino',
        subcategoryId: 43 // ID de Calzado Niño
      },
      {
        name: 'Ropa de Dama y Maternidad',
        type: 'single',
        icon: 'women-clothing',
        slug: 'ropa-dama-maternidad',
        subcategoryId: 45 // ID de Ropa de Dama y Maternidad
      },
      {
        name: 'Accesorios y Bolsas de Dama',
        type: 'single',
        icon: 'women-accessories',
        slug: 'accesorios-dama',
        subcategoryId: 44 // ID de Accesorios y Bolsas de Dama
      }
    ]
  },

  'A jugar': {
    id: 6,
    icon: 'toys',
    slug: 'a-jugar',
    groups: [
      {
        name: 'Juguetes',
        type: 'single',
        icon: 'toys',
        slug: 'juguetes',
        subcategoryId: 46 // ID de Juguetes
      },
      {
        name: 'Disfraces',
        type: 'single',
        icon: 'costume',
        slug: 'disfraces',
        subcategoryId: 47 // ID de Disfraces
      },
      {
        name: 'Montables y correpasillos',
        type: 'grouped',
        icon: 'ride-on',
        slug: 'montables-correpasillos',
        subcategoryIds: [53, 49, 51], // IDs: Montables y correpasillos Bebé, Mesa de actividades, Gimnasios y tapetes
        subcategories: [
          'Montables y correpasillos Bebé',
          'Mesa de actividades',
          'Gimnasios y tapetes'
        ]
      },
      {
        name: 'Libros y juegos de mesa',
        type: 'grouped',
        icon: 'books',
        slug: 'libros-juegos',
        subcategoryIds: [50, 48], // IDs: Libros y rompecabezas, Juegos de mesa
        subcategories: [
          'Libros y rompecabezas',
          'Juegos de mesa'
        ]
      },
      {
        name: 'Juegos Grandes',
        type: 'single',
        icon: 'playground',
        slug: 'juegos-grandes',
        subcategoryId: 57 // ID de Juegos grandes
      },
      {
        name: 'Sobre Ruedas',
        type: 'grouped',
        icon: 'bicycle',
        slug: 'sobre-ruedas-jugar',
        subcategoryIds: [56, 54, 55], // IDs en A jugar: Sobre ruedas, Montables de exterior, Triciclos y bicicletas
        subcategories: [
          'Sobre ruedas',
          'Montables de exterior',
          'Triciclos y bicicletas'
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