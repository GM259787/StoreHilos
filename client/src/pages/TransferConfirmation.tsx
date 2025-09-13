import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCartStore } from '../store/cart';
import { ordersApi } from '../api/orders';
import { formatPrice } from '../utils/currency';
import { showError } from '../utils/alerts';

interface TransferData {
  method: string;
  total: number;
  items: any[];
  shippingInfo: any;
}

const TransferConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);

  const transferData = location.state as TransferData;

  if (!transferData) {
    navigate('/cart');
    return null;
  }

  const handleConfirmOrder = async () => {
    try {
      setIsProcessing(true);

      // Crear el pedido con método de transferencia
      const orderData = {
        shippingAddress: transferData.shippingInfo.shippingAddress,
        shippingCity: transferData.shippingInfo.shippingCity,
        shippingPostalCode: transferData.shippingInfo.shippingPostalCode,
        notes: 'Pedido con transferencia bancaria'
      };

      await ordersApi.createOrder(orderData);
      
      // Limpiar el carrito
      clearCart();
      
      setOrderCreated(true);
    } catch (error: any) {
      console.error('Error creando pedido:', error);
      showError('Error al crear pedido', `Error al crear el pedido: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (orderCreated) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">¡Pedido creado exitosamente!</h1>
          <p className="mt-2 text-gray-600">
            Tu pedido ha sido creado y está pendiente de pago por transferencia.
          </p>
          
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Instrucciones de pago</h2>
            <div className="text-left space-y-3">
              <div className="p-3 bg-white rounded border">
                <h3 className="font-medium text-gray-900">Datos bancarios:</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Banco: [Nombre del banco]<br />
                  Cuenta: [Número de cuenta]<br />
                  Titular: [Nombre del titular]<br />
                  CI: [Cédula de identidad]
                </p>
              </div>
              <div className="p-3 bg-white rounded border">
                <h3 className="font-medium text-gray-900">Monto a transferir:</h3>
                <p className="text-lg font-bold text-blue-600">{formatPrice(transferData.total)}</p>
              </div>
              <div className="p-3 bg-white rounded border">
                <h3 className="font-medium text-gray-900">Concepto:</h3>
                <p className="text-sm text-gray-600">Pedido - [Tu nombre]</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-sm text-gray-500 mb-4">
              Una vez realizada la transferencia, contacta con nosotros para confirmar el pago.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Volver al catálogo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Confirmar Transferencia</h1>
        <p className="mt-2 text-gray-600">
          Revisa los datos y confirma tu pedido
        </p>
      </div>

      {/* Resumen del pedido */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen del pedido</h2>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Productos ({transferData.items.length}):</span>
            <span className="font-medium">{formatPrice(transferData.total)}</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between">
              <span className="text-lg font-semibold text-gray-900">Total:</span>
              <span className="text-lg font-bold text-gray-900">{formatPrice(transferData.total)}</span>
            </div>
          </div>
        </div>

        {/* Información de envío */}
        <div className="mt-4 p-3 rounded-md border border-gray-200 bg-white">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Dirección de envío</h3>
          <div className="text-sm text-gray-600">
            <p>{transferData.shippingInfo.shippingAddress}</p>
            <p>{transferData.shippingInfo.shippingCity} {transferData.shippingInfo.shippingPostalCode}</p>
            {transferData.shippingInfo.shippingPhone && <p>Tel: {transferData.shippingInfo.shippingPhone}</p>}
            {transferData.shippingInfo.shippingInstructions && (
              <p className="mt-1 text-gray-500">Instrucciones: {transferData.shippingInfo.shippingInstructions}</p>
            )}
          </div>
        </div>
      </div>

      {/* Información de transferencia */}
      <div className="bg-blue-50 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Información de transferencia</h2>
        <div className="space-y-3">
          <div className="p-3 bg-white rounded border">
            <h3 className="font-medium text-gray-900">Datos bancarios:</h3>
            <p className="text-sm text-gray-600 mt-1">
              Banco: [Nombre del banco]<br />
              Cuenta: [Número de cuenta]<br />
              Titular: [Nombre del titular]<br />
              CI: [Cédula de identidad]
            </p>
          </div>
          <div className="p-3 bg-white rounded border">
            <h3 className="font-medium text-gray-900">Monto a transferir:</h3>
            <p className="text-lg font-bold text-blue-600">{formatPrice(transferData.total)}</p>
          </div>
          <div className="p-3 bg-white rounded border">
            <h3 className="font-medium text-gray-900">Concepto:</h3>
            <p className="text-sm text-gray-600">Pedido - [Tu nombre]</p>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => navigate('/payment')}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors"
        >
          Volver a opciones de pago
        </button>
        
        <button
          onClick={handleConfirmOrder}
          disabled={isProcessing}
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Creando pedido...' : 'Confirmar pedido'}
        </button>
      </div>
    </div>
  );
};

export default TransferConfirmation;
