// src/services/stock.api.ts
import { api } from './api';

// --- INTERFACES BASADAS EN EL BACKEND ---

export interface StockOverview {
  lowStock: number;
  inventoryValue: number;
  noMovement: number;
  noMovementDays: number;
}

export interface StockMovement {
  id: number;
  type: 'ENTRY' | 'SALE' | 'ADJUSTMENT' | 'TRANSFER_OUT' | 'TRANSFER_IN' | 'INVENTORY';
  branchId: number;
  refCode: string;
  note: string;
  createdAt: string;
  branchName: string;
  userName: string;
  variantId: number;
  variantName: string;
  productId: number;
  productName: string;
  productSku: string;
  quantity: number;
}

export interface MovementListResponse {
  items: StockMovement[];
  total: number;
  limit: number;
  offset: number;
}

export interface MovementCreatePayload {
  type: 'ENTRY' | 'SALE' | 'ADJUSTMENT';
  variantId: number;
  quantity: number;
  branchId: number;
  refCode?: string;
  note?: string;
}

export interface StockTransfer {
  ref: string;
  status: 'IN_TRANSIT' | 'RECEIVED';
  outId: number;
  inId: number | null;
  originName: string;
  destName: string | null;
  items: number;
  lastDate: string;
}

export interface TransferCreatePayload {
  originBranchId: number;
  destBranchId: number;
  transferRef?: string;
  note?: string;
  items: {
    variant_id: number;
    quantity: number;
  }[];
}

export interface InventorySession {
  id: number;
  branchId: number;
  branchName: string;
  status: 'OPEN' | 'APPROVED' | 'CANCELLED';
  onlyDifferences: boolean;
  createdAt: string;
}

export interface InventorySessionItem {
  id: number;
  variantId: number;
  expectedQty: number;
  countedQty: number;
  difference: number;
  productName: string;
  productSku: string;
  variantName: string;
}

export interface InventorySessionDetail extends InventorySession {
  items: InventorySessionItem[];
}

export interface InventoryCountPayload {
  variantId: number;
  countedQty: number;
}

export interface ProductStockSearchItem {
  productId: number;
  productName: string;
  productSku: string;
  variantId: number;
  variantName: string;
  variantSku: string;
  qty: number;
}

// --- FUNCIONES DE API ---

/**
 * GET /api/stock/overview
 * Obtiene las métricas rápidas de stock.
 */
export const getStockOverview = (branchId?: number, noMovementDays: number = 90): Promise<StockOverview> => {
  const params = new URLSearchParams();
  if (branchId) params.append('branchId', String(branchId));
  params.append('noMovementDays', String(noMovementDays));
  return api.get(`/api/stock/overview?${params.toString()}`);
};

/**
 * GET /api/stock/movements
 * Lista los movimientos de stock con filtros y paginación.
 */
export const listMovements = (filters: {
  from?: string;
  to?: string;
  type?: string;
  branchId?: number;
  q?: string;
  limit?: number;
  offset?: number;
}): Promise<MovementListResponse> => {
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
 * POST /api/stock/movements
 * Crea un movimiento simple (Entrada/Ajuste).
 */
export const createMovement = (payload: MovementCreatePayload): Promise<{ id: number }> => {
  return api.post('/api/stock/movements', payload);
};

/**
 * GET /api/stock/transfers
 * Lista las transferencias.
 */
export const listTransfers = (branchId?: number): Promise<{ items: StockTransfer[] }> => {
  const params = new URLSearchParams();
  if (branchId) params.append('branchId', String(branchId));
  return api.get(`/api/stock/transfers?${params.toString()}`);
};

/**
 * POST /api/stock/transfers
 * Crea una nueva transferencia (genera el TRANSFER_OUT).
 */
export const createTransfer = (payload: TransferCreatePayload): Promise<{ transfer_ref: string, out_id: number, destBranchId: number }> => {
  return api.post('/api/stock/transfers', payload);
};

/**
 * POST /api/stock/transfers/:ref/receive
 * Recibe una transferencia pendiente (genera el TRANSFER_IN).
 */
export const receiveTransfer = (transferRef: string, destBranchId: number): Promise<{ in_id: number }> => {
  return api.post(`/api/stock/transfers/${transferRef}/receive`, { branchId: destBranchId });
};

/**
 * GET /api/stock/inventory/sessions
 * Lista las sesiones de inventario.
 */
export const listInventorySessions = (filters: {
  branchId?: number;
  status?: 'OPEN' | 'APPROVED' | 'CANCELLED';
}): Promise<{ items: InventorySession[] }> => {
  const params = new URLSearchParams();
  if (filters.branchId) params.append('branchId', String(filters.branchId));
  if (filters.status) params.append('status', filters.status);
  return api.get(`/api/stock/inventory/sessions?${params.toString()}`);
};

/**
 * POST /api/stock/inventory/sessions
 * Crea una nueva sesión de inventario.
 */
export const createInventorySession = (branchId: number, onlyDifferences: boolean): Promise<{ id: number }> => {
  return api.post('/api/stock/inventory/sessions', { branchId, onlyDifferences });
};

/**
 * GET /api/stock/inventory/sessions/:id
 * Obtiene el detalle de una sesión de inventario.
 */
export const getInventorySession = (sessionId: number): Promise<InventorySessionDetail> => {
  return api.get(`/api/stock/inventory/sessions/${sessionId}`);
};

/**
 * POST /api/stock/inventory/sessions/:id/count
 * Registra el conteo de un ítem.
 */
export const countInventoryItem = (sessionId: number, payload: InventoryCountPayload): Promise<{ ok: boolean }> => {
  return api.post(`/api/stock/inventory/sessions/${sessionId}/count`, payload);
};

/**
 * POST /api/stock/inventory/sessions/:id/approve
 * Aprueba una sesión y aplica los ajustes de stock.
 */
export const approveInventorySession = (sessionId: number): Promise<{ ok: boolean, movementId: number | null }> => {
  return api.post(`/api/stock/inventory/sessions/${sessionId}/approve`, {});
};

/**
 * POST /api/stock/inventory/sessions/:id/cancel
 * Cancela una sesión de inventario.
 */
export const cancelInventorySession = (sessionId: number): Promise<{ ok: boolean }> => {
  return api.post(`/api/stock/inventory/sessions/${sessionId}/cancel`, {});
};

/**
 * GET /api/stock/products
 * Busca productos/variantes para agregar a movimientos o transferencias.
 */
export const searchProductsForStock = (q: string, branchId?: number): Promise<{ items: ProductStockSearchItem[] }> => {
  const params = new URLSearchParams();
  params.append('q', q);
  if (branchId) params.append('branchId', String(branchId));
  return api.get(`/api/stock/products?${params.toString()}`);
};