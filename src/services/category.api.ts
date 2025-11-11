// src/services/category.api.ts
import { api } from './api';

export interface Category {
  id: number;
  name: string;
  // Tu backend también maneja subcategorías, las añadimos
  subcategories?: Subcategory[]; 
}

export interface Subcategory {
  id: number;
  category_id: number;
  name: string;
}

/**
 * Obtiene todas las categorías y subcategorías de la organización.
 * Asume que la ruta es GET /api/categories
 */
export const getCategories = (): Promise<Category[]> => {
  // Ajusta esta ruta si es diferente en tu backend
  return api.get('/api/categories'); 
};