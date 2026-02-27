import { Category } from '../types/catalog';
import { getImageUrl } from '../utils/imageUrl';

interface CategoryCardProps {
  category: Category;
  onClick: (categoryId: number) => void;
}

const CategoryCard = ({ category, onClick }: CategoryCardProps) => {
  return (
    <button
      onClick={() => onClick(category.id)}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group text-left w-full"
    >
      <div className="aspect-square overflow-hidden relative">
        {category.imageUrl ? (
          <img
            src={getImageUrl(category.imageUrl)}
            alt={category.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
            <svg
              className="w-16 h-16 text-primary-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
        )}
      </div>
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
          {category.name}
        </h3>
      </div>
    </button>
  );
};

export default CategoryCard;
