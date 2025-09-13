import { useEffect } from 'react';
import { useCartStore } from '../store/cart';
import { catalogApi } from '../api/catalog';

export const useCartSync = () => {
  const { items, updateItemPrice } = useCartStore();

  useEffect(() => {
    const syncPrices = async () => {
      if (items.length === 0) return;

      try {
        // Obtener todos los productos del catálogo para sincronizar precios
        const response = await catalogApi.getProducts({ pageSize: 1000 });
        const currentProducts = response.items;

        // Actualizar precios en el carrito
        items.forEach(cartItem => {
          const currentProduct = currentProducts.find(p => p.id === cartItem.id);
          if (currentProduct && currentProduct.price !== cartItem.price) {
            console.log(`Actualizando precio de ${cartItem.name}: $${cartItem.price} → $${currentProduct.price}`);
            updateItemPrice(cartItem.id, currentProduct.price);
          }
        });
      } catch (error) {
        console.error('Error sincronizando precios del carrito:', error);
      }
    };

    // Sincronizar precios cuando el componente se monta
    syncPrices();

    // Sincronizar precios cada 30 segundos para mantener actualizados
    const interval = setInterval(syncPrices, 30000);

    return () => clearInterval(interval);
  }, [items, updateItemPrice]);
};
