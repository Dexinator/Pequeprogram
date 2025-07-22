import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface CartItem {
  inventory_id: string;
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

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  
  // Cargar carrito desde localStorage al montar
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart);
      } catch (error) {
        console.error('Error al cargar carrito:', error);
      }
    }
  }, []);
  
  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);
  
  // Calcular total y cantidad de items
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Agregar item al carrito
  const addItem = (product: any, quantity: number) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.inventory_id === product.inventory_id);
      
      if (existingItem) {
        // Si ya existe, actualizar cantidad
        return currentItems.map(item =>
          item.inventory_id === product.inventory_id
            ? { ...item, quantity: Math.min(item.quantity + quantity, item.max_quantity) }
            : item
        );
      } else {
        // Si no existe, agregar nuevo item
        const newItem: CartItem = {
          inventory_id: product.inventory_id,
          product_name: `${product.subcategory_name} ${product.brand_name}`,
          brand_name: product.brand_name,
          image: product.images?.[0] || 'https://via.placeholder.com/100x100/f3f4f6/9ca3af?text=Sin+imagen',
          price: product.online_price,
          quantity: Math.min(quantity, product.quantity),
          max_quantity: product.quantity
        };
        return [...currentItems, newItem];
      }
    });
  };
  
  // Actualizar cantidad de un item
  const updateQuantity = (inventory_id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(inventory_id);
      return;
    }
    
    setItems(currentItems =>
      currentItems.map(item =>
        item.inventory_id === inventory_id
          ? { ...item, quantity: Math.min(quantity, item.max_quantity) }
          : item
      )
    );
  };
  
  // Eliminar item del carrito
  const removeItem = (inventory_id: string) => {
    setItems(currentItems => currentItems.filter(item => item.inventory_id !== inventory_id));
  };
  
  // Limpiar carrito
  const clearCart = () => {
    setItems([]);
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