/**
 * Servicio Zoho Flow — envía eventos de pago al webhook configurado.
 */
import type { ZohoFlowPaymentEvent, ZohoFlowResponse } from '@/types/zoho';
import type { PaymentResult } from '@/types/payments';
import { createLogger } from '@/utils/logger';

const WEBHOOK = process.env.EXPO_PUBLIC_ZOHO_FLOW_WEBHOOK ?? '';
const log = createLogger('zoho-flow');

export const ZohoFlowConfig = {
  webhook: WEBHOOK,
  isConfigured: (): boolean => Boolean(WEBHOOK),
};

export async function sendZohoFlowEvent(
  event: ZohoFlowPaymentEvent,
  options: { timeoutMs?: number } = {}
): Promise<ZohoFlowResponse> {
  if (!WEBHOOK) {
    log.warn('Webhook no configurado, evento ignorado.');
    return { ok: false, status: 0, message: 'webhook-not-configured' };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 15000);

  try {
    log.info('send', event.event, event.order_id);
    const res = await fetch(WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(event),
      signal: controller.signal,
    });
    const ok = res.ok;
    let message: string | undefined;
    try {
      const txt = await res.text();
      if (txt) message = txt.slice(0, 200);
    } catch {}
    if (!ok) log.warn('Zoho responded', res.status, message);
    return { ok, status: res.status, message };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    log.error('Zoho Flow error', msg);
    return { ok: false, status: 0, message: msg };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Helper: arma y envía un evento desde un PaymentResult.
 */
export async function notifyZohoPayment(
  result: PaymentResult,
  opts: {
    eventType?: ZohoFlowPaymentEvent['event'];
    customerName?: string;
    description?: string;
  } = {}
): Promise<ZohoFlowResponse> {
  const event: ZohoFlowPaymentEvent = {
    event: opts.eventType ?? 'payment.created',
    order_id: result.orderId,
    amount: result.amount,
    currency: result.currency,
    status: result.status,
    date: result.createdAt,
    email: result.customerEmail ?? '',
    customer_name: opts.customerName,
    description: opts.description,
    payment_url: result.paymentUrl ?? undefined,
    transaction_id: result.transactionId ?? undefined,
    source: 'cltiene-app',
  };
  return sendZohoFlowEvent(event);
}
