import api from './http';
import { Category, Product, Paged } from '../types/catalog';

export const catalogApi = {
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return response.data;
  },

  getProducts: async (params: {
    categoryId?: number;
    search?: string;
    page?: number;
    pageSize?: number;
    sort?: string;
  } = {}): Promise<Paged<Product>> => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  getProduct: async (id: number): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  createProduct: async (product: {
    name: string;
    description?: string;
    imageUrl?: string;
    stock: number;
    price: number;
    categoryId: number;
  }): Promise<Product> => {
    const response = await api.post('/products', product);
    return response.data;
  },

  updateProduct: async (id: number, product: {
    name?: string;
    description?: string;
    imageUrl?: string;
    stock?: number;
    price?: number;
    categoryId?: number;
    hasQuantityDiscount?: boolean;
    minQuantityForDiscount?: number;
    discountedPrice?: number;
    discountStartDate?: string;
    discountEndDate?: string;
  }): Promise<Product> => {
    const response = await api.put(`/products/${id}`, product);
    return response.data;
  },

  deleteProduct: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  }
};
