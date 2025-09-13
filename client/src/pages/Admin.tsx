import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/auth';
import { adminApi } from '../api/admin';
import { Order } from '../types/catalog';
import { formatPrice } from '../utils/currency';
import { showError, showSuccess, showWarning, showConfirm } from '../utils/alerts';

const Admin = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [confirmedOrders, setConfirmedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'confirmed'>('confirmed');
  const [processingOrder, setProcessingOrder] = useState<number | null>(null);


  useEffect(() => {
            if (user && (user.role === 'Armador' || user.role === 'Cobrador')) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      
      // Ambos roles usan el mismo endpoint, pero el backend filtra según el rol
      const [allOrders, confirmed] = await Promise.all([
        adminApi.getAllOrders(),
        adminApi.getConfirmedOrders()
      ]);
      setOrders(allOrders);
      setConfirmedOrders(confirmed);
    } catch (error) {
      console.error('Error cargando pedidos:', error);
      showError('Error al cargar pedidos', 'Error al cargar los pedidos');
    } finally {
      setLoading(false);
    }
  };

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Panel de Administración
          </h1>
                     <p className="text-gray-600">
             Bienvenido, {user.firstName} {user.lastName} ({user.role})
           </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('all')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'all'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Todos los Pedidos ({orders.length})
              </button>
              <button
                onClick={() => setActiveTab('confirmed')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
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
                <li key={order.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            Pedido #{order.orderNumber}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Cliente: {order.customerName} ({order.customerEmail})
                          </p>
                          {order.customerPhone && (
                            <p className="text-sm text-gray-500">
                              Teléfono: {order.customerPhone}
                            </p>
                          )}
                          <p className="text-sm text-gray-500">
                            Fecha: {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                          
                          {/* Información de envío */}
                          <div className="mt-2 p-2 bg-gray-50 rounded-md">
                            <h4 className="text-xs font-medium text-gray-700 mb-1">Dirección de Envío:</h4>
                            <p className="text-xs text-gray-600">
                              {order.shippingAddress}, {order.shippingCity} {order.shippingPostalCode}
                            </p>
                            {order.customerShippingInstructions && (
                              <p className="text-xs text-gray-600 mt-1">
                                <span className="font-medium">Instrucciones:</span> {order.customerShippingInstructions}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            {formatPrice(order.totalAmount)}
                          </p>
                          <div className="flex gap-2 mt-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.isPaid)}`}>
                              {order.isPaid ? 'Pagado' : 'Pendiente'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Productos:</h4>
                        <div className="space-y-1">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm text-gray-600">
                              <span>{item.productName} x{item.quantity}</span>
                              <span>{formatPrice(item.subTotal)}</span>
                            </div>
                          ))}
                        </div>
                      </div>



                      {/* Actions */}
                      <div className="mt-4 flex gap-2">
                        {(user.role === 'Armador' || user.role === 'Cobrador') && (
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                            disabled={processingOrder === order.id}
                            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                          >
                            {processingOrder === order.id ? 'Procesando...' : 'Marcar como Pagado'}
                          </button>
                        )}
                      </div>
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
