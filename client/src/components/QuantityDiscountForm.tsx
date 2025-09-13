import React, { useState } from 'react';
import { Product } from '../types/catalog';

interface QuantityDiscountFormProps {
  product: Product;
  onSave: (discountData: {
    hasQuantityDiscount: boolean;
    minQuantityForDiscount?: number;
    discountedPrice?: number;
    discountStartDate?: string;
    discountEndDate?: string;
  }) => void;
  onCancel: () => void;
}

const QuantityDiscountForm: React.FC<QuantityDiscountFormProps> = ({
  product,
  onSave,
  onCancel
}) => {
  const [hasDiscount, setHasDiscount] = useState(product.hasQuantityDiscount);
  const [minQuantity, setMinQuantity] = useState(product.minQuantityForDiscount || 2);
  const [discountedPrice, setDiscountedPrice] = useState(product.discountedPrice || product.price);
  const [startDate, setStartDate] = useState(
    product.discountStartDate ? new Date(product.discountStartDate).toISOString().split('T')[0] : ''
  );
  const [endDate, setEndDate] = useState(
    product.discountEndDate ? new Date(product.discountEndDate).toISOString().split('T')[0] : ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSave({
      hasQuantityDiscount: hasDiscount,
      minQuantityForDiscount: hasDiscount ? minQuantity : undefined,
      discountedPrice: hasDiscount ? discountedPrice : undefined,
      discountStartDate: hasDiscount && startDate ? startDate : undefined,
      discountEndDate: hasDiscount && endDate ? endDate : undefined,
    });
  };

  const calculateSavings = () => {
    if (!hasDiscount || !discountedPrice) return 0;
    return ((product.price - discountedPrice) / product.price) * 100;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Configurar Descuento por Cantidad
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Toggle para activar/desactivar descuento */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Activar descuento por cantidad
            </label>
            <button
              type="button"
              onClick={() => setHasDiscount(!hasDiscount)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                hasDiscount ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  hasDiscount ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {hasDiscount && (
            <>
              {/* Cantidad mínima */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad mínima para descuento
                </label>
                <input
                  type="number"
                  min="2"
                  value={minQuantity}
                  onChange={(e) => setMinQuantity(parseInt(e.target.value) || 2)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Precio con descuento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio con descuento
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={product.price}
                    value={discountedPrice}
                    onChange={(e) => setDiscountedPrice(parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                {discountedPrice < product.price && (
                  <p className="text-sm text-green-600 mt-1">
                    Ahorro: {calculateSavings().toFixed(1)}% (${(product.price - discountedPrice).toFixed(2)})
                  </p>
                )}
              </div>

              {/* Fechas de vigencia */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de inicio (opcional)
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de fin (opcional)
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Resumen */}
              <div className="bg-blue-50 p-3 rounded-md">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Resumen del descuento:</h4>
                <p className="text-sm text-blue-800">
                  A partir de {minQuantity} unidades: ${discountedPrice.toFixed(2)} c/u
                </p>
                <p className="text-sm text-blue-800">
                  Precio normal: ${product.price.toFixed(2)} c/u
                </p>
                {startDate && (
                  <p className="text-sm text-blue-800">
                    Válido desde: {new Date(startDate).toLocaleDateString()}
                  </p>
                )}
                {endDate && (
                  <p className="text-sm text-blue-800">
                    Válido hasta: {new Date(endDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuantityDiscountForm;
