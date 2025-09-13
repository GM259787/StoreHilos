import { useEffect, useRef } from 'react';
import { useCartStore } from '../store/cart';
import { catalogApi } from '../api/catalog';

export const useCartSync = () => {
  const { items, recalculateDiscounts, forceSync } = useCartStore();
  const lastProductDataRef = useRef<string>('');

  // Hook para sincronizar precios del catálogo (cuando cambian los productos)
  useEffect(() => {
    const syncCatalogPrices = async () => {
      if (items.length === 0) return;

      try {
        // Obtener todos los productos del catálogo
        const response = await catalogApi.getProducts({ pageSize: 1000 });
        const currentProducts = response.items;

        // Crear un hash de los datos de productos para detectar cambios
        const productDataHash = JSON.stringify(
          currentProducts.map(p => ({
            id: p.id,
            price: p.price,
            minQuantityForDiscount: p.minQuantityForDiscount,
            discountedPrice: p.discountedPrice,
            isDiscountActive: p.isDiscountActive
          }))
        );

        // Solo sincronizar si los datos del catálogo han cambiado
        if (productDataHash !== lastProductDataRef.current) {
          lastProductDataRef.current = productDataHash;

          // Preparar datos para recálculo de descuentos
          const productData = currentProducts.map(product => ({
            id: product.id,
            minQuantityForDiscount: product.minQuantityForDiscount,
            discountedPrice: product.discountedPrice,
            originalPrice: product.price,
            isDiscountActive: product.isDiscountActive
          }));

          // Recalcular descuentos en el carrito
          recalculateDiscounts(productData);
        }
      } catch (error) {
        console.error('Error sincronizando precios del catálogo:', error);
      }
    };

    // Sincronizar cuando se monta el componente y cuando cambian los items
    syncCatalogPrices();
  }, [items.length]); // Ejecutar cuando cambie la cantidad de items en el carrito

  // Hook separado para recalcular descuentos cuando cambian las cantidades
  useEffect(() => {
    if (items.length === 0) return;

    const recalculateDiscountsForQuantityChange = async () => {
      try {
        // Obtener datos actuales del catálogo
        const response = await catalogApi.getProducts({ pageSize: 1000 });
        const currentProducts = response.items;

        // Preparar datos para recálculo de descuentos
        const productData = currentProducts.map(product => ({
          id: product.id,
          minQuantityForDiscount: product.minQuantityForDiscount,
          discountedPrice: product.discountedPrice,
          originalPrice: product.price,
          isDiscountActive: product.isDiscountActive
        }));

        // Recalcular descuentos en el carrito
        recalculateDiscounts(productData);
      } catch (error) {
        console.error('Error recalculando descuentos por cambio de cantidad:', error);
      }
    };

    // Recalcular cuando cambian las cantidades de los items
    recalculateDiscountsForQuantityChange();
  }, [items.map(item => `${item.id}-${item.quantity}`).join(','), recalculateDiscounts]); // Escuchar cambios en cantidades específicas

  // Hook para forzar sincronización cuando se actualiza un producto
  useEffect(() => {
    const forceSyncPrices = async () => {
      if (items.length === 0) return;

      try {
        // Obtener datos actuales del catálogo
        const response = await catalogApi.getProducts({ pageSize: 1000 });
        const currentProducts = response.items;

        // Preparar datos para recálculo de descuentos
        const productData = currentProducts.map(product => ({
          id: product.id,
          minQuantityForDiscount: product.minQuantityForDiscount,
          discountedPrice: product.discountedPrice,
          originalPrice: product.price,
          isDiscountActive: product.isDiscountActive
        }));

        // Recalcular descuentos en el carrito
        recalculateDiscounts(productData);
        
        // Actualizar el hash para evitar loops
        const productDataHash = JSON.stringify(
          currentProducts.map(p => ({
            id: p.id,
            price: p.price,
            minQuantityForDiscount: p.minQuantityForDiscount,
            discountedPrice: p.discountedPrice,
            isDiscountActive: p.isDiscountActive
          }))
        );
        lastProductDataRef.current = productDataHash;
      } catch (error) {
        console.error('Error en sincronización forzada:', error);
      }
    };

    // Ejecutar sincronización forzada
    forceSyncPrices();
  }, [forceSync, items.length, recalculateDiscounts]); // Escuchar cambios en forceSync
};
