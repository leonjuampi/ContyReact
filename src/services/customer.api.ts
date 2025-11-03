// src/services/customer.api.ts
import { api } from './api';

// Interfaz que coincide con tu API (Swagger/service)
export interface Customer {
  id: number;
  name: string;
  taxId: string;
  email: string;
  phone: string;
  address: string;
  taxCondition: 'RI' | 'MT' | 'CF' | 'EX';
  priceListId: number;
  priceListName?: string;
  status: 'ACTIVE' | 'BLOCKED';
  notes: string;
  lastPurchaseAt?: string;
  balance?: number;
  tags?: string[];
}

// Lo que devuelve el GET /api/customers
export interface CustomerListResponse {
  items: Customer[];
  total: number;
  page: number;
  pageSize: number;
}

// Lo que enviamos al POST y PUT
export interface CustomerPayload {
  name: string;
  taxId: string; // 'document' en el form
  email?: string;
  phone?: string;
  address?: string;
  taxCondition: 'RI' | 'MT' | 'CF' | 'EX';
  priceListId: number;
  status: 'ACTIVE' | 'BLOCKED';
  notes?: string;
  tags?: string[];
}

// --- Definición de Endpoints ---

// GET /api/customers (con filtros)
export const getCustomers = (filters: {
  search?: string;
  status?: string;
  withDebt?: boolean;
  noPurchasesDays?: number;
  page?: number;
  pageSize?: number;
}): Promise<CustomerListResponse> => {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.status) params.append('status', filters.status);
  if (filters.withDebt) params.append('withDebt', 'true');
  if (filters.noPurchasesDays) params.append('noPurchasesDays', String(filters.noPurchasesDays));
  if (filters.page) params.append('page', String(filters.page));
  if (filters.pageSize) params.append('pageSize', String(filters.pageSize));
  
  return api.get(`/api/customers?${params.toString()}`);
};

// GET /api/customers/{id}
export const getCustomerById = (id: number): Promise<Customer> => {
  return api.get(`/api/customers/${id}`);
};

// POST /api/customers
export const createCustomer = (data: CustomerPayload): Promise<{ id: number }> => {
  return api.post('/api/customers', data);
};

// PUT /api/customers/{id}
export const updateCustomer = (id: number, data: Partial<CustomerPayload>): Promise<{ message: string }> => {
  return api.put(`/api/customers/${id}`, data);
};

// DELETE /api/customers/{id}
export const deleteCustomer = (id: number): Promise<void> => {
  return api.delete(`/api/customers/${id}`);
};

// GET /api/customers/template.csv
export const downloadCustomerTemplate = async () => {
  const blob = await api.getBlob('/api/customers/template.csv');
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'customers_template.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

// POST /api/customers/import
export const importCustomersCSV = (file: File): Promise<{ successCount: number; errorCount: number; errors: any[] }> => {
  const formData = new FormData();
  formData.append('file', file);
  
  // Pasamos 'Content-Type': null para que fetch lo ponga automáticamente
  return api.post('/api/customers/import', formData, { 'Content-Type': null }); 
};