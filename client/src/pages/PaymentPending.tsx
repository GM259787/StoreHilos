import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { paymentApi } from '../api/payment';

const PaymentPending = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<any>(null);

  const orderId = searchParams.get('orderId');

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (orderId) {
        try {
          const status = await paymentApi.getPaymentStatus(parseInt(orderId));
          setPaymentStatus(status);
        } catch (error) {
          console.error('Error verificando estado del pago:', error);
        }
      }
      setLoading(false);
    };

    checkPaymentStatus();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando pago...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
            <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Pago Pendiente</h1>
          <p className="text-gray-600">
            Tu pago está siendo procesado. Te notificaremos cuando se complete.
          </p>
        </div>

        {paymentStatus && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Número de pedido:</span> #{orderId}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Estado:</span> {paymentStatus.isPaid ? 'Pagado' : 'Pendiente'}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => navigate('/orders')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Ver Mis Pedidos
          </button>
          <button
            onClick={() => navigate('/catalog')}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Continuar Comprando
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPending;
