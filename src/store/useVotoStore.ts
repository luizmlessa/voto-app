import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Day, Meta, Mode, PersistedState, SleepId, Classe } from '../schemas/voto';
import { todayKey, isWeekend } from '../lib/calendar';
import { SLEEP_ITEMS } from '../lib/items';
import { applyXpGain, applyXpLoss } from '../lib/xp';

interface VotoState extends PersistedState {
  setMode: (mode: Mode) => void;
  setClasse: (classe: Classe) => void;
  toggleItem: (id: string, metaXp: number, metaHp: number) => void;
  toggleSleep: (id: SleepId) => void;
  markPlayed: () => void;
  rollover: () => void;
  addMeta: (meta: Omit<Meta, 'id'>) => void;
  removeMeta: (id: string) => void;
  buyItem: (id: 'pocao' | 'xp_boost' | 'congelamento') => void;
}

function newDay(date: string, mode: Mode): Day {
  return { date, mode, done: {}, sleep: {}, played: false };
}

const METAS_PADRAO: Meta[] = [
  { id: 'm1', titulo: 'Carreira', xp: 15, hp: 10, tipoDia: 'util' },
  { id: 'm2', titulo: 'Treino / Movimento', xp: 15, hp: 10, tipoDia: 'util' },
  { id: 'm3', titulo: 'Cardio bike', xp: 15, hp: 10, tipoDia: 'fds' },
  { id: 'm4', titulo: 'Água', xp: 10, hp: 5, tipoDia: 'todos' },
  { id: 'm5', titulo: '1 básico do dia', xp: 10, hp: 5, tipoDia: 'util' },
];

function initialState(): PersistedState {
  const today = todayKey();
  return {
    level: 1, xp: 0, hp: 100, maxHp: 100, mode: 'solo', classe: null,
    moedas: 0, streak: 0, freezes: 0, metas: METAS_PADRAO, lastDay: today,
    days: { [today]: newDay(today, 'solo') },
  };
}

function rollover(state: PersistedState): Partial<PersistedState> {
  const today = todayKey();
  const todayExists = !!state.days[today];
  if (state.lastDay === today && todayExists) return {};

  let hp = state.hp;
  let streak = state.streak;
  let freezes = state.freezes;

  if (state.lastDay !== today) {
    const past = state.days[state.lastDay];
    if (past) {
      let lost = 0;
      const eraFimDeSemana = isWeekend(state.lastDay);
      const metasDoDia = state.metas.filter(m => m.tipoDia === 'todos' || m.tipoDia === (eraFimDeSemana ? 'fds' : 'util'));
      
      metasDoDia.forEach((it) => { if (!past.done[it.id]) lost += it.hp; });
      SLEEP_ITEMS.forEach((it) => { if (!past.sleep[it.id]) lost += it.hp; });

      if (state.classe === 'guerreiro') lost = Math.ceil(lost / 2);

      // LÓGICA DO AMULETO DE GELO
      if (lost > 0 && freezes > 0) {
        freezes -= 1;
        lost = 0; // O dano é anulado
      } else if (lost > 0) {
        streak = 0; // Perdeu o streak e vai tomar dano
      } else {
        streak += 1; // Bateu todas as metas!
      }

      hp = Math.max(0, hp - lost);
    }
  }

  return {
    hp, streak, freezes, lastDay: today,
    days: { ...state.days, [today]: state.days[today] ?? newDay(today, state.mode) },
  };
}

function toggleDone(state: PersistedState, id: string, metaXp: number, metaHp: number): Partial<PersistedState> {
  const today = todayKey();
  const day = state.days[today];
  if (!day) return {};

  const wasDone = !!day.done[id];
  const done = { ...day.done, [id]: !wasDone };

  let xpGain = metaXp;
  let coinGain = 1;
  let hp = state.hp;

  // Se desmarcar, perde o HP da tarefa (evita farmar vida)
  if (wasDone) {
    hp = Math.max(0, hp - metaHp);
  }

  // HABILIDADES DE CLASSE
  if (state.classe === 'mago' && id === 'm1') xpGain *= 2;
  if (state.classe === 'ladino' && id === 'm3' && isWeekend(today)) xpGain *= 2;
  if (state.classe === 'clerigo' && id === 'm5') xpGain = Math.round(xpGain * 1.5);
  if (state.classe === 'druida' && (id === 'm2' || id === 'm3')) xpGain *= 2;
  
  if (state.classe === 'ladino') coinGain = 2;

  const result = wasDone
    ? applyXpLoss(state.level, state.xp, xpGain)
    : applyXpGain(state.level, state.xp, xpGain);

  if (state.classe === 'mago') {
    if (!wasDone && result.level > state.level) coinGain += 5;
    if (wasDone && result.level < state.level) coinGain += 5;
  }

  if (state.classe === 'druida' && id === 'm4' && !wasDone) {
    hp = Math.min(state.maxHp, hp + 5);
  }

  const moedas = wasDone ? Math.max(0, state.moedas - coinGain) : state.moedas + coinGain;

  return { level: result.level, xp: result.xp, moedas, hp, days: { ...state.days, [today]: { ...day, done } } };
}

