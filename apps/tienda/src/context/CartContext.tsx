import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface CartItem {
  inventory_id: string;
  valuation_item_id: number;
  product_name: string;
  brand_name: string;
  image: string;
  price: number;
  quantity: number;
  max_quantity: number;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  total: number;
  addItem: (product: any, quantity: number) => void;
  updateQuantity: (inventory_id: string, quantity: number) => void;
  removeItem: (inventory_id: string) => void;
  clearCart: () => void;
  isItemInCart: (inventory_id: string) => boolean;
  getItemQuantity: (inventory_id: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Key para localStorage
const CART_STORAGE_KEY = 'entrepeques_cart';
const CART_UPDATE_EVENT = 'entrepeques_cart_update';

// Función helper para emitir evento de actualización del carrito
const emitCartUpdate = (items: CartItem[]) => {
  // Solo ejecutar en el navegador
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return;
  }

  // Guardar en localStorage
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));

  // Emitir evento personalizado para sincronizar entre componentes
  const event = new CustomEvent(CART_UPDATE_EVENT, {
    detail: { items }
  });
  window.dispatchEvent(event);
};

// Función helper para cargar el carrito desde localStorage
const loadCartFromStorage = (): CartItem[] => {
  // Solo ejecutar en el navegador
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return [];
  }

  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      return JSON.parse(savedCart);
    }
  } catch (error) {
    console.error('Error al cargar carrito:', error);
  }
  return [];
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => loadCartFromStorage());
  
  // Escuchar cambios en el carrito desde otros componentes
  useEffect(() => {
    // Solo ejecutar en el navegador
    if (typeof window === 'undefined') {
      return;
    }

    const handleCartUpdate = (event: CustomEvent) => {
      const newItems = event.detail.items;
      setItems(newItems);
    };

    // Escuchar cambios en localStorage desde otras pestañas
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CART_STORAGE_KEY) {
        const newItems = e.newValue ? JSON.parse(e.newValue) : [];
        setItems(newItems);
      }
    };

    // Agregar listeners
    window.addEventListener(CART_UPDATE_EVENT as any, handleCartUpdate);
    window.addEventListener('storage', handleStorageChange);

    // Cleanup
    return () => {
      window.removeEventListener(CART_UPDATE_EVENT as any, handleCartUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Cargar carrito inicial desde localStorage
  useEffect(() => {
    const savedItems = loadCartFromStorage();
    if (savedItems.length > 0) {
      setItems(savedItems);
    }
  }, []);
  
  // Calcular total y cantidad de items
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Agregar item al carrito
  const addItem = (product: any, quantity: number) => {
    const currentItems = loadCartFromStorage(); // Cargar estado actual desde localStorage
    const existingItem = currentItems.find(item => item.inventory_id === product.inventory_id);
    
    let newItems: CartItem[];
    
    if (existingItem) {
      // Si ya existe, actualizar cantidad
      newItems = currentItems.map(item =>
        item.inventory_id === product.inventory_id
          ? { ...item, quantity: Math.min(item.quantity + quantity, item.max_quantity) }
          : item
      );
    } else {
      // Si no existe, agregar nuevo item
      const newItem: CartItem = {
        inventory_id: product.inventory_id,
        valuation_item_id: product.id, // ID del valuation_item
        product_name: `${product.subcategory_name} ${product.brand_name}`,
        brand_name: product.brand_name,
        image: product.images?.[0] || 'https://via.placeholder.com/100x100/f3f4f6/9ca3af?text=Sin+imagen',
        price: product.online_price,
        quantity: Math.min(quantity, product.quantity),
        max_quantity: product.quantity
      };
      newItems = [...currentItems, newItem];
    }
    
    setItems(newItems);
    emitCartUpdate(newItems);
  };
  
  // Actualizar cantidad de un item
  const updateQuantity = (inventory_id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(inventory_id);
      return;
    }
    
    const currentItems = loadCartFromStorage();
    const newItems = currentItems.map(item =>
      item.inventory_id === inventory_id
        ? { ...item, quantity: Math.min(quantity, item.max_quantity) }
        : item
    );
    
    setItems(newItems);
    emitCartUpdate(newItems);
  };
  
  // Eliminar item del carrito
  const removeItem = (inventory_id: string) => {
    const currentItems = loadCartFromStorage();
    const newItems = currentItems.filter(item => item.inventory_id !== inventory_id);
    
    setItems(newItems);
    emitCartUpdate(newItems);
  };
  
  // Limpiar carrito
  const clearCart = () => {
    setItems([]);
    emitCartUpdate([]);
  };
  
  // Verificar si un item está en el carrito
  const isItemInCart = (inventory_id: string): boolean => {
    return items.some(item => item.inventory_id === inventory_id);
  };
  
  // Obtener cantidad de un item en el carrito
  const getItemQuantity = (inventory_id: string): number => {
    const item = items.find(item => item.inventory_id === inventory_id);
    return item?.quantity || 0;
  };
  
  return (
    <CartContext.Provider value={{
      items,
      itemCount,
      total,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      isItemInCart,
      getItemQuantity
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};