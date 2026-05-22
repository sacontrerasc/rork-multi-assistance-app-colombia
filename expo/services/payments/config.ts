/**
 * Configuración central de la pasarela Payments.
 * Lee variables de entorno EXPO_PUBLIC_PAYMENTS_*.
 */

const RAW_HTTPS = process.env.EXPO_PUBLIC_PAYMENTS_HTTPS ?? 'true';
const HOST = process.env.EXPO_PUBLIC_PAYMENTS_HOST ?? '';
const PORT = process.env.EXPO_PUBLIC_PAYMENTS_PORT ?? '';
const API_KEY = process.env.EXPO_PUBLIC_PAYMENTS_API_KEY ?? '';
const TERMINAL_ID = Number(process.env.EXPO_PUBLIC_PAYMENTS_TERMINAL_ID ?? '0');
const FORM_ID = Number(process.env.EXPO_PUBLIC_PAYMENTS_FORM_ID ?? '0');

function resolveScheme(): 'http' | 'https' {
  const v = String(RAW_HTTPS).toLowerCase().trim();
  if (v === 'false' || v === '0' || v === 'no' || v === 'http') return 'http';
  return 'https';
}

/**
 * Devuelve la BASE_URL completa de la pasarela.
 * Si el puerto es el estándar de su esquema, se omite.
 */
export function getPaymentsBaseUrl(): string {
  if (!HOST) return '';
  const scheme = resolveScheme();
  const portNum = Number(PORT);
  const isDefault =
    (scheme === 'https' && portNum === 443) ||
    (scheme === 'http' && portNum === 80) ||
    !PORT;
  return `${scheme}://${HOST}${isDefault ? '' : `:${PORT}`}`;
}

export const PaymentsConfig = {
  host: HOST,
  port: PORT,
  apiKey: API_KEY,
  terminalId: TERMINAL_ID,
  formId: FORM_ID,
  baseUrl: getPaymentsBaseUrl(),
  isConfigured: (): boolean => Boolean(HOST) && Boolean(API_KEY),
};
