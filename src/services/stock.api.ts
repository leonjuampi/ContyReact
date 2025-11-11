// src/services/stock.api.ts
import { api } from './api';

// --- INTERFACES BASADAS EN TUS RUTAS (stock.routes.js y stock.controller.js) ---

// Para: GET /api/stock/overview
export interface StockOverview {
  lowStock: number;
  inventoryValue: number;
  noMovement: number;
  noMovementDays: number;
}

// Para: GET /api/stock/movements
export interface StockMovement {
  id: number;
  type: 'ENTRY' | 'SALE' | 'ADJUSTMENT' | 'TRANSFER_OUT' | 'TRANSFER_IN' | 'INVENTORY';
  branchId: number;
  refCode: string | null;
  note: string | null;
  createdAt: string;
  branchName: string;
  userName: string | null;
  variantId: number;
  variantName: string | null;
  productId: number;
  productName: string;
  productSku: string;
  quantity: number; // Será negativo para salidas/ventas
}

// Para: GET /api/stock/transfers
export interface StockTransfer {
  ref: string;
  status: 'RECEIVED' | 'IN_TRANSIT';
  outId: number;
  inId: number | null;
  originName: string | null;
  destName: string | null;
  items: number;
  lastDate: string;
}

// Interfaz para los filtros de GET /api/stock/movements
export interface MovementFilters {
  from?: string;
  to?: string;
  type?: 'ENTRY' | 'SALE' | 'ADJUSTMENT' | 'TRANSFER_OUT' | 'TRANSFER_IN' | 'INVENTORY';
  branchId?: number;
  q?: string; // Búsqueda por producto/SKU
  limit?: number;
  offset?: number;
}

// --- FUNCIONES DE API ---

/**
 * GET /api/stock/overview
 * Obtiene los KPIs (Stock Bajo, Valor, Sin Movimiento)
 */
export const getStockOverview = (branchId?: number): Promise<StockOverview> => {
  const params = new URLSearchParams();
  if (branchId) {
    params.append('branchId', String(branchId));
  }
  return api.get(`/api/stock/overview?${params.toString()}`);
};

/**
 * GET /api/stock/movements
 * Lista todos los movimientos de stock con filtros
 */
export const getStockMovements = (filters: MovementFilters): Promise<{ items: StockMovement[], total: number }> => {
  const params = new URLSearchParams();
  if (filters.from) params.append('from', filters.from);
  if (filters.to) params.append('to', filters.to);
  if (filters.type) params.append('type', filters.type);
  if (filters.branchId) params.append('branchId', String(filters.branchId));
  if (filters.q) params.append('q', filters.q);
  if (filters.limit) params.append('limit', String(filters.limit));
  if (filters.offset) params.append('offset', String(filters.offset));
  
  return api.get(`/api/stock/movements?${params.toString()}`);
};

/**
 * GET /api/stock/transfers
 * Lista todas las transferencias
 */
export const getStockTransfers = (branchId?: number): Promise<{ items: StockTransfer[] }> => {
    const params = new URLSearchParams();
    if (branchId) {
      params.append('branchId', String(branchId));
    }
    return api.get(`/api/stock/transfers?${params.toString()}`);
};

/**
 * GET /api/stock/products
 * Busca productos con su stock para modales (como el de transferencias)
 */
export const searchStockProducts = (q: string, branchId?: number): Promise<{ items: any[] }> => {
    const params = new URLSearchParams();
    params.append('q', q);
    if (branchId) {
      params.append('branchId', String(branchId));
    }
    return api.get(`/api/stock/products?${params.toString()}`);
};

// ... Aquí puedes añadir las funciones para POST (crear movimiento, crear transferencia), etc.
// --- (Añadir al final de src/services/stock.api.ts) ---

// Para: POST /api/stock/transfers
export interface TransferItemPayload {
  variant_id: number; // Asegúrate que coincida con el backend
  quantity: number;
}

export interface CreateTransferPayload {
  originBranchId: number;
  destBranchId: number;
  items: TransferItemPayload[];
  transferRef?: string;
  note?: string;
}

/**
 * POST /api/stock/transfers
 * Crea una nueva transferencia (modo 1-paso, crea OUT e IN)
 * Tu backend (stock.routes.js) usa /api/stock/transfers y llama a createTransfer (que usa createTransferOUT)
 */
export const createTransfer = (payload: CreateTransferPayload): Promise<any> => {
  return api.post('/api/stock/transfers', payload);
};

/**
 * POST /api/stock/transfers/{ref}/receive
 * Recibe una transferencia pendiente (crea el IN)
 */
export const receiveTransfer = (ref: string, destBranchId: number): Promise<any> => {
  // El backend espera el branchId en el body
  return api.post(`/api/stock/transfers/${ref}/receive`, { branchId: destBranchId });
};

// --- (Añadir al final de src/services/stock.api.ts) ---

// Para: GET /api/stock/inventory
export interface InventorySession {
  id: number;
  status: 'DRAFT' | 'COMPLETED';
  ref: string | null;
  note: string | null;
  createdAt: string;
  completedAt: string | null;
  branchName: string;
  userName: string;
  itemsCount: number; // El backend lo devuelve como string, pero lo casteamos
}

// Para: POST /api/stock/inventory
export interface CreateInventoryPayload {
  branchId: number;
  note?: string;
  ref?: string;
  // 'items' se añade en el backend (all products from branch)
}

// Para: GET /api/stock/inventory/:id
export interface InventoryItemDetail {
  id: number; // inventory_item_id
  variantId: number;
  productName: string;
  variantName: string | null;
  productSku: string;
  variantSku: string | null;
  expected: number;
  counted: number | null; // Null si aún no se contó
  diff: number | null; // Null si aún no se contó
}

export interface InventorySessionDetails {
  id: number;
  status: 'DRAFT' | 'COMPLETED';
  ref: string | null;
  note: string | null;
  createdAt: string;
  branchName: string;
  userName: string;
  items: InventoryItemDetail[];
}

/**
 * GET /api/stock/inventory
 * Lista todas las sesiones de inventario
 */
export const getInventorySessions = (branchId?: number): Promise<{ items: InventorySession[] }> => {
  const params = new URLSearchParams();
  if (branchId) {
    params.append('branchId', String(branchId));
  }
  return api.get(`/api/stock/inventory/sessions?${params.toString()}`);
};

/**
 * POST /api/stock/inventory
 * Crea una nueva sesión de inventario (en DRAFT)
 */
export const createInventorySession = (payload: CreateInventoryPayload): Promise<InventorySession> => {
  return api.post('/api/stock/inventory/sessions', payload);
};

/**
 * GET /api/stock/inventory/:id
 * Obtiene el detalle de una sesión (con los items)
 */
export const getInventorySessionDetails = (sessionId: number): Promise<InventorySessionDetails> => {
  return api.get(`/api/stock/inventory/sessions/${sessionId}`);
};

/**
 * POST /api/stock/inventory/:id/count
 * (Este endpoint es para el CONTEO item por item, que es un flujo más complejo)
 * (Por ahora nos enfocaremos en Finalizar/Completar)
 */

/**
 * POST /api/stock/inventory/:id/commit
 * Finaliza una sesión de inventario y ajusta el stock.
 */
export const commitInventorySession = (sessionId: number): Promise<{ message: string }> => {
  return api.post(`/api/stock/inventory/sessions/${sessionId}/commit`, {});
};