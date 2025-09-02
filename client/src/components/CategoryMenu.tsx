import { useState, useEffect } from 'react';
import { Category } from '../types/catalog';
import { catalogApi } from '../api/catalog';

interface CategoryMenuProps {
  selectedCategory: number | null;
  onCategorySelect: (categoryId: number | null) => void;
}

const CategoryMenu = ({ selectedCategory, onCategorySelect }: CategoryMenuProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await catalogApi.getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleCategoryClick = (categoryId: number | null) => {
    onCategorySelect(categoryId);
    setIsOpen(false);
  };

  const selectedCategoryName = selectedCategory 
    ? categories.find(c => c.id === selectedCategory)?.name 
    : 'Todas las categorías';

  if (isLoading) {
    return (
      <div className="relative">
        <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-500">
          Cargando categorías...
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span>{selectedCategoryName}</span>
        <svg 
          className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          <ul className="py-1">
            <li>
              <button
                onClick={() => handleCategoryClick(null)}
                className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                  selectedCategory === null ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                }`}
              >
                Todas las categorías
              </button>
            </li>
            {categories.map((category) => (
              <li key={category.id}>
                <button
                  onClick={() => handleCategoryClick(category.id)}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                    selectedCategory === category.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                  }`}
                >
                  {category.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CategoryMenu;
