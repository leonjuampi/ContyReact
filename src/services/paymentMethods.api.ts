// src/services/paymentMethods.api.ts
import { api } from './api';

// Interfaz basada en tu backend (routes/payment_methods.routes.js)
export interface PaymentMethod {
  id: number;
  name: string;
  kind: 'CASH' | 'DEBIT' | 'CREDIT' | 'TRANSFER' | 'MIXED';
  max_installments: number;
  surcharge_pct: number;
  discount_pct: number;
  ticket_note: string | null;
  active: boolean;
}

/**
 * GET /api/payment-methods
 * Obtiene todos los medios de pago activos de la organización
 */
export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const response = await api.get('/api/payment-methods');
  // Asumimos que la respuesta es { items: [...] } como en otras rutas
  return response.items || [];
};