import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockState = vi.hoisted(() => {
  return { today: '2026-11-09' };
});

vi.mock('../lib/calendar', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/calendar')>();
  return { ...actual, todayKey: () => mockState.today };
});

import { useVotoStore } from './useVotoStore';

const baseState = {
  level: 1,
  xp: 0,
  hp: 100,
  maxHp: 100,
  mode: 'solo' as const,
  lastDay: '2026-11-09',
  days: {
    '2026-11-09': {
      date: '2026-11-09',
      mode: 'solo' as const,
      done: {},
      sleep: {},
      played: false,
    },
  },
};

beforeEach(() => {
  localStorage.clear();
  mockState.today = '2026-11-09';
  useVotoStore.setState(baseState);
});

describe('toggleItem', () => {
  it('marca e soma XP', () => {
    useVotoStore.getState().toggleItem('carreira');
    const s = useVotoStore.getState();
    expect(s.xp).toBe(15);
    expect(s.days['2026-11-09'].done.carreira).toBe(true);
  });

  it('desmarca e subtrai XP (não deixa farmar)', () => {
    useVotoStore.getState().toggleItem('carreira');
    useVotoStore.getState().toggleItem('carreira');
    const s = useVotoStore.getState();
    expect(s.xp).toBe(0);
    expect(!!s.days['2026-11-09'].done.carreira).toBe(false);
  });

  it('sobe de nível ao cruzar o limiar', () => {
    useVotoStore.setState({ xp: 90, level: 1 });
    useVotoStore.getState().toggleItem('carreira'); // +15
    const s = useVotoStore.getState();
    expect(s.level).toBe(2);
    expect(s.xp).toBe(5);
  });
});

describe('toggleSleep', () => {
  it('marca sono e soma XP separado', () => {
    useVotoStore.getState().toggleSleep('sono1');
    const s = useVotoStore.getState();
    expect(s.xp).toBe(10);
    expect(s.days['2026-11-09'].sleep.sono1).toBe(true);
  });
});

describe('markPlayed', () => {
  it('não libera se faltam itens', () => {
    useVotoStore.getState().markPlayed();
    expect(useVotoStore.getState().days['2026-11-09'].played).toBe(false);
  });

  it('libera com todos os itens do dia cumpridos', () => {
    (['carreira', 'treino', 'agua', 'basico'] as const).forEach((id) =>
      useVotoStore.getState().toggleItem(id)
    );
    useVotoStore.getState().markPlayed();
    expect(useVotoStore.getState().days['2026-11-09'].played).toBe(true);
  });

  it('é idempotente', () => {
    (['carreira', 'treino', 'agua', 'basico'] as const).forEach((id) =>
      useVotoStore.getState().toggleItem(id)
    );
    useVotoStore.getState().markPlayed();
    useVotoStore.getState().markPlayed(); // não quebra
    expect(useVotoStore.getState().days['2026-11-09'].played).toBe(true);
  });
});

describe('rollover', () => {
  it('desconta HP pelos itens não feitos ao virar o dia', () => {
    mockState.today = '2026-11-10'; // terça
    useVotoStore.setState({
      ...baseState,
      lastDay: '2026-11-09',
      hp: 100,
      days: {
        '2026-11-09': {
          date: '2026-11-09',
          mode: 'solo',
          done: { carreira: true, treino: true }, // faltou agua e basico
          sleep: { sono1: true },                  // faltou sono2
          played: false,
        },
      },
    });

    useVotoStore.getState().rollover();

    const s = useVotoStore.getState();
    // agua(5) + basico(5) + sono2(10) = 20 HP perdidos
    expect(s.hp).toBe(80);
    expect(s.lastDay).toBe('2026-11-10');
    expect(s.days['2026-11-10']).toBeDefined();
  });

  it('usa itens de fim de semana quando o dia anterior foi sábado/domingo', () => {
    mockState.today = '2026-11-09'; // segunda
    useVotoStore.setState({
      ...baseState,
      lastDay: '2026-11-08', // domingo
      hp: 100,
      days: {
        '2026-11-08': {
          date: '2026-11-08',
          mode: 'solo',
          done: { cardio: true }, // faltou agua
          sleep: { sono1: true, sono2: true },
          played: false,
        },
      },
    });

    useVotoStore.getState().rollover();

    const s = useVotoStore.getState();
    // no fim de semana só conta cardio + agua + sono. agua(5) faltou.
    expect(s.hp).toBe(95);
  });

  it('não desconta HP se o dia já foi processado (rollover idempotente)', () => {
    useVotoStore.getState().rollover();
    useVotoStore.getState().rollover();
    expect(useVotoStore.getState().hp).toBe(100);
  });
});