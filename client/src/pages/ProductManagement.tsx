import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/auth';
import { useCartStore } from '../store/cart';
import { catalogApi } from '../api/catalog';
import { fileUploadApi } from '../api/fileUpload';
import { Category, Product } from '../types/catalog';
import { formatPrice } from '../utils/currency';
import { showError, showSuccess, showDeleteConfirm } from '../utils/alerts';
import QuantityDiscountForm from '../components/QuantityDiscountForm';


interface CreateProductForm {
  name: string;
  description: string;
  imageUrl: string;
  stock: number;
  price: number;
  categoryId: number;
}

interface UpdateProductForm {
  name?: string;
  description?: string;
  imageUrl?: string;
  stock?: number;
  price?: number;
  categoryId?: number;
}

interface BulkProductForm {
  baseName: string;
  description: string;
  price: number;
  stock: number;
  categoryId: number;
}

interface BulkImagePreview {
  file: File;
  preview: string;
  color: string;
}

const ProductManagement: React.FC = () => {
  const { user } = useAuthStore();
  const { forceSync } = useCartStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const [discountProduct, setDiscountProduct] = useState<Product | null>(null);

  const [createForm, setCreateForm] = useState<CreateProductForm>({
    name: '',
    description: '',
    imageUrl: '',
    stock: 0,
    price: 0,
    categoryId: 0
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [updateForm, setUpdateForm] = useState<UpdateProductForm>({});
  const [editingImage, setEditingImage] = useState<File | null>(null);
  const [editingImagePreview, setEditingImagePreview] = useState<string | null>(null);
  const [updatingImage, setUpdatingImage] = useState(false);

  // Estado para carga masiva
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [bulkForm, setBulkForm] = useState<BulkProductForm>({
    baseName: '',
    description: '',
    price: 0,
    stock: 0,
    categoryId: 0
  });
  const [bulkImages, setBulkImages] = useState<BulkImagePreview[]>([]);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState('');

  // URL base del backend para las imágenes
  const [API_BASE_URL, setApiBaseUrl] = useState<string>('http://localhost:5175');

  useEffect(() => {
    const loadApiUrl = async () => {
      const { getApiBaseUrl } = await import('../utils/apiConfig');
      const url = await getApiBaseUrl();
      setApiBaseUrl(url);
    };
    loadApiUrl();
  }, []);

  // Construir la URL completa de la imagen
  const getImageUrl = (imageUrl: string | null | undefined) => {
    if (!imageUrl) {
      return 'https://picsum.photos/seed/placeholder/100/100';
    }
    // Si la URL ya es completa, usarla tal como está
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return encodeURI(imageUrl);
    }
    // Si es relativa, concatenarla con la URL base del backend
    return encodeURI(`${API_BASE_URL}${imageUrl}`);
  };

  // Verificar si el usuario tiene permisos
  if (!user || user.role !== 'Cobrador') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Acceso Denegado
          </h1>
          <p className="text-gray-600">
            No tienes permisos para acceder a esta página.
          </p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesData, productsData] = await Promise.all([
        catalogApi.getCategories(),
        catalogApi.getProducts({ pageSize: 100 }) // Obtener todos los productos
      ]);
      setCategories(categoriesData);
      setProducts(productsData.items);
    } catch (err) {
      setError('Error al cargar los datos');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let imageUrl = createForm.imageUrl;

      // Si hay una imagen seleccionada, subirla primero
      if (selectedImage) {
        setUploadingImage(true);
        try {
          const uploadResult = await fileUploadApi.uploadImage(selectedImage);
          imageUrl = uploadResult.fileUrl;
        } catch (uploadErr: any) {
          showError('Error al subir imagen', `Error al subir la imagen: ${uploadErr.response?.data?.message || uploadErr.message}`);
          setUploadingImage(false);
          return;
        }
        setUploadingImage(false);
      }

      // Crear el producto con la URL de la imagen
      const productData = {
        ...createForm,
        imageUrl: imageUrl
      };

      const newProduct = await catalogApi.createProduct(productData);
      setProducts([...products, newProduct]);

      // Limpiar el formulario
      setCreateForm({
        name: '',
        description: '',
        imageUrl: '',
        stock: 0,
        price: 0,
        categoryId: 0
      });
      setSelectedImage(null);
      setImagePreview(null);
      setShowCreateForm(false);

      showSuccess('¡Producto creado!', 'El producto se ha creado exitosamente');
    } catch (err: any) {
      showError('Error al crear producto', `Error al crear producto: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    console.log(e, updateForm, editingImage);
    try {
      let imageUrl = updateForm.imageUrl;

      // Si hay una nueva imagen seleccionada, subirla primero
      if (editingImage) {
        setUpdatingImage(true);
        try {
          const uploadResult = await fileUploadApi.uploadImage(editingImage);
          imageUrl = uploadResult.fileUrl;
          console.log('Uploaded image URL:', imageUrl);
        } catch (uploadErr: any) {
          showError('Error al subir imagen', `Error al subir la imagen: ${uploadErr.response?.data?.message || uploadErr.message}`);
          setUpdatingImage(false);
          return;
        }
        setUpdatingImage(false);
      }

      // Actualizar el producto con la nueva URL de la imagen si se subió una
      const updateData = {
        ...updateForm,
        ...(imageUrl && { imageUrl })
      };

      const updatedProduct = await catalogApi.updateProduct(editingProduct.id, updateData);
      setProducts(products.map(p => p.id === editingProduct.id ? updatedProduct : p));

      // Forzar sincronización del carrito para actualizar precios
      forceSync();

      // Limpiar el formulario
      setEditingProduct(null);
      setUpdateForm({});
      setEditingImage(null);
      setEditingImagePreview(null);

      showSuccess('¡Producto actualizado!', 'El producto se ha actualizado exitosamente');
    } catch (err: any) {
      showError('Error al actualizar producto', `Error al actualizar producto: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    const result = await showDeleteConfirm('Eliminar producto', '¿Estás seguro de que quieres eliminar este producto?');
    if (!result.isConfirmed) return;

    try {
      await catalogApi.deleteProduct(productId);
      setProducts(products.filter(p => p.id !== productId));
      showSuccess('¡Producto eliminado!', 'El producto se ha eliminado exitosamente');
    } catch (err: any) {
      showError('Error al eliminar producto', `Error al eliminar producto: ${err.response?.data?.message || err.message}`);
    }
  };

  const startEditing = (product: Product) => {
    setEditingProduct(product);
    setUpdateForm({
      name: product.name,
      description: product.description || '',
      imageUrl: product.imageUrl || '',
      stock: product.stock,
      price: product.price,
      categoryId: product.categoryId
    });
    setEditingImage(null);
    setEditingImagePreview(null);
  };

  const startDiscountConfig = (product: Product) => {
    setDiscountProduct(product);
    setShowDiscountForm(true);
  };

  const handleDiscountSave = async (discountData: {
    hasQuantityDiscount: boolean;
    minQuantityForDiscount?: number;
    discountedPrice?: number;
    discountStartDate?: string;
    discountEndDate?: string;
  }) => {
    if (!discountProduct) return;

    try {
      await catalogApi.updateProduct(discountProduct.id, discountData);

      // Actualizar el producto en la lista local
      setProducts(products.map(p =>
        p.id === discountProduct.id
          ? { ...p, ...discountData }
          : p
      ));

      // Forzar sincronización del carrito para actualizar precios
      forceSync();

      setShowDiscountForm(false);
      setDiscountProduct(null);
      showSuccess('¡Descuento configurado!', 'El descuento por cantidad se ha configurado exitosamente');
    } catch (err: any) {
      showError('Error al configurar descuento', `Error al configurar descuento: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleDiscountCancel = () => {
    setShowDiscountForm(false);
    setDiscountProduct(null);
  };

  // Extraer color del nombre del archivo (sin extensión, capitalizado)
  const extractColorFromFilename = (filename: string): string => {
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
    return nameWithoutExt.charAt(0).toUpperCase() + nameWithoutExt.slice(1);
  };

  // Manejar selección de múltiples imágenes para carga masiva
  const handleBulkImagesSelect = (files: FileList) => {
    const newImages: BulkImagePreview[] = [];
    let loaded = 0;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newImages.push({
          file,
          preview: e.target?.result as string,
          color: extractColorFromFilename(file.name)
        });
        loaded++;
        if (loaded === files.length) {
          setBulkImages(prev => [...prev, ...newImages]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Eliminar una imagen del preview de carga masiva
  const removeBulkImage = (index: number) => {
    setBulkImages(prev => prev.filter((_, i) => i !== index));
  };

  // Crear productos en masa
  const handleBulkCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (bulkImages.length === 0) {
      showError('Sin imágenes', 'Debes seleccionar al menos una imagen');
      return;
    }

    if (bulkForm.categoryId === 0) {
      showError('Sin categoría', 'Debes seleccionar una categoría');
      return;
    }

    setBulkUploading(true);
    const created: Product[] = [];
    const errors: string[] = [];

    for (let i = 0; i < bulkImages.length; i++) {
      const img = bulkImages[i];
      setBulkProgress(`${i + 1}/${bulkImages.length}`);

      try {
        // Subir imagen
        const uploadResult = await fileUploadApi.uploadImage(img.file);

        // Crear producto
        const productName = `${bulkForm.baseName} - ${img.color}`;
        const newProduct = await catalogApi.createProduct({
          name: productName,
          description: bulkForm.description || undefined,
          imageUrl: uploadResult.fileUrl,
          stock: bulkForm.stock,
          price: bulkForm.price,
          categoryId: bulkForm.categoryId
        });
        created.push(newProduct);
      } catch (err: any) {
        errors.push(`${img.color}: ${err.response?.data?.message || err.message}`);
      }
    }

    setBulkUploading(false);
    setBulkProgress('');

    // Actualizar lista de productos
    if (created.length > 0) {
      setProducts(prev => [...prev, ...created]);
    }

    // Mostrar resultado
    if (errors.length === 0) {
      showSuccess('¡Carga masiva completada!', `Se crearon ${created.length} productos exitosamente`);
      // Limpiar formulario
      setBulkForm({ baseName: '', description: '', price: 0, stock: 0, categoryId: 0 });
      setBulkImages([]);
      setShowBulkForm(false);
    } else if (created.length > 0) {
      showError('Carga parcial', `Se crearon ${created.length} productos. Errores (${errors.length}):\n${errors.join('\n')}`);
      setBulkImages([]);
      setShowBulkForm(false);
    } else {
      showError('Error en carga masiva', `No se pudo crear ningún producto:\n${errors.join('\n')}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Error
          </h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">
            Gestión de Productos
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Administra los productos del catálogo
          </p>
        </div>

        {/* Botones para crear producto */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => { setShowCreateForm(!showCreateForm); setShowBulkForm(false); }}
            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2.5 sm:py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            {showCreateForm ? 'Cancelar' : 'Crear Nuevo Producto'}
          </button>
          <button
            onClick={() => { setShowBulkForm(!showBulkForm); setShowCreateForm(false); }}
            className="w-full sm:w-auto bg-purple-600 text-white px-4 py-2.5 sm:py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm sm:text-base"
          >
            {showBulkForm ? 'Cancelar Carga Masiva' : 'Carga Masiva'}
          </button>
        </div>

        {/* Formulario para crear producto */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Crear Nuevo Producto</h2>
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría *
                  </label>
                  <select
                    required
                    value={createForm.categoryId}
                    onChange={(e) => setCreateForm({ ...createForm, categoryId: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={0}>Seleccionar categoría</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio (UYU) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={createForm.price}
                    onChange={(e) => setCreateForm({ ...createForm, price: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={createForm.stock}
                    onChange={(e) => setCreateForm({ ...createForm, stock: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Imagen del producto
                  </label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedImage(file);
                          // Crear preview de la imagen
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            setImagePreview(e.target?.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    {imagePreview && (
                      <div className="mt-2">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-32 w-32 object-cover rounded-lg border"
                        />
                      </div>
                    )}
                    <div className="text-xs sm:text-sm text-gray-500">
                      Formatos permitidos: JPG, PNG, GIF, WebP. Máximo 5MB.
                    </div>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 text-sm sm:text-base"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {uploadingImage ? 'Subiendo imagen...' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Formulario de carga masiva */}
        {showBulkForm && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8 border-2 border-purple-200">
            <h2 className="text-lg sm:text-xl font-semibold mb-1 text-purple-800">Carga Masiva de Productos</h2>
            <p className="text-sm text-gray-500 mb-4">
              Sube varias imágenes y se creará un producto por cada una. El color se toma del nombre del archivo.
            </p>
            <form onSubmit={handleBulkCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre base del producto *
                  </label>
                  <input
                    type="text"
                    required
                    value={bulkForm.baseName}
                    onChange={(e) => setBulkForm({ ...bulkForm, baseName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Ej: Hilo de algodón"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Cada producto se llamará: "Nombre base - Color"
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría *
                  </label>
                  <select
                    required
                    value={bulkForm.categoryId}
                    onChange={(e) => setBulkForm({ ...bulkForm, categoryId: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value={0}>Seleccionar categoría</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio (UYU) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={bulkForm.price}
                    onChange={(e) => setBulkForm({ ...bulkForm, price: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock por producto *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={bulkForm.stock}
                    onChange={(e) => setBulkForm({ ...bulkForm, stock: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción (compartida)
                  </label>
                  <textarea
                    value={bulkForm.description}
                    onChange={(e) => setBulkForm({ ...bulkForm, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Imágenes (una por color) *
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleBulkImagesSelect(e.target.files);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    El nombre del archivo será el color del producto. Ej: "rojo.jpg" → color "Rojo"
                  </p>
                </div>
              </div>

              {/* Preview de imágenes seleccionadas */}
              {bulkImages.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Productos a crear ({bulkImages.length}):
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {bulkImages.map((img, index) => (
                      <div key={index} className="relative bg-gray-50 rounded-lg p-2 border border-gray-200">
                        <button
                          type="button"
                          onClick={() => removeBulkImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 z-10"
                        >
                          X
                        </button>
                        <img
                          src={img.preview}
                          alt={img.color}
                          className="w-full h-20 object-cover rounded mb-1"
                        />
                        <p className="text-xs text-center font-medium text-purple-700 truncate">
                          {bulkForm.baseName ? `${bulkForm.baseName} - ${img.color}` : img.color}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Barra de progreso */}
              {bulkUploading && (
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-purple-600 border-solid"></div>
                    <span className="text-sm text-purple-700 font-medium">
                      Creando producto {bulkProgress}...
                    </span>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setShowBulkForm(false); setBulkImages([]); }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 text-sm sm:text-base"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={bulkUploading || bulkImages.length === 0}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {bulkUploading ? `Creando ${bulkProgress}...` : `Crear ${bulkImages.length} Producto${bulkImages.length !== 1 ? 's' : ''}`}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de productos */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold">Productos Existentes</h2>
          </div>
          
          {/* Vista de tabla para desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio (UYU)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {product.imageUrl && (
                          <img
                            src={getImageUrl(product.imageUrl)}
                            alt={product.name}
                            className="h-10 w-10 rounded-full object-cover mr-3"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          {product.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {product.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {categories.find(c => c.id === product.categoryId)?.name || 'Sin categoría'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => startEditing(product)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => startDiscountConfig(product)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Descuentos
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Vista de tarjetas para móvil */}
          <div className="md:hidden divide-y divide-gray-200">
            {products.map((product) => (
              <div key={product.id} className="p-4">
                <div className="flex items-start gap-3">
                  {product.imageUrl && (
                    <img
                      src={getImageUrl(product.imageUrl)}
                      alt={product.name}
                      className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 mb-1">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-2">
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        {categories.find(c => c.id === product.categoryId)?.name || 'Sin categoría'}
                      </span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
                        {formatPrice(product.price)}
                      </span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                        Stock: {product.stock}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => startEditing(product)}
                        className="text-xs text-blue-600 hover:text-blue-900 px-2 py-1 border border-blue-300 rounded"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => startDiscountConfig(product)}
                        className="text-xs text-green-600 hover:text-green-900 px-2 py-1 border border-green-300 rounded"
                      >
                        Descuentos
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-xs text-red-600 hover:text-red-900 px-2 py-1 border border-red-300 rounded"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal de edición */}
        {editingProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-4">Editar Producto</h2>
                <form onSubmit={handleUpdateProduct} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre
                      </label>
                      <input
                        type="text"
                        value={updateForm.name || ''}
                        onChange={(e) => setUpdateForm({ ...updateForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Categoría
                      </label>
                      <select
                        value={updateForm.categoryId || 0}
                        onChange={(e) => setUpdateForm({ ...updateForm, categoryId: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      >
                        <option value={0}>Mantener categoría actual</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Precio (UYU)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={updateForm.price || ''}
                        onChange={(e) => setUpdateForm({ ...updateForm, price: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stock
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={updateForm.stock || ''}
                        onChange={(e) => setUpdateForm({ ...updateForm, stock: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Imagen del producto
                      </label>
                      <div className="space-y-2">
                        {/* Mostrar imagen actual si existe */}
                        {editingProduct?.imageUrl && !editingImagePreview && (
                          <div className="mb-2">
                            <p className="text-sm text-gray-600 mb-2">Imagen actual:</p>
                            <img
                              src={getImageUrl(editingProduct.imageUrl)}
                              alt="Imagen actual"
                              className="h-32 w-32 object-cover rounded-lg border"
                            />
                          </div>
                        )}

                        {/* Preview de nueva imagen si se selecciona */}
                        {editingImagePreview && (
                          <div className="mb-2">
                            <p className="text-sm text-gray-600 mb-2">Nueva imagen:</p>
                            <img
                              src={editingImagePreview}
                              alt="Nueva imagen"
                              className="h-32 w-32 object-cover rounded-lg border"
                            />
                          </div>
                        )}

                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setEditingImage(file);
                              // Crear preview de la nueva imagen
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                setEditingImagePreview(e.target?.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <div className="text-xs sm:text-sm text-gray-500">
                          Deja vacío para mantener la imagen actual. Formatos: JPG, PNG, GIF, WebP. Máximo 5MB.
                        </div>
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción
                      </label>
                      <textarea
                        value={updateForm.description || ''}
                        onChange={(e) => setUpdateForm({ ...updateForm, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProduct(null);
                        setUpdateForm({});
                      }}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 text-sm sm:text-base"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={updatingImage}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                      {updatingImage ? 'Subiendo imagen...' : 'Actualizar Producto'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Formulario de descuentos por cantidad */}
        {showDiscountForm && discountProduct && (
          <QuantityDiscountForm
            product={discountProduct}
            onSave={handleDiscountSave}
            onCancel={handleDiscountCancel}
          />
        )}
      </div>
    </div>
  );
};

export default ProductManagement;
