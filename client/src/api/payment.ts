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

export interface CreatePlaceToPaySessionData {
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  notes: string;
}

export interface CreatePlaceToPaySessionResponse {
  success: boolean;
  requestId: number;
  processUrl: string;
  orderId: number;
  message: string;
}

export interface PlaceToPayStatusResponse {
  requestId: number;
  status: string;
  message: string;
  orderId: number;
  orderNumber: string;
  isPaid: boolean;
  orderStatus: string;
}

export const paymentApi = {
  // Crear preferencia de pago con Mercado Pago
  createPreference: async (data: CreatePreferenceData): Promise<CreatePreferenceResponse> => {
    const response = await api.post('/payment/create-preference', data);
    return response.data;
  },

  // Crear sesión de pago con PlaceToPay
  createPlaceToPaySession: async (data: CreatePlaceToPaySessionData): Promise<CreatePlaceToPaySessionResponse> => {
    const response = await api.post('/payment/placetopay/create-session', data);
    return response.data;
  },

  // Consultar estado de pago en PlaceToPay
  getPlaceToPayStatus: async (orderId: number): Promise<PlaceToPayStatusResponse> => {
    const response = await api.get(`/payment/placetopay/status/${orderId}`);
    return response.data;
  },

  // Consultar estado del pago
  getPaymentStatus: async (orderId: number): Promise<PaymentStatusResponse> => {
    const response = await api.get(`/api/payment/payment-status/${orderId}`);
    return response.data;
  }
};
