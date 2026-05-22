/**
 * Tipados para la integración con Zoho Flow.
 */
import type { PaymentStatus } from '@/types/payments';

export interface ZohoFlowPaymentEvent {
  event: 'payment.created' | 'payment.updated' | 'payment.completed' | 'payment.failed';
  order_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  date: string; // ISO
  email: string;
  customer_name?: string;
  description?: string;
  payment_url?: string;
  transaction_id?: string | number;
  source: 'cltiene-app';
}

export interface ZohoFlowResponse {
  ok: boolean;
  status: number;
  message?: string;
}
