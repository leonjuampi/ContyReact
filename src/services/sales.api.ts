// src/services/sales.api.ts
import { api } from './api';

// --- INTERFACES DE PAYLOAD (lo que enviamos) ---

export interface SaleItemPayload {
  variant_id: number;
  quantity: number;
  price: number; // Precio unitario de venta
  discount?: number; // Opcional
}

export interface SalePaymentPayload {
  method_id: number; // ID del método de pago (ej: 1=Efectivo, 2=Tarjeta)
  amount: number;
  note?: string; // Ej: "Visa terminada en 1234"
}

export interface CreateSalePayload {
  customerId: number;
  branchId: number;
  items: SaleItemPayload[];
  payments: SalePaymentPayload[];
  invoiceType?: string; // 'A', 'B', 'C'
  note?: string;
}

// --- INTERFACES DE RESPUESTA (lo que recibimos) ---

export interface Sale {
  id: number;
  invoiceNumber: string;
  status: 'COMPLETED' | 'CANCELLED';
  total: number;
  createdAt: string;
  customerName: string;
  customerDoc: string;
  branchName: string;
  userName: string;
  // ... (más detalles si los necesitamos)
}

// --- FUNCIONES DE API ---

/**
 * POST /api/sales
 * Crea una nueva venta (es transaccional)
 */
export const createSale = (payload: CreateSalePayload): Promise<Sale> => {
  return api.post('/api/sales', payload);
};

/**
 * GET /api/sales
 * Lista todas las ventas (para el historial)
 */
export const getSales = (branchId?: number, q?: string): Promise<{ items: Sale[], total: number }> => {
  const params = new URLSearchParams();
  if (branchId) params.append('branchId', String(branchId));
  if (q) params.append('q', q);
  
  return api.get(`/api/sales?${params.toString()}`);
};

/**
 * GET /api/sales/:id
 * Obtiene el detalle de una venta
 */
export const getSaleDetails = (saleId: number): Promise<Sale> => { // Asumimos que la respuesta es más detallada
  return api.get(`/api/sales/${saleId}`);
};

/**
 * PATCH /api/sales/:id/status
 * Cancela (anula) una venta
 */
export const cancelSale = (saleId: number): Promise<{ message: string }> => {
  return api.patch(`/api/sales/${saleId}/status`, { status: 'CANCELLED' });
};