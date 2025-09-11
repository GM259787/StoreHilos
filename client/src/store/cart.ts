import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '../types/catalog';

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        console.log('Store: Agregando item al carrito:', item);
        set((state) => {
          const existingItem = state.items.find(i => i.id === item.id);
          console.log('Store: Item existente encontrado:', existingItem);
          
          if (existingItem) {
            // Si ya existe, aumentar cantidad respetando stock disponible
            const newQuantity = Math.min(existingItem.quantity + 1, item.availableStock);
            console.log('Store: Actualizando cantidad a:', newQuantity);
            return {
              items: state.items.map(i => 
                i.id === item.id 
                  ? { ...i, quantity: newQuantity }
                  : i
              )
            };
          } else {
            // Si no existe, agregar con cantidad 1
            console.log('Store: Agregando nuevo item');
            return {
              items: [...state.items, { ...item, quantity: 1 }]
            };
          }
        });
      },
      
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== id)
        }));
      },
      
      updateQuantity: (id, quantity) => {
        set((state) => {
          const item = state.items.find(i => i.id === id);
          if (!item) return state;
          
          // Validar que la cantidad no exceda el stock disponible
          const validQuantity = Math.min(Math.max(0, quantity), item.availableStock);
          
          if (validQuantity === 0) {
            // Si la cantidad es 0, eliminar el item
            return {
              items: state.items.filter(i => i.id !== id)
            };
          }
          
          return {
            items: state.items.map(i => 
              i.id === id ? { ...i, quantity: validQuantity } : i
            )
          };
        });
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      }
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items })
    }
  )
);
