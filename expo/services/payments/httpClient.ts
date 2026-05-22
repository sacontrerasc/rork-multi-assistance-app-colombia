/**
 * Cliente HTTP centralizado para la pasarela Payments.
 * - Inyecta Authorization y Content-Type.
 * - Parsea errores con la estructura { status, message, errors[] }.
 * - Timeout configurable.
 */
import { PaymentsConfig, getPaymentsBaseUrl } from './config';
import type { PaymentApiResponse } from '@/types/payments';
import { createLogger } from '@/utils/logger';

const log = createLogger('payments-http');

export class PaymentsApiError extends Error {
  status: number;
  errors?: { item: string; message: string }[];
  raw?: unknown;
  constructor(
    message: string,
    status: number,
    errors?: { item: string; message: string }[],
    raw?: unknown
  ) {
    super(message);
    this.name = 'PaymentsApiError';
    this.status = status;
    this.errors = errors;
    this.raw = raw;
  }
}

interface RequestOptions {
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  timeoutMs?: number;
}

export async function paymentsRequest<T = unknown>(
  opts: RequestOptions
): Promise<PaymentApiResponse<T>> {
  const baseUrl = getPaymentsBaseUrl();
  if (!baseUrl || !PaymentsConfig.apiKey) {
    throw new PaymentsApiError('La pasarela de pagos no está configurada.', 0);
  }

  const url = `${baseUrl}${opts.path.startsWith('/') ? '' : '/'}${opts.path}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), opts.timeoutMs ?? 30000);

  log.info(opts.method ?? 'POST', opts.path);

  try {
    const res = await fetch(url, {
      method: opts.method ?? 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: PaymentsConfig.apiKey,
        Accept: 'application/json',
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      signal: controller.signal,
    });

    const text = await res.text();
    let json: PaymentApiResponse<T>;
    try {
      json = text ? (JSON.parse(text) as PaymentApiResponse<T>) : ({ status: res.status } as PaymentApiResponse<T>);
    } catch {
      throw new PaymentsApiError(
        `Respuesta inválida de la pasarela (HTTP ${res.status})`,
        res.status,
        undefined,
        text
      );
    }

    const apiStatus = typeof json.status === 'number' ? json.status : res.status;
    if (!res.ok || apiStatus >= 400) {
      const msg =
        json.errors?.map(e => `${e.item}: ${e.message}`).join('\n') ??
        json.message ??
        `Error ${apiStatus}`;
      log.warn('API error', apiStatus, msg);
      throw new PaymentsApiError(msg, apiStatus, json.errors, json);
    }

    return json;
  } catch (err) {
    if (err instanceof PaymentsApiError) throw err;
    if (err instanceof Error && err.name === 'AbortError') {
      throw new PaymentsApiError('La pasarela tardó demasiado en responder.', 408);
    }
    const msg = err instanceof Error ? err.message : 'Error de red al contactar la pasarela.';
    log.error(msg);
    throw new PaymentsApiError(msg, 0);
  } finally {
    clearTimeout(timeout);
  }
}
