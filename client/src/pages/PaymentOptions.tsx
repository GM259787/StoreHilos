import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { paymentApi } from '../api/payment';
import { formatPrice } from '../utils/currency';
import { showError, showWarning } from '../utils/alerts';

interface PaymentOptionsProps {
  orderData?: {
    total: number;
    items: any[];
    shippingInfo: any;
  };
}

const PaymentOptions: React.FC<PaymentOptionsProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  
  // Obtener datos del pedido desde el estado de navegación
  const orderData = location.state as PaymentOptionsProps['orderData'];

  if (!orderData) {
    navigate('/cart');
    return null;
  }

  const handlePaymentMethod = async (method: string) => {
    if (!selectedPayment) {
      showWarning('Método de pago requerido', 'Por favor selecciona un método de pago');
      return;
    }

    try {
      setIsProcessing(true);

      if (method === 'mercadopago') {
        // Crear preferencia de pago con Mercado Pago
        const paymentData = {
          payerName: `${user?.firstName} ${user?.lastName}`,
          payerEmail: user?.email || '',
          shippingAddress: orderData.shippingInfo.shippingAddress,
          shippingCity: orderData.shippingInfo.shippingCity,
          shippingPostalCode: orderData.shippingInfo.shippingPostalCode,
          notes: orderData.shippingInfo.shippingInstructions || 'Pedido desde el carrito'
        };
        
        const paymentResponse = await paymentApi.createPreference(paymentData);
        
        // Redirigir a Mercado Pago
        window.location.href = paymentResponse.initPoint;
      } else if (method === 'transferencia') {
        // Crear pedido con método de transferencia
        const transferData = {
          method: 'transferencia',
          total: orderData.total,
          items: orderData.items,
          shippingInfo: orderData.shippingInfo
        };
        
        // Aquí irías a una página de confirmación de transferencia
        navigate('/payment/transfer', { state: transferData });
      }
    } catch (error: any) {
      console.error('Error procesando pago:', error);
      showError('Error al procesar pago', `Error al procesar el pago: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Opciones de Pago</h1>
        <p className="mt-2 text-gray-600">
          Selecciona tu método de pago preferido
        </p>
      </div>

      {/* Resumen del pedido */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen del pedido</h2>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Productos ({orderData.items.length}):</span>
            <span className="font-medium">{formatPrice(orderData.total)}</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between">
              <span className="text-lg font-semibold text-gray-900">Total:</span>
              <span className="text-lg font-bold text-gray-900">{formatPrice(orderData.total)}</span>
            </div>
          </div>
        </div>

        {/* Información de envío */}
        <div className="mt-4 p-3 rounded-md border border-gray-200 bg-white">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Dirección de envío</h3>
          <div className="text-sm text-gray-600">
            <p>{orderData.shippingInfo.shippingAddress}</p>
            <p>{orderData.shippingInfo.shippingCity} {orderData.shippingInfo.shippingPostalCode}</p>
            {orderData.shippingInfo.shippingPhone && <p>Tel: {orderData.shippingInfo.shippingPhone}</p>}
            {orderData.shippingInfo.shippingInstructions && (
              <p className="mt-1 text-gray-500">Instrucciones: {orderData.shippingInfo.shippingInstructions}</p>
            )}
          </div>
        </div>
      </div>

      {/* Opciones de pago */}
      <div className="space-y-4 mb-8">
        <h2 className="text-lg font-semibold text-gray-900">Métodos de pago disponibles</h2>
        
        {/* Mercado Pago */}
        <div 
          className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
            selectedPayment === 'mercadopago' 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setSelectedPayment('mercadopago')}
        >
          <div className="flex items-center space-x-3">
            <input
              type="radio"
              name="payment"
              value="mercadopago"
              checked={selectedPayment === 'mercadopago'}
              onChange={() => setSelectedPayment('mercadopago')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white text-sm font-bold">MP</span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Mercado Pago</h3>
                  <p className="text-sm text-gray-500">Paga con tarjeta, efectivo o transferencia</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Transferencia bancaria */}
        <div 
          className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
            selectedPayment === 'transferencia' 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setSelectedPayment('transferencia')}
        >
          <div className="flex items-center space-x-3">
            <input
              type="radio"
              name="payment"
              value="transferencia"
              checked={selectedPayment === 'transferencia'}
              onChange={() => setSelectedPayment('transferencia')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Transferencia bancaria</h3>
                  <p className="text-sm text-gray-500">Transfiere directamente a nuestra cuenta</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => navigate('/cart')}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors"
        >
          Volver al carrito
        </button>
        
        <button
          onClick={() => handlePaymentMethod(selectedPayment)}
          disabled={!selectedPayment || isProcessing}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Procesando...' : 'Continuar con el pago'}
        </button>
      </div>
    </div>
  );
};

export default PaymentOptions;
