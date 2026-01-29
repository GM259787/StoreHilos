import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { paymentApi } from '../api/payment';
import { useCartStore } from '../store/cart';
import { showError } from '../utils/alerts';

const PaymentReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<any>(null);
  const { clearCart } = useCartStore();

  const orderId = searchParams.get('orderId');

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!orderId) {
        showError('Error', 'No se encontró el ID del pedido');
        navigate('/orders');
        return;
      }

      try {
        // Consultar estado del pago en PlaceToPay
        const status = await paymentApi.getPlaceToPayStatus(parseInt(orderId));
        setPaymentStatus(status);
        setLoading(false);

        // Si el pago fue aprobado, limpiar el carrito local
        if (status.status === 'APPROVED' && status.isPaid) {
          clearCart();
        }

        // Redirigir según el estado después de un breve delay
        setTimeout(() => {
          if (status.status === 'APPROVED') {
            navigate(`/payment/success?orderId=${orderId}`);
          } else if (status.status === 'REJECTED') {
            navigate(`/payment/failure?orderId=${orderId}`);
          } else if (status.status === 'PENDING') {
            navigate(`/payment/pending?orderId=${orderId}`);
          } else {
            // Estado desconocido o pendiente
            navigate(`/payment/pending?orderId=${orderId}`);
          }
        }, 2000);
      } catch (error: any) {
        console.error('Error verificando estado del pago:', error);
        showError('Error', 'No se pudo verificar el estado del pago');
        setLoading(false);
        
        // Redirigir a pending en caso de error
        setTimeout(() => {
          navigate(`/payment/pending?orderId=${orderId}`);
        }, 2000);
      }
    };

    checkPaymentStatus();
  }, [orderId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verificando pago...</h1>
          <p className="text-gray-600">
            Estamos consultando el estado de tu pago. Por favor espera un momento.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-6">
          <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 ${
            paymentStatus?.status === 'APPROVED' ? 'bg-green-100' :
            paymentStatus?.status === 'REJECTED' ? 'bg-red-100' :
            'bg-yellow-100'
          }`}>
            {paymentStatus?.status === 'APPROVED' ? (
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : paymentStatus?.status === 'REJECTED' ? (
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {paymentStatus?.status === 'APPROVED' ? '¡Pago Exitoso!' :
             paymentStatus?.status === 'REJECTED' ? 'Pago Rechazado' :
             'Pago Pendiente'}
          </h1>
          <p className="text-gray-600">
            {paymentStatus?.message || 'Procesando tu pago...'}
          </p>
        </div>

        {paymentStatus && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg text-left">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Pedido:</span> {paymentStatus.orderNumber}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Estado:</span> {paymentStatus.orderStatus}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Pagado:</span> {paymentStatus.isPaid ? 'Sí' : 'No'}
            </p>
          </div>
        )}

        <p className="text-sm text-gray-500">Redirigiendo...</p>
      </div>
    </div>
  );
};

export default PaymentReturn;
