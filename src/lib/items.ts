import type { SleepId } from '../schemas/voto';

export interface SleepDef { id: SleepId; label: string; hint: string; xp: number; hp: number; }

export const SLEEP_ITEMS: SleepDef[] = [
  { id: 'sono1', label: 'Deitei no horário', hint: 'Rotina de sono cumprida', xp: 10, hp: 10 },
  { id: 'sono2', label: 'Dormi 6h30+', hint: 'Verificado na manhã seguinte', xp: 10, hp: 10 },
];