import api from './http';
import { Category, CreateCategoryData, UpdateCategoryData } from '../types/categories';

export const categoriesApi = {
  // Obtener todas las categorías
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  },

  // Obtener categoría específica
  getCategory: async (id: number): Promise<Category> => {
    const response = await api.get<Category>(`/categories/${id}`);
    return response.data;
  },

  // Crear nueva categoría
  createCategory: async (data: CreateCategoryData): Promise<Category> => {
    const response = await api.post<Category>('/categories', data);
    return response.data;
  },

  // Actualizar categoría existente
  updateCategory: async (id: number, data: UpdateCategoryData): Promise<Category> => {
    const response = await api.put<Category>(`/categories/${id}`, data);
    return response.data;
  },

  // Eliminar categoría
  deleteCategory: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
  }
};
