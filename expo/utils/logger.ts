/**
 * Logger ligero con tag, sólo en desarrollo.
 * Nunca registra valores sensibles completos (api keys, CVV, números de tarjeta).
 */
const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : false;

function mask(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  if (value.length <= 4) return '****';
  return `${value.slice(0, 2)}***${value.slice(-2)}`;
}

export function createLogger(tag: string) {
  const prefix = `[${tag}]`;
  return {
    info: (...args: unknown[]) => {
      if (isDev) console.log(prefix, ...args);
    },
    warn: (...args: unknown[]) => {
      if (isDev) console.warn(prefix, ...args);
    },
    error: (...args: unknown[]) => {
      console.error(prefix, ...args);
    },
    sensitive: (label: string, value: unknown) => {
      if (isDev) console.log(prefix, label, mask(value));
    },
  };
}
