import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/auth';
import { catalogApi } from '../api/catalog';
import { fileUploadApi } from '../api/fileUpload';
import { Category, Product } from '../types/catalog';

// Extender el tipo ImportMeta para incluir env
declare global {
  interface ImportMeta {
    readonly env: {
      readonly VITE_API_URL?: string;
    };
  }
}

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

const ProductManagement: React.FC = () => {
  const { user } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
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
  
  // URL base del backend para las imágenes
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5175';
  
  // Construir la URL completa de la imagen
  const getImageUrl = (imageUrl: string | null | undefined) => {
    if (!imageUrl) {
      return 'https://picsum.photos/seed/placeholder/100/100';
    }
    // Si la URL ya es completa, usarla tal como está
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    // Si es relativa, concatenarla con la URL base del backend
    return `${API_BASE_URL}${imageUrl}`;
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
          alert(`Error al subir la imagen: ${uploadErr.response?.data?.message || uploadErr.message}`);
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
      
      alert('Producto creado exitosamente');
    } catch (err: any) {
      alert(`Error al crear producto: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      let imageUrl = updateForm.imageUrl;
      
      // Si hay una nueva imagen seleccionada, subirla primero
      if (editingImage) {
        setUpdatingImage(true);
        try {
          const uploadResult = await fileUploadApi.uploadImage(editingImage);
          imageUrl = uploadResult.fileUrl;
        } catch (uploadErr: any) {
          alert(`Error al subir la imagen: ${uploadErr.response?.data?.message || uploadErr.message}`);
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
      
      // Limpiar el formulario
      setEditingProduct(null);
      setUpdateForm({});
      setEditingImage(null);
      setEditingImagePreview(null);
      
      alert('Producto actualizado exitosamente');
    } catch (err: any) {
      alert(`Error al actualizar producto: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return;

    try {
      await catalogApi.deleteProduct(productId);
      setProducts(products.filter(p => p.id !== productId));
      alert('Producto eliminado exitosamente');
    } catch (err: any) {
      alert(`Error al eliminar producto: ${err.response?.data?.message || err.message}`);
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Gestión de Productos
          </h1>
          <p className="text-gray-600">
            Administra los productos del catálogo
          </p>
        </div>

        {/* Botón para crear nuevo producto */}
        <div className="mb-6">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showCreateForm ? 'Cancelar' : 'Crear Nuevo Producto'}
          </button>
        </div>

        {/* Formulario para crear producto */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Crear Nuevo Producto</h2>
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.name}
                    onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
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
                    onChange={(e) => setCreateForm({...createForm, categoryId: parseInt(e.target.value)})}
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
                    Precio *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={createForm.price}
                    onChange={(e) => setCreateForm({...createForm, price: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    onChange={(e) => setCreateForm({...createForm, stock: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <div className="text-sm text-gray-500">
                      Formatos permitidos: JPG, PNG, GIF, WebP. Máximo 5MB.
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {uploadingImage ? 'Subiendo imagen...' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de productos */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Productos Existentes</h2>
          </div>
          <div className="overflow-x-auto">
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
                    Precio
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
                      ${product.price.toFixed(2)}
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
        </div>

        {/* Modal de edición */}
        {editingProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Editar Producto</h2>
                <form onSubmit={handleUpdateProduct} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre
                      </label>
                      <input
                        type="text"
                        value={updateForm.name || ''}
                        onChange={(e) => setUpdateForm({...updateForm, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Categoría
                      </label>
                      <select
                        value={updateForm.categoryId || 0}
                        onChange={(e) => setUpdateForm({...updateForm, categoryId: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        Precio
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={updateForm.price || ''}
                        onChange={(e) => setUpdateForm({...updateForm, price: parseFloat(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        onChange={(e) => setUpdateForm({...updateForm, stock: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2">
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="text-sm text-gray-500">
                          Deja vacío para mantener la imagen actual. Formatos: JPG, PNG, GIF, WebP. Máximo 5MB.
                        </div>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción
                      </label>
                      <textarea
                        value={updateForm.description || ''}
                        onChange={(e) => setUpdateForm({...updateForm, description: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProduct(null);
                        setUpdateForm({});
                      }}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={updatingImage}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {updatingImage ? 'Subiendo imagen...' : 'Actualizar Producto'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManagement;
