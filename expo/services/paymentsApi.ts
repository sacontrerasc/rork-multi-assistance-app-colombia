/**
 * Compatibilidad hacia atrás — re-exporta el servicio modular Payments.
 * Preferir importar desde `@/services/payments`.
 */
export {
  createPaymentLink,
  extractPaymentUrl,
  PaymentsService,
} from '@/services/payments/paymentsService';
export { PaymentsConfig, getPaymentsBaseUrl } from '@/services/payments/config';
export { PaymentsApiError } from '@/services/payments/httpClient';
export type {
  CreatePaymentLinkInput,
  PaymentLinkResponse,
  PaymentServiceId as PaymentService,
} from '@/types/payments';
