import { IS_DEV } from '@/services/env';

export function debugLog(...args: unknown[]): void {
  if (IS_DEV) {
    console.log('[debug]', ...args);
  }
}
