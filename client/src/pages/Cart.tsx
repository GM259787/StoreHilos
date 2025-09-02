import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cart';
import { useAuthStore } from '../store/auth';
import { ordersApi } from '../api/orders';
import { cartApi } from '../api/cart';
import CartItemRow from '../components/CartItemRow';

const Cart = () => {
  const { items, clearCart, getTotalItems, getTotalPrice } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  const handleClearCart = () => {
    if (window.confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
      clearCart();
    }
  };

  const handleAdvanceOrder = async () => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para continuar con el pedido.');
      navigate('/auth');
      return;
    }
    
    if (items.length === 0) {
      alert('El carrito está vacío.');
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // Sincronizar carrito con el backend
      await cartApi.syncCart(items);
      
      // Crear orden real en la base de datos
      const orderData = {
        shippingAddress: 'Dirección de envío', // En una app real, esto vendría de un formulario
        shippingCity: 'Ciudad',
        shippingPostalCode: '00000',
        notes: 'Pedido desde el carrito'
      };
      
      await ordersApi.createOrder(orderData);
      
      alert('¡Pedido procesado con éxito! Serás redirigido a tus pedidos.');
      clearCart();
      navigate('/orders');
    } catch (error) {
      console.error('Error procesando pedido:', error);
      alert('Error al procesar el pedido. Por favor, intenta nuevamente.');
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
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Productos ({totalItems}):</span>
            <span className="font-medium">${totalPrice.toFixed(2)}</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between">
              <span className="text-lg font-semibold text-gray-900">Total:</span>
              <span className="text-lg font-bold text-gray-900">${totalPrice.toFixed(2)}</span>
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
    </div>
  );
};

export default Cart;
