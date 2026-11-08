import { describe, it, expect } from 'vitest';
import { isWeekend, isJJPay } from './calendar';

describe('isWeekend', () => {
  it('sábado', () => expect(isWeekend('2026-11-07')).toBe(true));
  it('domingo', () => expect(isWeekend('2026-11-08')).toBe(true));
  it('segunda', () => expect(isWeekend('2026-11-09')).toBe(false));
  it('sexta', () => expect(isWeekend('2026-11-13')).toBe(false));
});

describe('isJJPay', () => {
  it('segunda', () => expect(isJJPay('2026-11-09')).toBe(true));
  it('quarta', () => expect(isJJPay('2026-11-11')).toBe(true));
  it('sexta',   () => expect(isJJPay('2026-11-13')).toBe(true));
  it('terça',   () => expect(isJJPay('2026-11-10')).toBe(false));
  it('quinta',  () => expect(isJJPay('2026-11-12')).toBe(false));
});