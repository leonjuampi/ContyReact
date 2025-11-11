// src/services/product.api.ts
import { api } from './api';

// --- INTERFACES BASADAS EN TU SWAGGER/BACKEND ---

// Lo que devuelve la lista GET /api/products
export interface Product {
  id: number;
  org_id: number;
  category_id: number;
  subcategory_id?: number;
  sku: string;
  name: string;
  description?: string;
  price: number;
  cost: number;
  vat_percent: number;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  category_name: string;
  subcategory_name?: string;
  
  // Estos campos los añadimos desde el frontend, pero la API principal no los devuelve en la lista
  // Los usaremos para el mapeo
  image?: string; 
  stock?: number; // El stock real viene por otro lado
  lowStock?: boolean;
}

// Lo que devuelve GET /api/products/{id}
export interface ProductDetail extends Product {
  variants: Variant[];
  stock: VariantStock[];
}

export interface Variant {
  id: number;
  product_id: number;
  name?: string;
  sku: string;
  barcode?: string;
  price?: number;
  cost?: number;
}

export interface VariantStock {
  variant_id: number;
  qty: number;
  min_qty?: number;
  max_qty?: number;
}

// Lo que espera la lista GET /api/products
export interface ProductListFilters {
  search?: string;
  categoryId?: number;
  subcategoryId?: number;
  status?: 'ACTIVE' | 'INACTIVE';
  stockLow?: boolean;
  branchId?: number; // Tu backend lo toma del token, pero permite override
  page?: number;
  pageSize?: number;
}

// Lo que devuelve la lista GET /api/products
export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
}

// Lo que espera POST /api/products
export interface ProductCreatePayload {
  name: string;
  sku: string;
  categoryId: number;
  subcategoryId?: number;
  price: number;
  cost: number;
  description?: string;
  vat_percent?: number;
  status?: 'ACTIVE' | 'INACTIVE';
}

// Lo que espera PUT /api/products/{id}
export type ProductUpdatePayload = Partial<ProductCreatePayload>;


// --- DEFINICIÓN DE ENDPOINTS ---

// GET /api/products
export const getProducts = (filters: ProductListFilters): Promise<ProductListResponse> => {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.categoryId) params.append('categoryId', String(filters.categoryId));
  if (filters.subcategoryId) params.append('subcategoryId', String(filters.subcategoryId));
  if (filters.status) params.append('status', filters.status);
  if (filters.stockLow) params.append('stockLow', 'true');
  if (filters.branchId) params.append('branchId', String(filters.branchId));
  if (filters.page) params.append('page', String(filters.page));
  if (filters.pageSize) params.append('pageSize', String(filters.pageSize));
  
  return api.get(`/api/products?${params.toString()}`);
};

// GET /api/products/{id}
export const getProductById = (id: number): Promise<ProductDetail> => {
  return api.get(`/api/products/${id}`);
};

// POST /api/products
export const createProduct = (data: ProductCreatePayload): Promise<{ id: number }> => {
  return api.post('/api/products', data);
};

// PUT /api/products/{id}
export const updateProduct = (id: number, data: ProductUpdatePayload): Promise<{ message: string }> => {
  return api.put(`/api/products/${id}`, data);
};

// DELETE /api/products/{id}
export const deleteProduct = (id: number): Promise<void> => {
  return api.delete(`/api/products/${id}`);
};

// GET /api/products/template.csv
export const downloadProductTemplate = async () => {
  const blob = await api.getBlob('/api/products/template.csv');
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'products_variants_template.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

// POST /api/products/import
export const importProductsCSV = (file: File): Promise<{ successCount: number; errorCount: number; errors: any[] }> => {
  const formData = new FormData();
  formData.append('file', file);
  
  return api.post('/api/products/import', formData, { 'Content-Type': null }); 
};