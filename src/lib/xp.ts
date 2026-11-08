export function xpForLevel(level: number): number {
  return 100 + (level - 1) * 50;
}

export function applyXpGain(
  level: number,
  xp: number,
  gained: number
): { level: number; xp: number } {
  let l = level;
  let x = xp + gained;
  while (x >= xpForLevel(l)) {
    x -= xpForLevel(l);
    l += 1;
  }
  return { level: l, xp: x };
}

export function applyXpLoss(
  level: number,
  xp: number,
  lost: number
): { level: number; xp: number } {
  let l = level;
  let x = xp - lost;
  while (x < 0 && l > 1) {
    l -= 1;
    x += xpForLevel(l);
  }
  if (x < 0) x = 0;
  return { level: l, xp: x };
}