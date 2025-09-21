import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cart';
import { useAuthStore } from '../store/auth';
import { cartApi } from '../api/cart';
import { authApi } from '../api/auth';
import CartItemRow from '../components/CartItemRow';
import ShippingInfoForm, { ShippingInfo } from '../components/ShippingInfoForm';
import { formatPrice } from '../utils/currency';
import { showError, showWarning } from '../utils/alerts';
import { useCartSync } from '../hooks/useCartSync';

const Cart = () => {
  const { items, clearCart, getTotalItems, getTotalPrice } = useCartStore();
  const { isAuthenticated, user, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showShippingForm, setShowShippingForm] = useState(false);
  
  // Sincronizar precios del carrito con el catálogo actual
  useCartSync();
  
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();
  
  // Calcular costo de envío: gratis a partir de $2000, sino $150
  const shippingCost = totalPrice >= 2000 ? 0 : 150;
  const finalTotal = totalPrice + shippingCost;

  const handleClearCart = () => {
    if (window.confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
      clearCart();
    }
  };

  const handleAdvanceOrder = async () => {
    if (!isAuthenticated) {
      showWarning('Acceso requerido', 'Debes iniciar sesión para continuar con el pedido.');
      navigate('/auth');
      return;
    }
    
    if (items.length === 0) {
      showWarning('Carrito vacío', 'El carrito está vacío.');
      return;
    }

    // Verificar si el usuario ya tiene datos de envío
    if (user?.shippingAddress && user?.shippingPhone && user?.shippingCity && user?.shippingPostalCode) {
      // Si ya tiene datos, proceder directamente
      await processOrder();
    } else {
      // Si no tiene datos, mostrar formulario
      setShowShippingForm(true);
    }
  };

  const handleShippingInfoSubmit = async (shippingInfo: ShippingInfo) => {
    try {
      setIsProcessing(true);
      
      // Actualizar datos de envío del usuario
      const updatedUser = await authApi.updateShippingInfo(shippingInfo);
      updateUser(updatedUser);
      
      // Ocultar formulario y procesar pedido
      setShowShippingForm(false);
      await processOrder(shippingInfo);
    } catch (error) {
      showError('Error al guardar', 'Error al guardar los datos de envío. Por favor, intenta nuevamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const processOrder = async (shippingInfo?: ShippingInfo) => {
    try {
      setIsProcessing(true);
      
      // Sincronizar carrito con el backend
      await cartApi.syncCart(items);
      
      // Preparar datos para la página de opciones de pago
      const orderData = {
        total: finalTotal,
        items: items,
        shippingInfo: shippingInfo || {
          shippingAddress: user?.shippingAddress || '',
          shippingCity: user?.shippingCity || '',
          shippingPostalCode: user?.shippingPostalCode || '',
          shippingPhone: user?.shippingPhone || '',
          shippingInstructions: user?.shippingInstructions || ''
        }
      };
      
      // Redirigir a la página de opciones de pago
      navigate('/payment', { state: orderData });
      
    } catch (error: any) {
      showError('Error al procesar pedido', `Error al procesar el pedido: ${error.response?.data?.message || error.message}. Por favor, intenta nuevamente.`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          {/* Icono del carrito vacío consistente con el header */}
          <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Tu carrito está vacío</h3>
          <p className="mt-2 text-sm text-gray-500">
            Comienza a agregar productos para verlos aquí.
          </p>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Continuar comprando
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Carrito de Compras</h1>
        <p className="mt-2 text-gray-600">
          {totalItems} {totalItems === 1 ? 'producto' : 'productos'} en tu carrito
        </p>
        
        {/* Leyenda de envío gratis */}
        <div className="mt-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-green-800">
                🚚 ¡Envío GRATIS a partir de $2000!
              </h3>
              <p className="text-sm text-green-700 mt-1">
                Lleva productos por $2000 o más y no pagues envío.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de productos */}
      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <CartItemRow key={item.id} item={item} />
        ))}
      </div>

      {/* Resumen */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen del pedido</h2>
        
        {/* Estado de datos de envío */}
        {user?.shippingAddress && (
          <div className="mb-4 p-3 rounded-md border border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-green-600 font-medium">Dirección configurada</span>
              </div>
              <button
                onClick={() => setShowShippingForm(true)}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Modificar
              </button>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              <p>{user.shippingAddress}, {user.shippingCity} {user.shippingPostalCode}</p>
              {user.shippingPhone && <p>Tel: {user.shippingPhone}</p>}
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Productos ({totalItems}):</span>
            <span className="font-medium">{formatPrice(totalPrice)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Envío:</span>
            <span className="font-medium">
              {shippingCost === 0 ? (
                <span className="text-green-600 font-semibold">¡GRATIS!</span>
              ) : (
                formatPrice(shippingCost)
              )}
            </span>
          </div>
          
          {totalPrice < 2000 && (
            <div className="text-sm text-blue-600 bg-blue-50 border border-blue-200 p-3 rounded-lg">
              <div className="flex items-center">
                <span className="text-lg mr-2">💡</span>
                <span className="font-medium">
                  Agrega ${(2000 - totalPrice).toLocaleString()} más para envío gratis
                </span>
              </div>
              <p className="text-xs text-blue-500 mt-1">
                Ahorra $150 en envío
              </p>
            </div>
          )}
          
          <div className="border-t pt-2">
            <div className="flex justify-between">
              <span className="text-lg font-semibold text-gray-900">Total:</span>
              <span className="text-lg font-bold text-gray-900">{formatPrice(finalTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleClearCart}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors"
        >
          Vaciar carrito
        </button>
        
        <Link
          to="/"
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors text-center"
        >
          Seguir comprando
        </Link>
        
        <button
          onClick={handleAdvanceOrder}
          disabled={isProcessing}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Procesando...' : 'Avanzar pedido'}
        </button>
      </div>

      {/* Formulario de datos de envío */}
      {showShippingForm && (
        <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Datos de envío</h2>
          <ShippingInfoForm 
            onSubmit={handleShippingInfoSubmit} 
            onCancel={() => setShowShippingForm(false)}
            isLoading={isProcessing}
          />
        </div>
      )}
    </div>
  );
};

export default Cart;
