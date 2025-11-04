// src/services/priceList.api.ts
import { api } from './api';

// Interfaz simple para la lista de precios
export interface PriceList {
  id: number;
  name: string;
}

/**
 * Obtiene todas las listas de precios de la organización.
 * Asume que la ruta es GET /api/pricelists
 */
export const getPriceLists = (): Promise<PriceList[]> => {
  // Ajusta esta ruta si es diferente en tu backend (ej: /api/price-lists)
  return api.get('/api/pricelists');
};