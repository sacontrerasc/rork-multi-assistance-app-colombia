/**
 * Payments API — Cliente para crear links de pago.
 * Consume el endpoint POST /ClientAPI/CrearLinkDePago
 */

const HTTPS = (process.env.EXPO_PUBLIC_PAYMENTS_HTTPS ?? 'https').replace(':', '');
const HOST = process.env.EXPO_PUBLIC_PAYMENTS_HOST ?? '';
const PORT = process.env.EXPO_PUBLIC_PAYMENTS_PORT ?? '';
const API_KEY = process.env.EXPO_PUBLIC_PAYMENTS_API_KEY ?? '';
const TERMINAL_ID = Number(process.env.EXPO_PUBLIC_PAYMENTS_TERMINAL_ID ?? '0');
const FORM_ID = Number(process.env.EXPO_PUBLIC_PAYMENTS_FORM_ID ?? '0');

function buildBaseUrl(): string {
  if (!HOST) return '';
  const portPart = PORT ? `:${PORT}` : '';
  return `${HTTPS}://${HOST}${portPart}`;
}

export type PaymentService = 1 | 2 | 4; // 1 CARD, 2 PSE, 4 CASH

export interface CreatePaymentLinkInput {
  amount: number;
  description: string;
  currency?: string;
  expirationDate?: string; // YYYY/MM/DD or YYYY-MM-DD
  services?: PaymentService[];
  idPerson?: number;
  terminalId?: number;
  formId?: number;
}

export interface PaymentLinkResponse {
  status: number;
  message?: string;
  item?: {
    url?: string;
    link?: string;
    paymentUrl?: string;
    id?: string | number;
    [k: string]: unknown;
  } | null;
  errors?: { item: string; previusValue?: string; message: string }[];
}

function defaultExpirationDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}/${mm}/${dd}`;
}

/**
 * Crea un link de pago en la pasarela de Payments y devuelve la respuesta.
 * El link visible para el usuario se intenta extraer de `item.url` / `item.link` / `item.paymentUrl`.
 */
export async function createPaymentLink(
  input: CreatePaymentLinkInput
): Promise<PaymentLinkResponse> {
  const baseUrl = buildBaseUrl();
  if (!baseUrl || !API_KEY) {
    throw new Error('La pasarela de pagos no está configurada.');
  }

  const body = {
    amount: input.amount,
    descripcion: input.description,
    currency: input.currency ?? 'COP',
    terminal_id: input.terminalId ?? TERMINAL_ID,
    id_form: input.formId ?? FORM_ID,
    fecha_vencimiento: input.expirationDate ?? defaultExpirationDate(),
    status: true,
    services: input.services ?? [1],
    idperson: input.idPerson ?? 0,
  };

  const res = await fetch(`${baseUrl}/ClientAPI/CrearLinkDePago`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: API_KEY,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let json: PaymentLinkResponse;
  try {
    json = JSON.parse(text) as PaymentLinkResponse;
  } catch {
    throw new Error(`Respuesta inválida de la pasarela (${res.status})`);
  }

  if (!res.ok || (json.status && json.status >= 400)) {
    const msg =
      json.errors?.map(e => `${e.item}: ${e.message}`).join('\n') ??
      json.message ??
      `Error ${res.status}`;
    throw new Error(msg);
  }

  return json;
}

/**
 * Intenta extraer la URL del link de pago desde la respuesta de la API.
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

export const PaymentsConfig = {
  isConfigured: (): boolean => Boolean(HOST) && Boolean(API_KEY),
};