function toggleSleepFn(state: PersistedState, id: SleepId): Partial<PersistedState> {
  const today = todayKey();
  const day = state.days[today];
  if (!day) return {};
  const item = SLEEP_ITEMS.find((i) => i.id === id);
  if (!item) return {};

  const wasDone = !!day.sleep[id];
  const sleep = { ...day.sleep, [id]: !wasDone };
  const result = wasDone ? applyXpLoss(state.level, state.xp, item.xp) : applyXpGain(state.level, state.xp, item.xp);

  let hp = state.hp;
  if (state.classe === 'clerigo' && id === 'sono2') {
    hp = wasDone ? Math.max(0, hp - 10) : Math.min(state.maxHp, hp + 10);
  }

  return { level: result.level, xp: result.xp, hp, days: { ...state.days, [today]: { ...day, sleep } } };
}

function markPlayedFn(state: PersistedState): Partial<PersistedState> {
  const today = todayKey();
  const day = state.days[today];
  if (!day || day.played) return {};

  const eraFimDeSemana = isWeekend(today);
  const metasDoDia = state.metas.filter(m => m.tipoDia === 'todos' || m.tipoDia === (eraFimDeSemana ? 'fds' : 'util'));
  const allDone = metasDoDia.every((it) => day.done[it.id]);

  if (!allDone) return {};

  return { days: { ...state.days, [today]: { ...day, played: true } } };
}

function applyRollover(state: VotoState, action: (rolled: VotoState) => Partial<VotoState>): VotoState {
  const rolled = { ...state, ...rollover(state) } as VotoState;
  return { ...rolled, ...action(rolled) };
}

export const useVotoStore = create<VotoState>()(
  persist(
    (set) => ({
      ...initialState(),
      setMode: (mode) => set((state) => applyRollover(state, () => ({ mode }))),
      setClasse: (classe) => set(() => {
        const bonusHp = classe === 'guerreiro' ? 30 : 0;
        return { classe, maxHp: 100 + bonusHp, hp: 100 + bonusHp };
      }),
      toggleItem: (id, xp, hp) => set((state) => applyRollover(state, (s) => toggleDone(s, id, xp, hp))),
      toggleSleep: (id) => set((state) => applyRollover(state, (s) => toggleSleepFn(s, id))),
      markPlayed: () => set((state) => applyRollover(state, (s) => markPlayedFn(s))),
      rollover: () => set((state) => applyRollover(state, () => ({}))),
      
      addMeta: (meta) => set((state) => ({ metas: [...state.metas, { ...meta, id: Math.random().toString(36).substring(7) }] })),
      removeMeta: (id) => set((state) => ({ metas: state.metas.filter(m => m.id !== id) })),
      
      buyItem: (id) => set((state) => {
        if (id === 'pocao') {
          if (state.moedas < 30) return {};
          return { moedas: state.moedas - 30, hp: Math.min(state.maxHp, state.hp + 30) };
        } 
        if (id === 'xp_boost') {
          if (state.moedas < 50) return {};
          return { moedas: state.moedas - 50, xp: state.xp + 20 };
        }
        if (id === 'congelamento') {
          if (state.moedas < 100 || state.freezes >= 2) return {};
          return { moedas: state.moedas - 100, freezes: state.freezes + 1 };
        }
        return {};
      }),
    }),
    {
      name: 'voto-vinculativo',
      version: 3, // Atualizado
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        level: state.level, xp: state.xp, hp: state.hp, maxHp: state.maxHp,
        mode: state.mode, classe: state.classe, moedas: state.moedas,
        streak: state.streak, freezes: state.freezes, metas: state.metas, 
        lastDay: state.lastDay, days: state.days,
      }),
    }
  )
);