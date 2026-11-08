export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isWeekend(dateKey?: string): boolean {
  const d = dateKey ? new Date(dateKey + 'T12:00:00') : new Date();
  const w = d.getDay();
  return w === 0 || w === 6;
}

export function isJJPay(dateKey?: string): boolean {
  const d = dateKey ? new Date(dateKey + 'T12:00:00') : new Date();
  const w = d.getDay();
  return w === 1 || w === 3 || w === 5;
}