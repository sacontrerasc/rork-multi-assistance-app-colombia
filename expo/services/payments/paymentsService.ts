/**
 * Servicio de Payments — Link de pago + transacciones 3DS.
 */
import { paymentsRequest } from './httpClient';
import { PaymentsConfig } from './config';
import type {
  Authenticate3DSInput,
  Authenticate3DSResponse,
  ContinueAuthenticateInput,
  CreatePaymentLinkInput,
  CreateTransactionInput,
  PaymentLinkResponse,
  PaymentLinkItem,
  TransactionResponse,
  VerifyAuthenticateInput,
  VerifyAuthenticateResponse,
} from '@/types/payments';
import { createLogger } from '@/utils/logger';

const log = createLogger('payments');

function defaultExpirationDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}/${m}/${dd}`;
}

function validateAmount(amount: number): void {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('El monto debe ser mayor que cero.');
  }
}

/**
 * Crea un link de pago.
 * POST /ClientAPI/CrearLinkDePago
 */
export async function createPaymentLink(
  input: CreatePaymentLinkInput
): Promise<PaymentLinkResponse> {
  validateAmount(input.amount);
  if (!input.description?.trim()) {
    throw new Error('La descripción es obligatoria.');
  }

  const body = {
    amount: input.amount,
    descripcion: input.description,
    currency: input.currency ?? 'COP',
    terminal_id: input.terminalId ?? PaymentsConfig.terminalId,
    id_form: input.formId ?? PaymentsConfig.formId,
    fecha_vencimiento: input.expirationDate ?? defaultExpirationDate(),
    status: true,
    services: input.services ?? [1],
    idperson: input.idPerson ?? 0,
  };

  log.info('createPaymentLink', { amount: body.amount, currency: body.currency });
  return paymentsRequest<PaymentLinkItem>({
    path: '/ClientAPI/CrearLinkDePago',
    method: 'POST',
    body,
  });
}

/**
 * Extrae la URL utilizable del link de pago.
 */
export function extractPaymentUrl(resp: PaymentLinkResponse): string | null {
  const item = resp.item;
  if (!item) return null;
  const candidates = [item.url, item.link, item.paymentUrl];
  for (const c of candidates) {
    if (typeof c === 'string' && c.startsWith('http')) return c;
  }
  for (const v of Object.values(item)) {
    if (typeof v === 'string' && v.startsWith('http')) return v;
  }
  return null;
}

/**
 * Crea una transacción (paso 1 del flujo 3DS).
 * POST /ClientAPI/CrearTransaccion
 */
export async function createTransaction(
  input: CreateTransactionInput
): Promise<TransactionResponse> {
  validateAmount(input.amount);
  if (!input.customer.email) {
    throw new Error('El email del cliente es obligatorio.');
  }

  const body = {
    amount: input.amount,
    currency: input.currency ?? 'COP',
    descripcion: input.description,
    reference: input.reference,
    terminal_id: input.terminalId ?? PaymentsConfig.terminalId,
    id_form: input.formId ?? PaymentsConfig.formId,
    idperson: input.idPerson ?? 0,
    card: {
      number: input.card.number.replace(/\s+/g, ''),
      exp_month: input.card.expMonth,
      exp_year: input.card.expYear,
      cvv: input.card.cvv,
      holder: input.card.holder,
    },
    customer: {
      email: input.customer.email,
      name: input.customer.name ?? '',
      phone: input.customer.phone ?? '',
      document_type: input.customer.documentType ?? '',
      document: input.customer.document ?? '',
    },
  };

  log.info('createTransaction', { reference: input.reference, amount: input.amount });
  return paymentsRequest({
    path: '/ClientAPI/CrearTransaccion',
    method: 'POST',
    body,
  });
}

/**
 * Inicia la autenticación 3DS.
 * POST /ClientAPI/Authenticate3DS
 */
export async function authenticate3DS(
  input: Authenticate3DSInput
): Promise<Authenticate3DSResponse> {
  log.info('authenticate3DS', { transactionId: input.transactionId });
  return paymentsRequest({
    path: '/ClientAPI/Authenticate3DS',
    method: 'POST',
    body: {
      transaction_id: input.transactionId,
      return_url: input.returnUrl,
    },
  });
}

/**
 * Continúa la autenticación 3DS después del challenge.
 * POST /ClientAPI/ContinueAuthenticate
 */
export async function continueAuthenticate(
  input: ContinueAuthenticateInput
): Promise<Authenticate3DSResponse> {
  log.info('continueAuthenticate', { transactionId: input.transactionId });
  return paymentsRequest({
    path: '/ClientAPI/ContinueAuthenticate',
    method: 'POST',
    body: {
      transaction_id: input.transactionId,
      cres: input.cres,
      pares: input.paRes,
      md: input.md,
    },
  });
}

/**
 * Verifica el resultado de la autenticación 3DS.
 * POST /ClientAPI/VerifyAuthenticate
 */
export async function verifyAuthenticate(
  input: VerifyAuthenticateInput
): Promise<VerifyAuthenticateResponse> {
  log.info('verifyAuthenticate', { transactionId: input.transactionId });
  return paymentsRequest({
    path: '/ClientAPI/VerifyAuthenticate',
    method: 'POST',
    body: { transaction_id: input.transactionId },
  });
}

export const PaymentsService = {
  createPaymentLink,
  extractPaymentUrl,
  createTransaction,
  authenticate3DS,
  continueAuthenticate,
  verifyAuthenticate,
};
