import { NatureEventRule } from '@/types/nature';
import type { SolarSeries } from './solarFlow';

export interface NatureEvalResult {
  bands: Array<{ start: number; end: number; label: string }>;
  markers: Array<{ index: number; label: string }>;
}

export const evaluateRules = (
  _series: SolarSeries,
  _rules: NatureEventRule[]
): NatureEvalResult => {
  return { bands: [], markers: [] };
};

