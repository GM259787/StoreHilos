import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { catalogApi } from '../api/catalog';
import { Product } from '../types/catalog';
import { useCartStore } from '../store/cart';
import { formatPrice } from '../utils/currency';
import { useCartSync } from '../hooks/useCartSync';

const ProductDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { addItem, items, updateQuantity, removeItem } = useCartStore();
    const [Item, setItem] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [quantity, setQuantity] = useState(1);

    // Sincronizar precios del carrito con el catálogo actual
    useCartSync();

    // Obtener la cantidad actual del producto en el carrito
    const cartItem = items.find(item => item.id === Item?.id);

    // Sincronizar la cantidad con el carrito cuando cambie
    useEffect(() => {
        if (Item) {
            const currentCartItem = items.find(item => item.id === Item.id);
            if (currentCartItem) {
                setQuantity(currentCartItem.quantity);
            } else {
                setQuantity(1);
            }
        }
    }, [items, Item]);

    useEffect(() => {
       const fetchProduct = async () => {
           if (!id) return;
           
           try {
               setIsLoading(true);
               setError('');
               const productId = parseInt(id, 10);
               const data = await catalogApi.getProduct(productId);
               setItem(data);
           } catch (err) {
               setError('No se pudo cargar el producto. Inténtalo de nuevo.');
               console.error('Error loading product:', err);
           } finally {
               setIsLoading(false);
           }
       };
       fetchProduct();
    }, [id]);

    // URL base del backend para las imágenes
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5175';

    // Construir la URL completa de la imagen
    const getImageUrl = (imageUrl: string | null | undefined) => {
        if (!imageUrl) {
            return 'https://picsum.photos/seed/placeholder/600/600';
        }
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return encodeURI(imageUrl);
        }
        return encodeURI(`${API_BASE_URL}${imageUrl}`);
    };

    // Calcular precio según cantidad y descuentos
    const getCurrentPrice = () => {
        if (!Item) return 0;
        if (Item.isDiscountActive &&
            Item.minQuantityForDiscount &&
            Item.discountedPrice &&
            quantity >= Item.minQuantityForDiscount) {
            return Item.discountedPrice;
        }
        return Item.price;
    };

    const getSavings = () => {
        if (!Item || !Item.isDiscountActive || !Item.discountedPrice) return 0;
        return Item.price - Item.discountedPrice;
    };

    const handleAddToCart = () => {
        if (!Item) return;
        
        const currentPrice = getCurrentPrice();
        const discountApplied = quantity >= (Item.minQuantityForDiscount || 0);

        // Si el producto ya está en el carrito, actualizar la cantidad
        if (cartItem) {
            updateQuantity(Item.id, quantity);
        } else {
            // Si no está en el carrito, agregar la cantidad seleccionada
            for (let i = 0; i < quantity; i++) {
                addItem({
                    id: Item.id,
                    name: Item.name,
                    price: currentPrice,
                    imageUrl: Item.imageUrl,
                    stock: Item.stock,
                    availableStock: Item.availableStock,
                    originalPrice: Item.price,
                    hasDiscount: Item.isDiscountActive,
                    discountApplied: discountApplied
                });
            }
        }
    };

    const handleQuantityChange = (newQuantity: number) => {
        if (!Item) return;
        
        const validQuantity = Math.min(Math.max(1, newQuantity), Item.availableStock);
        setQuantity(validQuantity);

        // Actualizar automáticamente en el carrito si el producto ya está ahí
        if (cartItem) {
            updateQuantity(Item.id, validQuantity);
        }
    };

    const handleRemoveFromCart = () => {
        if (!Item) return;
        removeItem(Item.id);
    };

    const isOutOfStock = Item ? Item.availableStock === 0 : false;
    
    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando producto...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center py-12">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.history.back()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Volver
                    </button>
                </div>
            </div>
        );
    }

    if (!Item) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center py-12">
                    <p className="text-gray-600">Producto no encontrado</p>
                </div>
            </div>
        );
    }

    return ( 
        <div className="min-h-screen bg-gray-50 py-4 sm:py-12 relative">
            {/* Back button - Absolute positioned */}
            <button
                onClick={() => window.history.back()}
                className="fixed top-20 sm:top-24 left-4 sm:left-6 z-10 bg-white hover:bg-gray-50 text-gray-700 font-medium px-3 py-2 sm:px-4 sm:py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200"
            >
                <div className="flex items-center space-x-1 sm:space-x-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="text-sm sm:text-base">Volver</span>
                </div>
            </button>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Main product container */}
                <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                        {/* Imagen del producto */}
                        <div className="relative bg-gray-100">
                            <div className="aspect-square overflow-hidden">
                                <img
                                    src={getImageUrl(Item.imageUrl)}
                                    alt={Item.name}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                            {/* Badge de oferta */}
                            {Item.isDiscountActive && Item.discountedPrice && (
                                <div className="absolute top-3 right-3 sm:top-6 sm:right-6 bg-red-500 text-white text-xs sm:text-sm font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-lg">
                                    OFERTA ESPECIAL
                                </div>
                            )}
                        </div>

                        {/* Información del producto */}
                        <div className="p-4 sm:p-8 lg:p-12 flex flex-col justify-center">
                            <div className="space-y-4 sm:space-y-8">
                                {/* Header */}
                                <div className="border-b border-gray-200 pb-4 sm:pb-6">
                                    <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">{Item.name}</h1>
                                    {Item.description && (
                                        <p className="text-sm sm:text-lg text-gray-600 leading-relaxed">{Item.description}</p>
                                    )}
                                </div>

                                {/* Pricing section */}
                                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
                                    {Item.isDiscountActive && Item.discountedPrice ? (
                                        <div className="space-y-2 sm:space-y-3">
                                            <div className="flex items-baseline space-x-2 sm:space-x-3">
                                                <span className="text-lg sm:text-2xl text-gray-500 line-through font-medium">
                                                    {formatPrice(Item.price)}
                                                </span>
                                                <span className="text-2xl sm:text-4xl font-bold text-green-600">
                                                    {formatPrice(Item.discountedPrice)}
                                                </span>
                                            </div>
                                            <div className="bg-green-100 text-green-800 px-3 sm:px-4 py-2 rounded-lg">
                                                <p className="text-xs sm:text-sm font-medium">
                                                    💰 ¡Ahorra {formatPrice(getSavings())} por unidad!
                                                </p>
                                                <p className="text-xs mt-1">
                                                    Descuento válido desde {Item.minQuantityForDiscount} unidades
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-2xl sm:text-4xl font-bold text-gray-900">
                                            {formatPrice(Item.price)}
                                        </div>
                                    )}

                                    {/* Precio actual según cantidad seleccionada */}
                                    {Item.isDiscountActive && Item.minQuantityForDiscount && Item.discountedPrice && (
                                        <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-blue-50 rounded-lg">
                                            <div className="text-xs sm:text-sm text-blue-800">
                                                <strong>Precio para {quantity} unidades:</strong>
                                            </div>
                                            <div className="text-xl sm:text-2xl font-bold text-blue-900">
                                                {formatPrice(getCurrentPrice())} c/u
                                            </div>
                                            {quantity >= Item.minQuantityForDiscount && (
                                                <div className="text-xs text-green-600 font-medium mt-1">
                                                    ✅ Descuento aplicado - Ahorras {formatPrice(getSavings() * quantity)}
                                                </div>
                                            )}
                                            {quantity < Item.minQuantityForDiscount && (
                                                <div className="text-xs text-orange-600 mt-1">
                                                    Agrega {Item.minQuantityForDiscount - quantity} más para ahorrar {formatPrice(getSavings())} por unidad
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Stock information */}
                                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                    <div className="bg-blue-50 rounded-lg p-3 sm:p-4 text-center">
                                        <p className="text-xs sm:text-sm text-blue-600 font-medium mb-1">Stock Disponible</p>
                                        <p className="text-xl sm:text-2xl font-bold text-blue-900">{Item.availableStock}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-center">
                                        <p className="text-xs sm:text-sm text-gray-600 font-medium mb-1">Stock Total</p>
                                        <p className="text-xl sm:text-2xl font-bold text-gray-900">{Item.stock}</p>
                                    </div>
                                </div>

                                {/* Quantity and Cart Controls */}
                                <div className="space-y-3 sm:space-y-4">
                                    {/* Selector de cantidad */}
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs sm:text-sm font-medium text-gray-700">
                                            Cantidad:
                                        </label>
                                        <div className="flex items-center border border-gray-300 rounded-lg">
                                            <button
                                                type="button"
                                                onClick={() => handleQuantityChange(quantity - 1)}
                                                disabled={quantity <= 1}
                                                className="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                -
                                            </button>
                                            <input
                                                type="number"
                                                min="1"
                                                max={Item.availableStock}
                                                value={quantity}
                                                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                                                className="w-12 sm:w-16 text-center border-0 focus:ring-0 text-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleQuantityChange(quantity + 1)}
                                                disabled={quantity >= Item.availableStock}
                                                className="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    {/* Cart Actions */}
                                    <div className="pt-3 sm:pt-4 border-t border-gray-200 space-y-2 sm:space-y-3">
                                        {!cartItem ? (
                                            <button
                                                onClick={handleAddToCart}
                                                disabled={isOutOfStock}
                                                className={`w-full px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl ${
                                                    isOutOfStock
                                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                        : 'bg-primary-600 text-white hover:bg-primary-700 transform hover:scale-105'
                                                }`}
                                            >
                                                {isOutOfStock ? 'Sin stock disponible' : '🛒 Agregar al carrito'}
                                            </button>
                                        ) : (
                                            <div className="space-y-2">
                                                <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                                                    <div className="flex items-center justify-center space-x-2 text-green-700">
                                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                        <span className="text-xs sm:text-sm font-medium">Producto en el carrito ({cartItem.quantity} unidades)</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={handleRemoveFromCart}
                                                    className="w-full px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base bg-red-100 text-red-700 font-medium rounded-lg hover:bg-red-200 transition-colors"
                                                >
                                                    🗑️ Quitar del carrito
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional spacing at bottom */}
                <div className="mt-6 sm:mt-12"></div>
            </div>
        </div>
    )
};


export default ProductDetail;