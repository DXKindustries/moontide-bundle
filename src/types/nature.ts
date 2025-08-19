export type TriggerKind = 'photoperiod';

export interface NatureEventRule {
  id: string;
  trigger: TriggerKind;
  threshold: number; // daylight hours threshold
  label: string;
}

