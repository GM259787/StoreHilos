import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/auth';
import { adminApi } from '../api/admin';
import { Order } from '../types/catalog';
import { formatPrice } from '../utils/currency';
import { showError, showSuccess, showWarning, showConfirm } from '../utils/alerts';
import { useOrderNotifications } from '../hooks/useOrderNotifications';

const Admin = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [confirmedOrders, setConfirmedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'confirmed'>('confirmed');
  const [processingOrder, setProcessingOrder] = useState<number | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [newOrdersCount, setNewOrdersCount] = useState<number>(0);

  // Memoizar la función de carga de órdenes para evitar re-renders innecesarios
  const loadOrdersCallback = useCallback(async () => {
    try {
      setLoading(true);
      
      // Ambos roles usan el mismo endpoint, pero el backend filtra según el rol
      const [allOrders, confirmed] = await Promise.all([
        adminApi.getAllOrders(),
        adminApi.getConfirmedOrders()
      ]);
      setOrders(allOrders);
      setConfirmedOrders(confirmed);
      setLastRefresh(new Date());
      console.log('📦 Órdenes actualizadas:', { total: allOrders.length, confirmed: confirmed.length });
    } catch (error) {
      console.error('Error cargando pedidos:', error);
      showError('Error al cargar pedidos', 'Error al cargar los pedidos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Hook para auto-refresh y notificaciones sonoras
  const { refreshInterval, enableNotifications } = useOrderNotifications({
    orders,
    onRefresh: loadOrdersCallback,
    enabled: user && (user.role === 'Armador' || user.role === 'Cobrador'),
    onNewOrders: (count) => {
      setNewOrdersCount(count);
      // Resetear el contador después de 5 segundos
      setTimeout(() => setNewOrdersCount(0), 5000);
    }
  });


  useEffect(() => {
    if (user && (user.role === 'Armador' || user.role === 'Cobrador')) {
      loadOrdersCallback();
    }
  }, [user, loadOrdersCallback]);

  const loadOrders = loadOrdersCallback;

  const handleMarkAsPaid = async (orderId: number) => {
    if (user?.role !== 'Cobrador') {
      showWarning('Acceso denegado', 'Solo los cobradores pueden marcar pedidos como pagados');
      return;
    }

    const result = await showConfirm('Confirmar pago', '¿Estás seguro de que quieres marcar este pedido como pagado?');
    if (!result.isConfirmed) {
      return;
    }

    try {
      setProcessingOrder(orderId);
      await adminApi.markOrderAsPaid(orderId);
      showSuccess('¡Pedido pagado!', 'El pedido se ha marcado como pagado exitosamente');
      loadOrders(); // Recargar datos
    } catch (error) {
      console.error('Error marcando pedido como pagado:', error);
      showError('Error al marcar como pagado', 'Error al marcar el pedido como pagado');
    } finally {
      setProcessingOrder(null);
    }
  };

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    if (user?.role !== 'Armador' && user?.role !== 'Cobrador') {
      showWarning('Acceso denegado', 'Solo los armadores y cobradores pueden cambiar el estado de los pedidos');
      return;
    }

    try {
      setProcessingOrder(orderId);
      
      await adminApi.updateOrderStatus(orderId, newStatus);
      showSuccess('¡Estado actualizado!', 'El estado del pedido se ha actualizado exitosamente');
      loadOrders(); // Recargar datos
    } catch (error) {
      console.error('Error actualizando estado:', error);
      showError('Error al actualizar estado', 'Error al actualizar el estado del pedido');
    } finally {
      setProcessingOrder(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Confirmed': return 'bg-blue-100 text-blue-800';
      case 'Shipped': return 'bg-purple-100 text-purple-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (isPaid: boolean) => {
    return isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

          if (!user || (user.role !== 'Armador' && user.role !== 'Cobrador')) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
            <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando pedidos...</p>
          </div>
        </div>
      </div>
    );
  }

  // Determinar qué pedidos mostrar según el rol y la pestaña activa
  const getCurrentOrders = () => {
    if (user?.role === 'Armador') {
      // El armador puede ver todos los pedidos o solo los confirmados
      return activeTab === 'all' ? orders : confirmedOrders;
    }
    return activeTab === 'all' ? orders : confirmedOrders;
  };

  const currentOrders = getCurrentOrders();

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      {/* Notificación de nuevas órdenes */}
      {newOrdersCount > 0 && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-3 sm:px-6 sm:py-4 rounded-lg shadow-lg animate-bounce">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-12a1 1 0 011-2h4a1 1 0 011 2v12z" />
            </svg>
            <span className="text-sm sm:text-base font-semibold">
              🆕 {newOrdersCount} nueva{newOrdersCount > 1 ? 's' : ''} orden{newOrdersCount > 1 ? 'es' : ''}
            </span>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Panel de Administración
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Bienvenido, {user.firstName} {user.lastName} ({user.role})
              </p>
            </div>
            <div className="flex flex-col sm:text-right gap-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:space-x-4">
                {enableNotifications && (
                  <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Auto-refresh activo</span>
                    </div>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline">cada {refreshInterval} min</span>
                  </div>
                )}
                <button
                  onClick={loadOrders}
                  disabled={loading}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-xs sm:text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <svg className={`-ml-0.5 mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {loading ? 'Actualizando...' : 'Actualizar'}
                </button>
              </div>
              <div className="text-xs text-gray-400">
                Última actualización: {lastRefresh.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
              <button
                onClick={() => setActiveTab('all')}
                className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === 'all'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Todos los Pedidos ({orders.length})
              </button>
              <button
                onClick={() => setActiveTab('confirmed')}
                className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === 'confirmed'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pedidos Confirmados ({confirmedOrders.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {currentOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay pedidos para mostrar</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {currentOrders.map((order) => (
                <li key={order.id} className="px-4 sm:px-6 py-4">
                  <div className="flex flex-col gap-4">
                    {/* Header del pedido */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-medium text-gray-900">
                          Pedido #{order.orderNumber}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                          Cliente: {order.customerName} ({order.customerEmail})
                        </p>
                        {order.customerPhone && (
                          <p className="text-xs sm:text-sm text-gray-500">
                            Teléfono: {order.customerPhone}
                          </p>
                        )}
                        <p className="text-xs sm:text-sm text-gray-500">
                          Fecha: {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        
                        {/* Información de envío */}
                        <div className="mt-2 p-2 bg-gray-50 rounded-md">
                          <h4 className="text-xs font-medium text-gray-700 mb-1">Dirección de Envío:</h4>
                          <p className="text-xs text-gray-600 break-words">
                            {order.shippingAddress}, {order.shippingCity} {order.shippingPostalCode}
                          </p>
                          {order.customerShippingInstructions && (
                            <p className="text-xs text-gray-600 mt-1 break-words">
                              <span className="font-medium">Instrucciones:</span> {order.customerShippingInstructions}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex sm:flex-col items-start justify-between sm:text-right gap-2">
                        <p className="text-base sm:text-lg font-semibold text-gray-900">
                          {formatPrice(order.totalAmount)}
                        </p>
                        <div className="flex gap-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.isPaid)}`}>
                            {order.isPaid ? 'Pagado' : 'Pendiente'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <h4 className="text-xs sm:text-sm font-medium text-gray-900 mb-2">Productos:</h4>
                      <div className="space-y-1">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-xs sm:text-sm text-gray-600">
                            <span className="break-words flex-1 mr-2">{item.productName} x{item.quantity}</span>
                            <span className="whitespace-nowrap">{formatPrice(item.subTotal)}</span>
                          </div>
                        ))}
                      </div>
                    </div>



                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      {(user.role === 'Armador' || user.role === 'Cobrador') && (
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          disabled={processingOrder === order.id}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Pending">Pendiente</option>
                          <option value="Confirmed">Confirmado</option>
                          <option value="Shipped">Enviado</option>
                          <option value="Delivered">Entregado</option>
                          <option value="Cancelled">Cancelado</option>
                        </select>
                      )}

                      {user.role === 'Cobrador' && !order.isPaid && (
                        <button
                          onClick={() => handleMarkAsPaid(order.id)}
                          disabled={processingOrder === order.id}
                          className="flex-1 sm:flex-none px-3 py-2 bg-green-600 text-white text-xs sm:text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                        >
                          {processingOrder === order.id ? 'Procesando...' : 'Marcar como Pagado'}
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
