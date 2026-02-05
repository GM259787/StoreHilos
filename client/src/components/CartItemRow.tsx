import { CartItem } from '../types/catalog';
import { useCartStore } from '../store/cart';
import { useAuthStore } from '../store/auth';
import { cartApi } from '../api/cart';
import { formatPrice } from '../utils/currency';
import { getImageUrl } from '../utils/imageUrl';


interface CartItemRowProps {
  item: CartItem;
}

const CartItemRow = ({ item }: CartItemRowProps) => {
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const removeItem = useCartStore(state => state.removeItem);
  const { isAuthenticated } = useAuthStore();

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity === 0) {
      if (window.confirm('¿Estás seguro de que quieres eliminar este producto del carrito?')) {
        removeItem(item.id);
        
        // Sincronizar inmediatamente con el backend si el usuario está autenticado
        if (isAuthenticated) {
          try {
            const updatedItems = useCartStore.getState().items;
            await cartApi.syncCart(updatedItems);
            console.log('Carrito sincronizado inmediatamente después de eliminar producto');
          } catch (error) {
            console.error('Error sincronizando carrito inmediatamente:', error);
          }
        }
      }
    } else {
      updateQuantity(item.id, newQuantity);
      
      // Sincronizar inmediatamente con el backend si el usuario está autenticado
      if (isAuthenticated) {
        try {
          // Obtener los items actualizados del store después de actualizar
          const updatedItems = useCartStore.getState().items;
          await cartApi.syncCart(updatedItems);
          console.log('Carrito sincronizado inmediatamente después de actualizar cantidad');
        } catch (error) {
          console.error('Error sincronizando carrito inmediatamente:', error);
        }
      }
      // El recálculo de descuentos se maneja automáticamente por useCartSync
    }
  };

  const subtotal = item.price * item.quantity;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-white rounded-lg border border-gray-200">
      {/* Fila superior: Imagen, info y botón eliminar */}
      <div className="flex items-start gap-3 sm:gap-4 flex-1">
        {/* Imagen */}
        <div className="flex-shrink-0">
          <img
            src={getImageUrl(item.imageUrl)}
            alt={item.name}
            className="w-20 h-20 sm:w-16 sm:h-16 object-cover rounded-lg"
          />
        </div>

        {/* Información del producto */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-medium text-gray-900">
            {item.name}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Stock: {item.availableStock} unidades
          </p>
          <div className="mt-2 space-y-1">
            {item.hasDiscount && item.originalPrice && item.originalPrice > item.price ? (
              <div>
                <div className="text-xs sm:text-sm text-gray-500 line-through">
                  {formatPrice(item.originalPrice)} c/u
                </div>
                <div className="text-base sm:text-lg font-semibold text-green-600">
                  {formatPrice(item.price)} c/u
                </div>
                <div className="text-xs text-green-600 font-medium">
                  ¡Descuento aplicado!
                </div>
              </div>
            ) : (
              <div className="text-base sm:text-lg font-semibold text-gray-900">
                {formatPrice(item.price)} c/u
              </div>
            )}
          </div>
        </div>

        {/* Botón eliminar - solo visible en móvil */}
        <button
          onClick={async () => {
            removeItem(item.id);
            
            // Sincronizar inmediatamente con el backend si el usuario está autenticado
            if (isAuthenticated) {
              try {
                const updatedItems = useCartStore.getState().items;
                await cartApi.syncCart(updatedItems);
                console.log('Carrito sincronizado inmediatamente después de eliminar producto');
              } catch (error) {
                console.error('Error sincronizando carrito inmediatamente:', error);
              }
            }
          }}
          className="sm:hidden text-red-500 hover:text-red-700 p-1"
          aria-label="Eliminar del carrito"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Fila inferior: Controles de cantidad y subtotal */}
      <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
        {/* Controles de cantidad */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label htmlFor={`cart-quantity-${item.id}`} className="text-xs sm:text-sm font-medium text-gray-700 sr-only sm:not-sr-only">
            Cant:
          </label>
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              type="button"
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Reducir cantidad"
            >
              -
            </button>
            <input
              id={`cart-quantity-${item.id}`}
              type="number"
              min="0"
              max={item.availableStock}
              value={item.quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 0)}
              className="w-12 sm:w-16 text-center border-0 focus:ring-0 text-sm"
            />
            <button
              type="button"
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={item.quantity >= item.availableStock}
              className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Aumentar cantidad"
            >
              +
            </button>
          </div>
        </div>

        {/* Subtotal */}
        <div className="text-right">
          <p className="text-base sm:text-lg font-bold text-gray-900">
            {formatPrice(subtotal)}
          </p>
          <p className="text-xs sm:text-sm text-gray-500">
            {item.quantity} x {formatPrice(item.price)}
          </p>
          {item.hasDiscount && item.originalPrice && item.originalPrice > item.price && (
            <p className="text-xs text-green-600 font-medium">
              Ahorras: {formatPrice((item.originalPrice - item.price) * item.quantity)}
            </p>
          )}
        </div>

        {/* Botón eliminar - solo visible en desktop */}
        <button
          onClick={async () => {
            removeItem(item.id);
            
            // Sincronizar inmediatamente con el backend si el usuario está autenticado
            if (isAuthenticated) {
              try {
                const updatedItems = useCartStore.getState().items;
                await cartApi.syncCart(updatedItems);
                console.log('Carrito sincronizado inmediatamente después de eliminar producto');
              } catch (error) {
                console.error('Error sincronizando carrito inmediatamente:', error);
              }
            }
          }}
          className="hidden sm:block text-red-500 hover:text-red-700 p-2"
          aria-label="Eliminar del carrito"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CartItemRow;
