import { useEffect, useRef } from 'react';
import { useCartStore } from '../store/cart';
import { useAuthStore } from '../store/auth';
import { cartApi } from '../api/cart';

/**
 * Hook centralizado para sincronizar el carrito con el backend
 * Se suscribe a los cambios del carrito y sincroniza automáticamente con debounce
 * Solo debe usarse una vez en la aplicación (preferiblemente en App.tsx)
 * 
 * Este hook actúa como respaldo para sincronizaciones que puedan haberse perdido,
 * pero las sincronizaciones inmediatas en ProductCard y CartItemRow tienen prioridad.
 */
export const useCartBackendSync = () => {
  const { items } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastItemsHashRef = useRef<string>('');
  const lastSyncTimeRef = useRef<number>(0);

  useEffect(() => {
    // Solo sincronizar si el usuario está autenticado y hay items
    if (!isAuthenticated || items.length === 0) {
      // Si no hay items y había items antes, limpiar el hash para permitir sincronización futura
      if (items.length === 0) {
        lastItemsHashRef.current = '';
        lastSyncTimeRef.current = 0;
      }
      return;
    }

    // Crear un hash de los items para detectar cambios reales
    const itemsHash = JSON.stringify(
      items.map(item => ({
        id: item.id,
        quantity: item.quantity
      })).sort((a, b) => a.id - b.id)
    );

    // Si el hash no cambió, no sincronizar
    if (itemsHash === lastItemsHashRef.current) {
      return;
    }

    // Si se sincronizó hace menos de 1 segundo, probablemente fue una sincronización inmediata
    // Esperar un poco más antes de sincronizar de nuevo
    const timeSinceLastSync = Date.now() - lastSyncTimeRef.current;
    const debounceDelay = timeSinceLastSync < 1000 ? 1000 : 500;

    // Actualizar el hash
    lastItemsHashRef.current = itemsHash;

    // Limpiar timeout anterior si existe
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // Debounce: esperar antes de sincronizar para evitar múltiples llamadas
    syncTimeoutRef.current = setTimeout(async () => {
      try {
        console.log('Sincronizando carrito con backend (centralizado, respaldo)...', items);
        await cartApi.syncCart(items);
        lastSyncTimeRef.current = Date.now();
        console.log('Carrito sincronizado exitosamente (respaldo)');
      } catch (error) {
        console.error('Error sincronizando carrito:', error);
        // Revertir el hash para permitir reintento
        lastItemsHashRef.current = '';
      }
    }, debounceDelay);

    // Cleanup
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [items, isAuthenticated]);
};

