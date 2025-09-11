import { CartItem } from '../types/catalog';
import { useCartStore } from '../store/cart';
import { formatPrice } from '../utils/currency';

// Extender el tipo ImportMeta para incluir env
declare global {
  interface ImportMeta {
    readonly env: {
      readonly VITE_API_URL?: string;
    };
  }
}

interface CartItemRowProps {
  item: CartItem;
}

const CartItemRow = ({ item }: CartItemRowProps) => {
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const removeItem = useCartStore(state => state.removeItem);
  
  // URL base del backend para las imágenes
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5175';
  
  // Construir la URL completa de la imagen
  const getImageUrl = (imageUrl: string | null | undefined) => {
    if (!imageUrl) {
      return 'https://picsum.photos/seed/placeholder/100/100';
    }
    // Si la URL ya es completa, usarla tal como está
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    // Si es relativa, concatenarla con la URL base del backend
    return `${API_BASE_URL}${imageUrl}`;
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity === 0) {
      if (window.confirm('¿Estás seguro de que quieres eliminar este producto del carrito?')) {
        removeItem(item.id);
      }
    } else {
      updateQuantity(item.id, newQuantity);
    }
  };

  const subtotal = item.price * item.quantity;

  return (
    <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200">
      {/* Imagen */}
      <div className="flex-shrink-0">
        <img
          src={getImageUrl(item.imageUrl)}
          alt={item.name}
          className="w-16 h-16 object-cover rounded-lg"
        />
      </div>

      {/* Información del producto */}
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-medium text-gray-900 truncate">
          {item.name}
        </h3>
        <p className="text-sm text-gray-500">
          Stock disponible: {item.availableStock} unidades
        </p>
        <p className="text-lg font-semibold text-gray-900">
          {formatPrice(item.price)} c/u
        </p>
      </div>

      {/* Controles de cantidad */}
      <div className="flex items-center space-x-2">
        <label htmlFor={`cart-quantity-${item.id}`} className="text-sm font-medium text-gray-700">
          Cantidad:
        </label>
        <div className="flex items-center border border-gray-300 rounded-lg">
          <button
            type="button"
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={item.quantity <= 1}
            className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="w-16 text-center border-0 focus:ring-0 text-sm"
          />
          <button
            type="button"
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={item.quantity >= item.availableStock}
            className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Aumentar cantidad"
          >
            +
          </button>
        </div>
      </div>

      {/* Subtotal */}
      <div className="text-right">
        <p className="text-lg font-bold text-gray-900">
          {formatPrice(subtotal)}
        </p>
        <p className="text-sm text-gray-500">
          {item.quantity} x {formatPrice(item.price)}
        </p>
      </div>

      {/* Botón eliminar */}
      <button
        onClick={() => removeItem(item.id)}
        className="text-red-500 hover:text-red-700 p-2"
        aria-label="Eliminar del carrito"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
};

export default CartItemRow;
