/**
 * Configuración central de la pasarela Payments.
 * Lee variables de entorno EXPO_PUBLIC_PAYMENTS_*.
 *
 * EXPO_PUBLIC_PAYMENTS_BASE_URL — URL completa de producción (preferida).
 * Si no se define, se construye desde HOST + PORT + HTTPS.
 */

const BASE_URL = (process.env.EXPO_PUBLIC_PAYMENTS_BASE_URL ?? '').replace(/\/+$/, '');
const HOST = process.env.EXPO_PUBLIC_PAYMENTS_HOST ?? '';
const API_KEY = process.env.EXPO_PUBLIC_PAYMENTS_API_KEY ?? '';
const TERMINAL_ID = Number(process.env.EXPO_PUBLIC_PAYMENTS_TERMINAL_ID ?? '0');
const FORM_ID = Number(process.env.EXPO_PUBLIC_PAYMENTS_FORM_ID ?? '0');

function resolveScheme(): 'http' | 'https' {
  const raw = String(process.env.EXPO_PUBLIC_PAYMENTS_HTTPS ?? 'true').toLowerCase().trim();
  if (raw === 'false' || raw === '0' || raw === 'no' || raw === 'http') return 'http';
  return 'https';
}

/**
 * Devuelve la BASE_URL completa de la pasarela.
 * Prioriza EXPO_PUBLIC_PAYMENTS_BASE_URL; si no existe, construye desde HOST+PORT.
 */
export function getPaymentsBaseUrl(): string {
  if (BASE_URL) return BASE_URL;
  if (!HOST) return '';
  const scheme = resolveScheme();
  const port = process.env.EXPO_PUBLIC_PAYMENTS_PORT ?? '';
  const portNum = Number(port);
  const isDefault =
    (scheme === 'https' && portNum === 443) ||
    (scheme === 'http' && portNum === 80) ||
    !port;
  return `${scheme}://${HOST}${isDefault ? '' : `:${port}`}`;
}

export const PaymentsConfig = {
  host: HOST || BASE_URL,
  apiKey: API_KEY,
  terminalId: TERMINAL_ID,
  formId: FORM_ID,
  baseUrl: getPaymentsBaseUrl(),
  isConfigured: (): boolean => Boolean(getPaymentsBaseUrl()) && Boolean(API_KEY),
};
