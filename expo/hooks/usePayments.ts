/**
 * Hook de alto nivel para iniciar un pago, integrar 3DS y notificar a Zoho Flow.
 */
import { useCallback, useState } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import {
  PaymentsService,
  PaymentsConfig,
  PaymentsApiError,
} from '@/services/payments';
import { notifyZohoPayment } from '@/services/zoho/zohoFlowService';
import { generateOrderId } from '@/utils/orderId';
import type {
  CreatePaymentLinkInput,
  CreateTransactionInput,
  PaymentResult,
  PaymentServiceId,
  PaymentCurrency,
} from '@/types/payments';

export interface StartPaymentLinkInput
  extends Omit<CreatePaymentLinkInput, 'services'> {
  service?: PaymentServiceId;
  customerEmail: string;
  customerName?: string;
  orderId?: string;
}

export interface UsePaymentsState {
  loading: boolean;
  error: string | null;
  result: PaymentResult | null;
}

export function usePayments() {
  const [state, setState] = useState<UsePaymentsState>({
    loading: false,
    error: null,
    result: null,
  });

  const openUrl = useCallback(async (url: string) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') window.open(url, '_blank');
      return;
    }
    await WebBrowser.openBrowserAsync(url);
  }, []);

  /**
   * Crea un link de pago, lo abre en el navegador y notifica a Zoho.
   */
  const startPaymentLink = useCallback(
    async (input: StartPaymentLinkInput): Promise<PaymentResult> => {
      setState({ loading: true, error: null, result: null });
      const orderId = input.orderId ?? generateOrderId();
      const currency: PaymentCurrency = input.currency ?? 'COP';
      try {
        if (!PaymentsConfig.isConfigured()) {
          throw new Error('La pasarela de pagos no está configurada.');
        }

        const resp = await PaymentsService.createPaymentLink({
          amount: input.amount,
          description: input.description,
          currency,
          expirationDate: input.expirationDate,
          services: input.service ? [input.service] : [1],
          idPerson: input.idPerson,
          terminalId: input.terminalId,
          formId: input.formId,
        });

        const url = PaymentsService.extractPaymentUrl(resp);
        if (!url) throw new Error('La pasarela no devolvió una URL de pago válida.');

        const result: PaymentResult = {
          orderId,
          amount: input.amount,
          currency,
          status: 'pending',
          paymentUrl: url,
          transactionId: resp.item?.id ?? null,
          customerEmail: input.customerEmail,
          createdAt: new Date().toISOString(),
          raw: resp,
        };

        // Notifica Zoho de forma no bloqueante
        void notifyZohoPayment(result, {
          eventType: 'payment.created',
          customerName: input.customerName,
          description: input.description,
        });

        await openUrl(url);

        setState({ loading: false, error: null, result });
        return result;
      } catch (err) {
        const message =
          err instanceof PaymentsApiError
            ? err.message
            : err instanceof Error
            ? err.message
            : 'No se pudo iniciar el pago.';
        setState({ loading: false, error: message, result: null });
        throw new Error(message);
      }
    },
    [openUrl]
  );

  /**
   * Flujo 3DS: crea transacción → autentica → (continúa) → verifica.
   * `onChallenge(url)` es llamado si la pasarela exige challenge en navegador.
   */
  const startCardPayment = useCallback(
    async (
      input: CreateTransactionInput & {
        returnUrl: string;
        onChallenge?: (url: string) => Promise<{ cres?: string; paRes?: string; md?: string }>;
      }
    ): Promise<PaymentResult> => {
      setState({ loading: true, error: null, result: null });
      const orderId = input.reference || generateOrderId();
      const currency: PaymentCurrency = input.currency ?? 'COP';
      try {
        if (!PaymentsConfig.isConfigured()) {
          throw new Error('La pasarela de pagos no está configurada.');
        }

        const created = await PaymentsService.createTransaction({ ...input, reference: orderId });
        const txId = created.item?.id ?? created.item?.transaction_id;
        if (!txId) throw new Error('La pasarela no devolvió un ID de transacción.');

        const auth = await PaymentsService.authenticate3DS({
          transactionId: txId,
          returnUrl: input.returnUrl,
        });

        const challengeUrl =
          auth.item?.redirect_url ?? auth.item?.redirectUrl ?? auth.item?.url ?? null;

        if (challengeUrl && input.onChallenge) {
          const challengeResult = await input.onChallenge(challengeUrl);
          await PaymentsService.continueAuthenticate({
            transactionId: txId,
            ...challengeResult,
          });
        }

        const verify = await PaymentsService.verifyAuthenticate({ transactionId: txId });
        const authenticated = verify.item?.authenticated === true;
        const statusFromApi = (verify.item?.status ?? '').toLowerCase();

        const status: PaymentResult['status'] =
          statusFromApi === 'approved' || statusFromApi === 'paid' || authenticated
            ? 'paid'
            : statusFromApi === 'pending'
            ? 'pending'
            : 'failed';

        const result: PaymentResult = {
          orderId,
          amount: input.amount,
          currency,
          status,
          paymentUrl: null,
          transactionId: txId,
          customerEmail: input.customer.email,
          createdAt: new Date().toISOString(),
          raw: verify,
        };

        void notifyZohoPayment(result, {
          eventType: status === 'paid' ? 'payment.completed' : 'payment.updated',
          customerName: input.customer.name,
          description: input.description,
        });

        setState({ loading: false, error: null, result });
        return result;
      } catch (err) {
        const message =
          err instanceof PaymentsApiError
            ? err.message
            : err instanceof Error
            ? err.message
            : 'No se pudo procesar el pago.';
        setState({ loading: false, error: message, result: null });
        throw new Error(message);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({ loading: false, error: null, result: null });
  }, []);

  return {
    ...state,
    startPaymentLink,
    startCardPayment,
    reset,
    isConfigured: PaymentsConfig.isConfigured(),
  };
}
