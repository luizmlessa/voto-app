import { describe, it, expect } from 'vitest';
import { xpForLevel, applyXpGain, applyXpLoss } from './xp';

describe('xpForLevel', () => {
  it('level 1 = 100', () => expect(xpForLevel(1)).toBe(100));
  it('level 2 = 150', () => expect(xpForLevel(2)).toBe(150));
  it('level 5 = 300', () => expect(xpForLevel(5)).toBe(300));
});

describe('applyXpGain', () => {
  it('ganho simples sem subir de nível', () => {
    expect(applyXpGain(1, 50, 30)).toEqual({ level: 1, xp: 80 });
  });

  it('sobe de nível exatamente no limiar', () => {
    expect(applyXpGain(1, 90, 10)).toEqual({ level: 2, xp: 0 });
  });

  it('sobe de nível com sobra', () => {
    expect(applyXpGain(1, 90, 20)).toEqual({ level: 2, xp: 10 });
  });

  it('sobe dois níveis de uma vez', () => {
    // 90 + 300 = 390 → lvl2(-100)=290 → lvl3(-150)=140
    expect(applyXpGain(1, 90, 300)).toEqual({ level: 3, xp: 140 });
  });
});

describe('applyXpLoss', () => {
  it('perda simples sem descer de nível', () => {
    expect(applyXpLoss(1, 50, 20)).toEqual({ level: 1, xp: 30 });
  });

  it('desce de nível', () => {
    expect(applyXpLoss(2, 10, 30)).toEqual({ level: 1, xp: 80 });
  });

  it('no nível 1 trava em 0', () => {
    expect(applyXpLoss(1, 10, 50)).toEqual({ level: 1, xp: 0 });
  });

  it('desce dois níveis', () => {
    // 10-200 = -190 → lvl2(-150)=-40 → lvl1(+100)=60
    expect(applyXpLoss(3, 10, 200)).toEqual({ level: 1, xp: 60 });
  });
});