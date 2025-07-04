// src/tides.ts
import { Router } from 'express';
import axios from 'axios';

const router = Router();

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function parseYYYYMMDD(s: string): Date | null {
  const m = s.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (!m) return null;
  const [, y, mo, d] = m.map(Number);
  return new Date(y, mo - 1, d);
}

function yyyymmdd(d: Date): string {
  return d.toISOString().slice(0, 10).replace(/-/g, '');
}



export default router;
