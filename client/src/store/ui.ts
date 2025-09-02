import { create } from 'zustand';

interface UIStore {
  selectedCategory: number | null;
  searchTerm: string;
  sortBy: string;
  setSelectedCategory: (categoryId: number | null) => void;
  setSearchTerm: (term: string) => void;
  setSortBy: (sort: string) => void;
  resetFilters: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  selectedCategory: null,
  searchTerm: '',
  sortBy: '',
  
  setSelectedCategory: (categoryId) => set({ selectedCategory: categoryId }),
  setSearchTerm: (term) => set({ searchTerm: term }),
  setSortBy: (sort) => set({ sortBy: sort }),
  resetFilters: () => set({ selectedCategory: null, searchTerm: '', sortBy: '' })
}));
