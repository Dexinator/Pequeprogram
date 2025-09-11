// Estructura completa de categorías y subcategorías de Entrepeques
// Basado en https://entrepeques.mx
// IMPORTANTE: Las subcategorías están agrupadas - múltiples categorías se muestran en una sola página

export const categoryGroups = {
  'A dormir': {
    groups: [
      {
        name: 'Cunas, colechos y muebles',
        slug: 'cunas-colechos-muebles',
        icon: 'cribs',
        categories: ['Cunas de madera', 'Cunas de viaje', 'Colechos y Moisés', 'Muebles de recámara']
      },
      {
        name: 'Accesorios de cunas, colchones y almohadas',
        slug: 'accesorios-cunas',
        icon: 'crib-accessories', 
        categories: ['Juegos de cuna', 'Colchones', 'Almohadas y donas', 'Móviles de cuna', 'Barandal para cama', 'Accesorios recámara']
      }
    ]
  }
};

export const categoryStructure = {
  'A pasear': {
    id: 1,
    icon: 'strollers',
    subcategories: {
      'Autoasientos': {
        icon: 'car-seat',
        items: [
          'Portabebé 0-13 kg',
          'Autoasientos 0-18 a 30 kg',
          'Booster 0-18 a 49 Kg'
        ]
      },
      'Carriolas': {
        icon: 'strollers',
        items: [
          'Con Portabebé',
          'Sin Portabebé',
          'Doble'
        ]
      },
      'Sobre Ruedas': {
        icon: 'wheels',
        items: []
      },
      'Otros de paseo': {
        icon: 'other-travel',
        items: []
      }
    }
  },
  
  'A dormir': {
    id: 2,
    icon: 'cribs',
    subcategories: {
      'Cunas, colechos y muebles': {
        icon: 'cribs',
        items: []
      },
      'Accesorios de cuna, colchones, almohadas': {
        icon: 'crib-accessories',
        items: []
      }
    }
  },
  
  'En casa': {
    id: 3,
    icon: 'safety',
    subcategories: {
      'Mecedoras y Columpios de bebé': {
        icon: 'rocking-chair',
        items: []
      },
      'Andaderas, Brincolines y Corrales': {
        icon: 'walker',
        items: []
      },
      'Seguridad': {
        icon: 'safety',
        items: []
      },
      'Baño y Accesorios': {
        icon: 'bathroom',
        items: []
      }
    }
  },
  
  'A comer': {
    id: 4,
    icon: 'high-chairs',
    subcategories: {
      'Lactancia': {
        icon: 'breastfeeding',
        items: []
      },
      'Sillas para comer': {
        icon: 'high-chairs',
        items: []
      },
      'Procesador de alimentos': {
        icon: 'food-processor',
        items: []
      }
    }
  },
  
  'Ropa': {
    id: 5,
    icon: 'women-clothing',
    subcategories: {
      'Niña': {
        icon: 'girl',
        items: []
      },
      'Calzado Niña': {
        icon: 'girls-footwear',
        items: []
      },
      'Niño': {
        icon: 'boy',
        items: []
      },
      'Calzado Niño': {
        icon: 'boys-footwear',
        items: []
      },
      'Ropa de Dama y Maternidad': {
        icon: 'women-clothing',
        items: []
      }
    }
  },
  
  'A jugar': {
    id: 6,
    icon: 'toys',
    subcategories: {
      'Juguetes (por edad)': {
        icon: 'toys',
        items: []
      },
      'Disfraces (por edad)': {
        icon: 'costume',
        items: []
      },
      'Correpasillos, mesas y tapetes': {
        icon: 'ride-on',
        items: []
      },
      'Libros y juegos de mesa': {
        icon: 'books',
        items: []
      }
    }
  }
};

// Mapeo rápido de nombres a íconos
export const iconMapping = {
  // Categorías principales
  'A pasear': 'strollers',
  'A dormir': 'cribs',
  'En casa': 'safety',
  'A comer': 'high-chairs',
  'Ropa': 'women-clothing',
  'A jugar': 'toys',
  
  // Subcategorías
  'Autoasientos': 'car-seat',
  'Carriolas': 'strollers',
  'Sobre Ruedas': 'wheels',
  'Otros de paseo': 'other-travel',
  'Cunas': 'cribs',
  'Accesorios de cuna': 'crib-accessories',
  'Mecedoras': 'rocking-chair',
  'Andaderas': 'walker',
  'Seguridad': 'safety',
  'Baño': 'bathroom',
  'Lactancia': 'breastfeeding',
  'Sillas para comer': 'high-chairs',
  'Procesador de alimentos': 'food-processor',
  'Niña': 'girl',
  'Niño': 'boy',
  'Calzado Niña': 'girls-footwear',
  'Calzado Niño': 'boys-footwear',
  'Ropa de Dama': 'women-clothing',
  'Juguetes': 'toys',
  'Disfraces': 'costume',
  'Correpasillos': 'ride-on',
  'Libros': 'books',
  'Juegos Grandes': 'large-toys'
};

export default categoryStructure;