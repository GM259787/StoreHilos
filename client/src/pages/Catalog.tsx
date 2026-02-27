import { useState, useEffect } from 'react';
import { Product, Category, Paged } from '../types/catalog';
import { catalogApi } from '../api/catalog';
import CategoryMenu from '../components/CategoryMenu';
import ProductCard from '../components/ProductCard';
import CategoryCard from '../components/CategoryCard';
import Pagination from '../components/Pagination';
import { useTheme } from '../config/theme';

const Catalog = () => {
  const theme = useTheme();
  const isCategoryMode = theme?.catalogViewMode === 'categories';

  const [products, setProducts] = useState<Paged<Product>>({ items: [], total: 0, page: 1, pageSize: 12 });
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [showingCategories, setShowingCategories] = useState(true);

  // Cargar categorías para el modo categorías
  useEffect(() => {
    if (isCategoryMode) {
      const loadCategories = async () => {
        try {
          const data = await catalogApi.getCategories();
          setCategories(data);
        } catch (err) {
          console.error('Error loading categories:', err);
        }
      };
      loadCategories();
    }
  }, [isCategoryMode]);

  const loadProducts = async (page: number = 1) => {
    try {
      setIsLoading(true);
      setError('');

      const filters = {
        categoryId: selectedCategory || undefined,
        search: searchTerm || undefined,
        page,
        pageSize: 12,
        sort: sortBy || undefined
      };

      const data = await catalogApi.getProducts(filters);
      setProducts(data);
    } catch (err) {
      setError('No se pudieron cargar los productos. Inténtalo de nuevo.');
      console.error('Error loading products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // En modo categorías, solo cargar productos cuando se selecciona una categoría
    if (isCategoryMode && showingCategories) {
      setIsLoading(false);
      return;
    }
    loadProducts(1);
  }, [selectedCategory, searchTerm, sortBy, showingCategories]);

  const handlePageChange = (page: number) => {
    loadProducts(page);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    loadProducts(1);
  };

  const handleCategoryCardClick = (categoryId: number) => {
    setSelectedCategory(categoryId);
    setShowingCategories(false);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSearchTerm('');
    setSortBy('');
    setShowingCategories(true);
  };

  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    if (isCategoryMode) {
      if (categoryId === null) {
        setShowingCategories(true);
      } else {
        setShowingCategories(false);
      }
    }
  };

  const totalPages = Math.ceil(products.total / products.pageSize);

  const selectedCategoryName = selectedCategory
    ? categories.find(c => c.id === selectedCategory)?.name
    : null;

  // Vista de categorías (modo StoreHilos)
  if (isCategoryMode && showingCategories) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Categorías</h2>
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando categorías...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onClick={handleCategoryCardClick}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Vista de productos (modo MásHogar o categoría seleccionada en StoreHilos)
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Botón volver a categorías (solo en modo categorías) */}
      {isCategoryMode && (
        <button
          onClick={handleBackToCategories}
          className="mb-6 flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Volver a categorías</span>
        </button>
      )}

      {/* Título de categoría seleccionada */}
      {isCategoryMode && selectedCategoryName && (
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{selectedCategoryName}</h2>
      )}

      {/* Filtros */}
      <div className="mb-8">
        <div className={`grid grid-cols-1 ${isCategoryMode ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-4`}>
          {/* Categorías dropdown (solo en modo productos) */}
          {!isCategoryMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <CategoryMenu
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategorySelect}
              />
            </div>
          )}

          {/* Búsqueda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </form>
          </div>

          {/* Ordenar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ordenar por
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Relevancia</option>
              <option value="name">Nombre A-Z</option>
              <option value="-name">Nombre Z-A</option>
              <option value="price">Precio menor a mayor</option>
              <option value="-price">Precio mayor a menor</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contenido */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando productos...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => loadProducts(1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      ) : products.items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No se encontraron productos</p>
        </div>
      ) : (
        <>
          {/* Grid de productos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {products.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <Pagination
              currentPage={products.page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Catalog;
