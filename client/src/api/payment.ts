import api from './http';

export interface CreatePreferenceData {
  payerName: string;
  payerEmail: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  notes: string;
}

export interface CreatePreferenceResponse {
  preferenceId: string;
  initPoint: string;
  orderId: number;
}

export interface PaymentStatusResponse {
  orderId: number;
  isPaid: boolean;
  status: string;
}

export const paymentApi = {
  // Crear preferencia de pago con Mercado Pago
  createPreference: async (data: CreatePreferenceData): Promise<CreatePreferenceResponse> => {
    const response = await api.post('/payment/create-preference', data);
    return response.data;
  },

  // Consultar estado del pago
  getPaymentStatus: async (orderId: number): Promise<PaymentStatusResponse> => {
    const response = await api.get(`/api/payment/payment-status/${orderId}`);
    return response.data;
  }
};
