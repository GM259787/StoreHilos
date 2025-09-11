import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const PaymentFailure = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderId = searchParams.get('orderId');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Pago Rechazado</h1>
          <p className="text-gray-600">
            No pudimos procesar tu pago. Por favor, intenta nuevamente o usa otro método de pago.
          </p>
        </div>

        {orderId && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Número de pedido:</span> #{orderId}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => navigate('/cart')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Intentar Nuevamente
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

export default PaymentFailure;
