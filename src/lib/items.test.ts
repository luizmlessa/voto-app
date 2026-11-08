import { describe, it, expect } from 'vitest';
import { itemsForDate, ITEMS_WEEKDAY, ITEMS_WEEKEND } from './items';

describe('itemsForDate', () => {
  it('dia útil retorna checklist de semana', () => {
    expect(itemsForDate('2026-11-09')).toEqual(ITEMS_WEEKDAY); // segunda
  });
  it('sábado retorna checklist de fim de semana', () => {
    expect(itemsForDate('2026-11-07')).toEqual(ITEMS_WEEKEND);
  });
  it('domingo retorna checklist de fim de semana', () => {
    expect(itemsForDate('2026-11-08')).toEqual(ITEMS_WEEKEND);
  });
});