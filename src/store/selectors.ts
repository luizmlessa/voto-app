import { useVotoStore } from './useVotoStore';
import { todayKey, isWeekend, isJJPay } from '../lib/calendar';
import { SLEEP_ITEMS } from '../lib/items';

export function useToday() {
  return useVotoStore((s) => s.days[todayKey()]);
}

export function useSleepItems() {
  return SLEEP_ITEMS;
}

export function usePlayUnlocked() {
  return useVotoStore((s) => {
    const day = s.days[todayKey()];
    if (!day) return false;
    const eraFimDeSemana = isWeekend();
    const metasDoDia = s.metas.filter(m => m.tipoDia === 'todos' || m.tipoDia === (eraFimDeSemana ? 'fds' : 'util'));
    return metasDoDia.every((it) => day.done[it.id]) && !day.played;
  });
}

export function useContextLine() {
  return useVotoStore((s) => {
    if (isWeekend()) return '🌿 Fim de semana: dia livre. Foco no descanso e no cardio.';
    if (s.mode === 'coop') {
      return isJJPay()
        ? '🎮 Coop + JJ: treino às 14:30, leva Heitor 17:45–19:15.'
        : '🎮 Coop sem JJ: treino às 17:30.';
    }
    return '🎯 Modo Solo: rotina original, treino 17:30.';
  });
}