/**
 * Genera un identificador de orden único, seguro para usar como reference.
 */
export function generateOrderId(prefix: string = 'CLT'): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${ts}-${rnd}`;
}
