import { describe, it, expect } from 'vitest';
import { DaySchema, StateSchema } from './voto';

describe('DaySchema', () => {
  it('aceita done/sleep vazios (regressão do bug de record)', () => {
    const r = DaySchema.safeParse({
      date: '2026-11-09',
      mode: 'solo',
      done: {},
      sleep: {},
      played: false,
    });
    expect(r.success).toBe(true);
  });

  it('rejeita data fora do formato ISO', () => {
    const r = DaySchema.safeParse({ date: '07/11/2026', mode: 'solo' });
    expect(r.success).toBe(false);
  });

  it('rejeita modo inválido', () => {
    const r = DaySchema.safeParse({ date: '2026-11-09', mode: 'guerra' });
    expect(r.success).toBe(false);
  });
});

describe('StateSchema', () => {
  it('aplica defaults corretamente', () => {
    const r = StateSchema.safeParse({ lastDay: '2026-11-09' });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.level).toBe(1);
      expect(r.data.hp).toBe(100);
      expect(r.data.mode).toBe('solo');
    }
  });
});