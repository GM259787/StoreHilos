import { useState } from 'react';
import { Product } from '../types/catalog';
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

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCartStore();
  
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

  const handleAddToCart = () => {
    console.log('Agregando producto al carrito:', {
      id: product.id,
      name: product.name,
      price: product.price,
      availableStock: product.availableStock
    });
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      stock: product.stock,
      availableStock: product.availableStock
    });
  };

  const handleQuantityChange = (newQuantity: number) => {
    const validQuantity = Math.min(Math.max(1, newQuantity), product.availableStock);
    setQuantity(validQuantity);
  };

  const isOutOfStock = product.availableStock === 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Imagen del producto */}
      <div className="aspect-square overflow-hidden">
        <img
          src={getImageUrl(product.imageUrl)}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
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

        {/* Precio */}
        <div className="text-2xl font-bold text-gray-900 mb-4">
          {formatPrice(product.price)}
        </div>

        {/* Controles */}
        <div className="space-y-3">
          {/* Selector de cantidad */}
          <div className="flex items-center justify-between">
            <label htmlFor={`quantity-${product.id}`} className="text-sm font-medium text-gray-700">
              Cantidad:
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                type="button"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
                className="px-3 py-1 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                -
              </button>
              <input
                id={`quantity-${product.id}`}
                type="number"
                min="1"
                max={product.availableStock}
                value={quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
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

          {/* Botón agregar al carrito */}
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
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
