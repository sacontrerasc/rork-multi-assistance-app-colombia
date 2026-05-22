/**
 * Tipados para la integración de la pasarela Payments.
 */

export type PaymentServiceId = 1 | 2 | 4; // 1 CARD, 2 PSE, 4 CASH

export type PaymentCurrency = 'COP' | 'USD';

export interface CreatePaymentLinkInput {
  amount: number;
  description: string;
  currency?: PaymentCurrency;
  expirationDate?: string; // YYYY/MM/DD o YYYY-MM-DD
  services?: PaymentServiceId[];
  idPerson?: number;
  terminalId?: number;
  formId?: number;
}

export interface PaymentLinkItem {
  url?: string;
  link?: string;
  paymentUrl?: string;
  id?: string | number;
  order_id?: string | number;
  reference?: string;
  [key: string]: unknown;
}

export interface PaymentApiError {
  item: string;
  previusValue?: string;
  message: string;
}

export interface PaymentApiResponse<T = PaymentLinkItem> {
  status: number;
  message?: string;
  item?: T | null;
  errors?: PaymentApiError[];
}

export type PaymentLinkResponse = PaymentApiResponse<PaymentLinkItem>;

/* ---------- 3DS ---------- */

export interface CreateTransactionInput {
  amount: number;
  currency?: PaymentCurrency;
  description: string;
  reference: string;
  idPerson?: number;
  terminalId?: number;
  formId?: number;
  card: {
    number: string;
    expMonth: string; // MM
    expYear: string; // YY o YYYY
    cvv: string;
    holder: string;
  };
  customer: {
    email: string;
    name?: string;
    phone?: string;
    documentType?: string;
    document?: string;
  };
}

export interface TransactionItem {
  id?: string | number;
  transaction_id?: string | number;
  status?: string;
  state?: string;
  reference?: string;
  authorization?: string;
  message?: string;
  [key: string]: unknown;
}

export type TransactionResponse = PaymentApiResponse<TransactionItem>;

export interface Authenticate3DSInput {
  transactionId: string | number;
  returnUrl: string;
}

export interface Authenticate3DSItem {
  redirect_url?: string;
  redirectUrl?: string;
  url?: string;
  challenge?: string;
  status?: string;
  [key: string]: unknown;
}

export type Authenticate3DSResponse = PaymentApiResponse<Authenticate3DSItem>;

export interface ContinueAuthenticateInput {
  transactionId: string | number;
  cres?: string;
  paRes?: string;
  md?: string;
}

export interface VerifyAuthenticateInput {
  transactionId: string | number;
}

export interface VerifyAuthenticateItem {
  status: string;
  authenticated: boolean;
  authorization?: string;
  message?: string;
  [key: string]: unknown;
}

export type VerifyAuthenticateResponse = PaymentApiResponse<VerifyAuthenticateItem>;

/* ---------- Estado de pago de alto nivel ---------- */

export type PaymentStatus =
  | 'pending'
  | 'authorized'
  | 'paid'
  | 'failed'
  | 'cancelled'
  | 'expired';

export interface PaymentResult {
  orderId: string;
  amount: number;
  currency: PaymentCurrency;
  status: PaymentStatus;
  paymentUrl?: string | null;
  transactionId?: string | number | null;
  customerEmail?: string | null;
  createdAt: string; // ISO
  raw?: unknown;
}
