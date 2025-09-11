/**
 * Utilidades para formateo de moneda en pesos uruguayos
 */

/**
 * Formatea un número como precio en pesos uruguayos
 * @param amount - El monto a formatear
 * @param showCurrency - Si mostrar el símbolo de moneda (default: true)
 * @returns String formateado como precio en UYU
 */
export const formatCurrency = (amount: number, showCurrency: boolean = true): string => {
  const formatted = new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: 'UYU',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

  // Si no queremos mostrar la moneda, removemos el símbolo
  if (!showCurrency) {
    return formatted.replace('UYU', '').trim();
  }

  return formatted;
};

/**
 * Formatea un número como precio simple (solo el símbolo $)
 * @param amount - El monto a formatear
 * @returns String formateado como $XXX.XX
 */
export const formatPrice = (amount: number): string => {
  return `$${amount.toFixed(2)}`;
};

/**
 * Formatea un número como precio con separadores de miles
 * @param amount - El monto a formatear
 * @returns String formateado como $X.XXX,XX
 */
export const formatPriceWithSeparators = (amount: number): string => {
  return new Intl.NumberFormat('es-UY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Obtiene el símbolo de la moneda
 */
export const getCurrencySymbol = (): string => {
  return '$';
};

/**
 * Obtiene el código de la moneda
 */
export const getCurrencyCode = (): string => {
  return 'UYU';
};
