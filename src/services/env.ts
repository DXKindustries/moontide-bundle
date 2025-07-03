// src/services/env.ts
// -----------------------------------------------------------
// Determine whether we're running in development mode.
// Vite exposes `import.meta.env.MODE` which is reliably set to
// "development" when built with `vite dev` or `--mode development`.
// Capacitor builds sometimes miss `process.env.NODE_ENV`, so check
// both values to decide.

const viteMode = typeof import.meta !== 'undefined' ? import.meta.env.MODE : undefined;
const nodeEnv = typeof process !== 'undefined' ? process.env.NODE_ENV : undefined;

export const IS_DEV = typeof viteMode !== 'undefined'
  ? viteMode === 'development'
  : nodeEnv === 'development';

