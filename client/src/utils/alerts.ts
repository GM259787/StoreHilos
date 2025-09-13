import Swal from 'sweetalert2';

// Configuración base para todas las alertas
const baseConfig = {
  confirmButtonColor: '#3b82f6',
  cancelButtonColor: '#ef4444',
  buttonsStyling: true,
  customClass: {
    confirmButton: 'px-6 py-2 rounded-lg font-medium',
    cancelButton: 'px-6 py-2 rounded-lg font-medium',
    popup: 'rounded-xl shadow-2xl'
  }
};

// Alerta de éxito
export const showSuccess = (title: string, text?: string) => {
  return Swal.fire({
    ...baseConfig,
    icon: 'success',
    title,
    text,
    confirmButtonText: '¡Perfecto!',
    confirmButtonColor: '#10b981'
  });
};

// Alerta de error
export const showError = (title: string, text?: string) => {
  return Swal.fire({
    ...baseConfig,
    icon: 'error',
    title,
    text,
    confirmButtonText: 'Entendido',
    confirmButtonColor: '#ef4444'
  });
};

// Alerta de advertencia
export const showWarning = (title: string, text?: string) => {
  return Swal.fire({
    ...baseConfig,
    icon: 'warning',
    title,
    text,
    confirmButtonText: 'Entendido',
    confirmButtonColor: '#f59e0b'
  });
};

// Alerta de información
export const showInfo = (title: string, text?: string) => {
  return Swal.fire({
    ...baseConfig,
    icon: 'info',
    title,
    text,
    confirmButtonText: 'Entendido',
    confirmButtonColor: '#3b82f6'
  });
};

// Alerta de confirmación
export const showConfirm = (title: string, text?: string, confirmText = 'Sí, continuar', cancelText = 'Cancelar') => {
  return Swal.fire({
    ...baseConfig,
    icon: 'question',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true
  });
};

// Alerta de confirmación para eliminar
export const showDeleteConfirm = (title: string, text?: string) => {
  return Swal.fire({
    ...baseConfig,
    icon: 'warning',
    title,
    text: text || 'Esta acción no se puede deshacer',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#ef4444',
    reverseButtons: true
  });
};

// Alerta de carga
export const showLoading = (title: string, text?: string) => {
  return Swal.fire({
    title,
    text: text || 'Procesando...',
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
};

// Cerrar alerta de carga
export const closeLoading = () => {
  Swal.close();
};

// Alerta personalizada con input
export const showInput = (title: string, inputType: 'text' | 'email' | 'password' | 'number' = 'text', placeholder?: string) => {
  return Swal.fire({
    ...baseConfig,
    title,
    input: inputType,
    inputPlaceholder: placeholder,
    showCancelButton: true,
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Cancelar',
    inputValidator: (value) => {
      if (!value) {
        return 'Este campo es obligatorio';
      }
    }
  });
};
