import { useEffect, useRef, useCallback } from 'react';
import { Order } from '../types/catalog';

interface UseOrderNotificationsProps {
  orders: Order[];
  onRefresh: () => Promise<void>;
  enabled?: boolean;
  onNewOrders?: (count: number) => void;
}

export const useOrderNotifications = ({ 
  orders, 
  onRefresh, 
  enabled = true,
  onNewOrders
}: UseOrderNotificationsProps) => {
  const previousOrdersRef = useRef<Order[]>([]);
  const intervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Configuración desde variables de entorno
  const refreshInterval = Number(import.meta.env.VITE_ORDERS_REFRESH_INTERVAL) || 3; // en minutos
  const enableNotifications = import.meta.env.VITE_ENABLE_ORDER_NOTIFICATIONS === 'true';

  // Crear el audio para notificaciones
  useEffect(() => {
    if (enableNotifications) {
      // Crear un tono de notificación simple usando Web Audio API
      audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTyk1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTyk1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTyk1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTyk1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTyk1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTyk1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTyk1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTyk1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTyk1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTyk1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTyk1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTyk1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTyk1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTyk1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTyk1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTyk1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTyk1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTyk1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTyk1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTyk1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmzhBTyk1/LNeS');
    }
  }, [enableNotifications]);

  // Función para reproducir sonido de notificación
  const playNotificationSound = useCallback(() => {
    if (!enableNotifications || !audioRef.current) return;

    try {
      // Crear un contexto de audio simple para generar un tono
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Configurar el tono (frecuencia y duración)
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // Tono de 800Hz
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1); // Bajar a 600Hz

      // Configurar el volumen (fade in/out)
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);

      // Reproducir por 300ms
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);

      console.log('🔔 Nueva orden detectada - Sonido de notificación reproducido');
    } catch (error) {
      console.error('Error reproduciendo sonido de notificación:', error);
    }
  }, [enableNotifications]);

  // Detectar nuevas órdenes
  useEffect(() => {
    if (!enabled || !enableNotifications) return;

    const previousOrders = previousOrdersRef.current;
    const currentOrderIds = orders.map(order => order.id);
    const previousOrderIds = previousOrders.map(order => order.id);

    // Encontrar nuevas órdenes (que no estaban en la lista anterior)
    const newOrderIds = currentOrderIds.filter(id => !previousOrderIds.includes(id));
    
    if (newOrderIds.length > 0 && previousOrders.length > 0) {
      console.log(`🆕 ${newOrderIds.length} nueva(s) orden(es) detectada(s):`, newOrderIds);
      playNotificationSound();
      
      // Llamar callback si está definido
      if (onNewOrders) {
        onNewOrders(newOrderIds.length);
      }
      
      // Mostrar notificación del navegador si está permitido
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Nueva orden recibida', {
          body: `Se ${newOrderIds.length === 1 ? 'ha recibido' : 'han recibido'} ${newOrderIds.length} nueva${newOrderIds.length === 1 ? '' : 's'} orden${newOrderIds.length === 1 ? '' : 'es'}`,
          icon: '/favicon.ico',
          tag: 'new-order'
        });
      }
    }

    // Actualizar la referencia de órdenes anteriores
    previousOrdersRef.current = [...orders];
  }, [orders, enabled, enableNotifications, playNotificationSound]);

  // Configurar auto-refresh
  useEffect(() => {
    if (!enabled) return;

    const intervalMs = refreshInterval * 60 * 1000; // convertir minutos a milisegundos
    
    console.log(`🔄 Auto-refresh configurado cada ${refreshInterval} minutos`);

    intervalRef.current = setInterval(() => {
      console.log('🔄 Ejecutando auto-refresh de órdenes...');
      onRefresh();
    }, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, refreshInterval, onRefresh]);

  // Solicitar permisos de notificación al montar
  useEffect(() => {
    if (!enableNotifications) return;

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        console.log('Permisos de notificación:', permission);
      });
    }
  }, [enableNotifications]);

  // Función para limpiar intervalos al desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    refreshInterval,
    enableNotifications,
    playNotificationSound
  };
};