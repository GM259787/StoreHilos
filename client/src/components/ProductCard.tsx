import { useState, useEffect } from 'react';
import { Product } from '../types/catalog';
import { useCartStore } from '../store/cart';
import { formatPrice } from '../utils/currency';
import { useCartSync } from '../hooks/useCartSync';


interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem, items, updateQuantity, removeItem } = useCartStore();
  
  // Obtener la cantidad actual del producto en el carrito
  const cartItem = items.find(item => item.id === product.id);
  const [quantity, setQuantity] = useState(cartItem?.quantity || 1);
  
  // Sincronizar precios del carrito con el catálogo actual
  useCartSync();
  
  // Sincronizar la cantidad con el carrito cuando cambie
  useEffect(() => {
    const currentCartItem = items.find(item => item.id === product.id);
    if (currentCartItem) {
      setQuantity(currentCartItem.quantity);
    } else {
      setQuantity(1);
    }
  }, [items, product.id]);
  
  // URL base del backend para las imágenes
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5175';
  
  // Construir la URL completa de la imagen
  const getImageUrl = (imageUrl: string | null | undefined) => {
    if (!imageUrl) {
      return 'https://picsum.photos/seed/placeholder/600/600';
    }
    // Si la URL ya es completa, usarla tal como está
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    // Si es relativa, concatenarla con la URL base del backend
    return `${API_BASE_URL}${imageUrl}`;
  };

  // Calcular precio según cantidad y descuentos
  const getCurrentPrice = () => {
    if (product.isDiscountActive && 
        product.minQuantityForDiscount && 
        product.discountedPrice && 
        quantity >= product.minQuantityForDiscount) {
      return product.discountedPrice;
    }
    return product.price;
  };

  const getSavings = () => {
    if (product.isDiscountActive && 
        product.discountedPrice) {
      return product.price - product.discountedPrice;
    }
    return 0;
  };

  const handleAddToCart = () => {
    const currentPrice = getCurrentPrice();
    const discountApplied = quantity >= (product.minQuantityForDiscount || 0);
    
    console.log('Agregando producto al carrito:', {
      id: product.id,
      name: product.name,
      price: currentPrice,
      quantity: quantity,
      availableStock: product.availableStock,
      discountApplied: discountApplied
    });
    
    // Si el producto ya está en el carrito, actualizar la cantidad
    if (cartItem) {
      updateQuantity(product.id, quantity);
    } else {
      // Si no está en el carrito, agregar la cantidad seleccionada
      for (let i = 0; i < quantity; i++) {
        addItem({
          id: product.id,
          name: product.name,
          price: currentPrice,
          imageUrl: product.imageUrl,
          stock: product.stock,
          availableStock: product.availableStock,
          originalPrice: product.price,
          hasDiscount: product.isDiscountActive,
          discountApplied: discountApplied
        });
      }
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    const validQuantity = Math.min(Math.max(0, newQuantity), product.availableStock);
    setQuantity(validQuantity);
    
    // Actualizar automáticamente en el carrito si el producto ya está ahí
    if (cartItem) {
      if (validQuantity === 0) {
        // Si la cantidad es 0, eliminar del carrito
        removeItem(product.id);
      } else {
        updateQuantity(product.id, validQuantity);
      }
    }
  };

  const isOutOfStock = product.availableStock === 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Imagen del producto */}
      <div className="aspect-square overflow-hidden relative">
        <img
          src={getImageUrl(product.imageUrl)}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badge de oferta */}
        {product.isDiscountActive && product.minQuantityForDiscount && product.discountedPrice && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
            OFERTA
          </div>
        )}
      </div>

      {/* Información del producto */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </h3>
        
        {product.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Stock */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-gray-500">
            <div>Stock total: {product.stock}</div>
            
          </div>
          {isOutOfStock && (
            <span className="text-sm text-red-500 font-medium">
              Sin stock
            </span>
          )}
        </div>

        {/* Precio - Altura fija para mantener alineación */}
        <div className="mb-4 min-h-[120px] flex flex-col justify-between">
          {product.isDiscountActive && product.minQuantityForDiscount && product.discountedPrice ? (
            <div className="space-y-1">
              {/* Precio original tachado */}
              <div className="text-lg text-gray-500 line-through">
                {formatPrice(product.price)}
              </div>
              {/* Precio con descuento */}
              <div className="text-2xl font-bold text-green-600">
                {formatPrice(product.discountedPrice)}
              </div>
              {/* Información del descuento */}
              <div className="text-sm text-green-600 font-medium">
                ¡Ahorra {formatPrice(getSavings())} por unidad!
              </div>
              {/* Condición del descuento */}
              <div className="text-xs text-gray-500">
                A partir de {product.minQuantityForDiscount} unidades
              </div>
            </div>
          ) : (
            <div className="text-2xl font-bold text-gray-900">
              {formatPrice(product.price)}
            </div>
          )}
          
          {/* Mostrar precio actual según cantidad seleccionada */}
          {product.isDiscountActive && product.minQuantityForDiscount && product.discountedPrice && (
            <div className="mt-2 p-2 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-800">
                <strong>Precio para {quantity} unidades:</strong>
              </div>
              <div className="text-lg font-bold text-blue-900">
                {formatPrice(getCurrentPrice())} c/u
              </div>
              {quantity >= product.minQuantityForDiscount && (
                <div className="text-xs text-green-600 font-medium">
                  ✅ Descuento aplicado - Ahorras {formatPrice(getSavings() * quantity)}
                </div>
              )}
              {quantity < product.minQuantityForDiscount && (
                <div className="text-xs text-orange-600">
                  Agrega {product.minQuantityForDiscount - quantity} más para ahorrar {formatPrice(getSavings())} por unidad
                </div>
              )}
            </div>
          )}
        </div>

        {/* Controles - Altura fija para mantener alineación */}
        <div className="space-y-3 min-h-[80px] flex flex-col justify-end">
          {/* Selector de cantidad */}
          <div className="flex items-center justify-between">
            <label htmlFor={`quantity-${product.id}`} className="text-sm font-medium text-gray-700">
              Cantidad:
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                type="button"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 0}
                className="px-3 py-1 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                -
              </button>
              <input
                id={`quantity-${product.id}`}
                type="number"
                min="0"
                max={product.availableStock}
                value={quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 0)}
                className="w-16 text-center border-0 focus:ring-0 text-sm"
              />
              <button
                type="button"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= product.availableStock}
                className="px-3 py-1 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
          </div>

          {/* Botón agregar al carrito - solo si no está en el carrito */}
          {!cartItem && (
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                isOutOfStock
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isOutOfStock ? 'Sin stock' : 'Agregar al carrito'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
