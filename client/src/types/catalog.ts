export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  stock: number;
  reservedStock: number;
  availableStock: number;
  price: number;
  categoryId: number;
  categoryName?: string;
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
  stock: number;
  availableStock: number;
  quantity: number;
}

export interface ProductFilters {
  categoryId?: number;
  search?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
}

// Auth types
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  googlePicture?: string;
  emailConfirmed: boolean;
  role: string;
  shippingPhone?: string;
  shippingAddress?: string;
  shippingCity?: string;
  shippingPostalCode?: string;
  shippingInstructions?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  expiresAt: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface GoogleAuthData {
  idToken: string;
  email: string;
  firstName: string;
  lastName: string;
  picture?: string;
}

// Order types
export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productPrice: number;
  quantity: number;
  subTotal: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  status: string;
  isPaid: boolean;
  subTotal: number;
  taxAmount: number;
  shippingAmount: number;
  totalAmount: number;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  notes?: string;
  createdAt: string;
  items: OrderItem[];
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerShippingInstructions?: string;
}

export interface CreateOrderData {
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  notes?: string;
}

export interface UpdateOrderStatusData {
  status: string;
}
