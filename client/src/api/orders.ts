import api from './http';
import { Order, CreateOrderData } from '../types/catalog';

export const ordersApi = {
  // Obtener mis pedidos
  getMyOrders: async (): Promise<Order[]> => {
    const response = await api.get<Order[]>('/orders');
    return response.data;
  },

  // Obtener pedido específico
  getOrder: async (id: number): Promise<Order> => {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
  },

  // Crear nuevo pedido
  createOrder: async (data: CreateOrderData): Promise<Order> => {
    const response = await api.post<Order>('/orders', data);
    return response.data;
  },

  // Enviar notificación de WhatsApp
  notifyWhatsApp: async (orderId: number): Promise<void> => {
    await api.post('/orders/notify-whatsapp', { orderId });
  }
};
