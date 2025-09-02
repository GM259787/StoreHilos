import api from './http';
import { CartItem } from '../types/catalog';

export const cartApi = {
  // Sincronizar carrito con el backend
  syncCart: async (items: CartItem[]): Promise<{ message: string }> => {
    const response = await api.post('/api/cart/sync', {
      items: items.map(item => ({
        productId: item.id,
        quantity: item.quantity
      }))
    });
    return response.data;
  },

  // Obtener carrito del backend
  getCart: async (): Promise<CartItem[]> => {
    const response = await api.get('/api/cart');
    return response.data;
  }
};
