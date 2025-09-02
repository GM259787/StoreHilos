import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/auth';

interface ShippingInfoFormProps {
  onSubmit: (shippingInfo: ShippingInfo) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface ShippingInfo {
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingInstructions?: string;
}

const ShippingInfoForm: React.FC<ShippingInfoFormProps> = ({ onSubmit, onCancel, isLoading = false }) => {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState<ShippingInfo>({
    shippingPhone: '',
    shippingAddress: '',
    shippingCity: '',
    shippingPostalCode: '',
    shippingInstructions: ''
  });
  const [addressMode, setAddressMode] = useState<'existing' | 'new'>('existing');

  // Cargar datos existentes del usuario si los tiene
  useEffect(() => {
    if (user && addressMode === 'existing') {
      setFormData({
        shippingPhone: user.shippingPhone || '',
        shippingAddress: user.shippingAddress || '',
        shippingCity: user.shippingCity || '',
        shippingPostalCode: user.shippingPostalCode || '',
        shippingInstructions: user.shippingInstructions || ''
      });
    } else if (addressMode === 'new') {
      setFormData({
        shippingPhone: '',
        shippingAddress: '',
        shippingCity: '',
        shippingPostalCode: '',
        shippingInstructions: ''
      });
    }
  }, [user, addressMode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleAddressModeChange = (mode: 'existing' | 'new') => {
    setAddressMode(mode);
    if (mode === 'existing' && user) {
      setFormData({
        shippingPhone: user.shippingPhone || '',
        shippingAddress: user.shippingAddress || '',
        shippingCity: user.shippingCity || '',
        shippingPostalCode: user.shippingPostalCode || '',
        shippingInstructions: user.shippingInstructions || ''
      });
    } else {
      setFormData({
        shippingPhone: '',
        shippingAddress: '',
        shippingCity: '',
        shippingPostalCode: '',
        shippingInstructions: ''
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Datos de Envío</h3>
      
      {/* Selector de modo de dirección */}
      <div className="mb-6">
        <div className="flex space-x-2 p-1 bg-gray-100 rounded-lg">
          <button
            type="button"
            onClick={() => handleAddressModeChange('existing')}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              addressMode === 'existing'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {user?.shippingAddress ? 'Modificar Dirección' : 'Usar Datos Existentes'}
          </button>
          <button
            type="button"
            onClick={() => handleAddressModeChange('new')}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              addressMode === 'new'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Nueva Dirección
          </button>
        </div>
        
        {addressMode === 'existing' && user?.shippingAddress && (
          <div className="mt-3 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Dirección actual:</span><br />
              {user.shippingAddress}, {user.shippingCity} {user.shippingPostalCode}
            </p>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Teléfono */}
        <div>
          <label htmlFor="shippingPhone" className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono *
          </label>
          <input
            type="tel"
            id="shippingPhone"
            name="shippingPhone"
            required
            value={formData.shippingPhone}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ej: +54 11 1234-5678"
          />
        </div>

        {/* Dirección */}
        <div>
          <label htmlFor="shippingAddress" className="block text-sm font-medium text-gray-700 mb-1">
            Dirección *
          </label>
          <input
            type="text"
            id="shippingAddress"
            name="shippingAddress"
            required
            value={formData.shippingAddress}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ej: Av. Corrientes 1234"
          />
        </div>

        {/* Ciudad */}
        <div>
          <label htmlFor="shippingCity" className="block text-sm font-medium text-gray-700 mb-1">
            Ciudad *
          </label>
          <input
            type="text"
            id="shippingCity"
            name="shippingCity"
            required
            value={formData.shippingCity}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ej: Buenos Aires"
          />
        </div>

        {/* Código Postal */}
        <div>
          <label htmlFor="shippingPostalCode" className="block text-sm font-medium text-gray-700 mb-1">
            Código Postal *
          </label>
          <input
            type="text"
            id="shippingPostalCode"
            name="shippingPostalCode"
            required
            value={formData.shippingPostalCode}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ej: 1043"
          />
        </div>

        {/* Instrucciones */}
        <div>
          <label htmlFor="shippingInstructions" className="block text-sm font-medium text-gray-700 mb-1">
            Instrucciones de Envío
          </label>
          <textarea
            id="shippingInstructions"
            name="shippingInstructions"
            rows={3}
            value={formData.shippingInstructions}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ej: Edificio azul, timbre 5B, código de acceso 1234"
          />
        </div>

        {/* Botones */}
        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          >
            {isLoading ? 'Guardando...' : addressMode === 'existing' ? 'Actualizar y Continuar' : 'Guardar y Continuar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ShippingInfoForm;
