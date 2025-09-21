import api from './http';
import { Order } from '../types/catalog';

export const adminApi = {
  // Obtener todos los pedidos (para armadores y cobradores)
  getAllOrders: async (): Promise<Order[]> => {
    const response = await api.get('/admin/orders');
    return response.data;
  },

  // Obtener pedidos confirmados (para armadores y cobradores)
  getConfirmedOrders: async (): Promise<Order[]> => {
    const response = await api.get('/admin/orders/confirmed');
    return response.data;
  },

  // Marcar pedido como pagado (solo cobradores)
  markOrderAsPaid: async (orderId: number): Promise<{ message: string }> => {
    const response = await api.put(`/admin/orders/${orderId}/mark-as-paid`);
    return response.data;
  },

  // Actualizar estado del pedido (solo armadores)
  updateOrderStatus: async (orderId: number, status: string): Promise<{ message: string }> => {
    const response = await api.put(`/admin/orders/${orderId}/status`, { 
      status
    });
    return response.data;
  }
};
