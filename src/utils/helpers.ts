import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { de } from 'date-fns/locale';
import { DayKey, WorkoutSession, Exercise } from '../types';

// ── Template Labels (PUSH / PULL / LEGS statt Wochentage) ───────────────────
export const DAY_LABELS: Record<DayKey, string> = {
  monday:    'PUSH DAY',
  tuesday:   'PULL DAY',
  wednesday: 'LEGS+ABS',
};

export const DAY_SHORT: Record<DayKey, string> = {
  monday:    'PUSH',
  tuesday:   'PULL',
  wednesday: 'LEGS',
};

export const DAY_SUBTITLE: Record<DayKey, string> = {
  monday:    'BRUST · SCHULTERN · TRIZEPS',
  tuesday:   'RÜCKEN · BIZEPS · ZUGÜBUNGEN',
  wednesday: 'BEINE · BAUCH · CORE',
};

export const DAY_COLOR: Record<DayKey, string> = {
  monday:    '#F3E600',   // Yellow
  tuesday:   '#00D4FF',   // Cyan
  wednesday: '#FF0080',   // Magenta
};

export const CATEGORY_LABELS: Record<string, string> = {
  push: 'PUSH',
  pull: 'PULL',
  legs_abs: 'LEGS+ABS',
};

// ── Date / Time Helpers ──────────────────────────────────────────────────────
export function todayStr(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function formatDate(dateStr: string): string {
  try {
    const d = parseISO(dateStr);
    if (isToday(d)) return 'Heute';
    if (isYesterday(d)) return 'Gestern';
    return format(d, "EEEE, dd. MMMM yyyy", { locale: de });
  } catch {
    return dateStr;
  }
}

export function formatDateShort(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'dd.MM', { locale: de });
  } catch {
    return dateStr;
  }
}

export function formatDateMedium(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "EEE, dd. MMM", { locale: de });
  } catch {
    return dateStr;
  }
}

export function formatTimestamp(isoStr: string): string {
  try {
    const d = new Date(isoStr);
    return format(d, "EEEE, dd. MMMM yyyy • HH:mm 'Uhr'", { locale: de });
  } catch {
    return isoStr;
  }
}

export function formatTimeOnly(isoStr: string): string {
  try {
    return format(new Date(isoStr), "HH:mm 'Uhr'");
  } catch {
    return '';
  }
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export function formatMs(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function formatMsShort(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ── Stats Helpers ────────────────────────────────────────────────────────────
export function getMaxWeightForExercise(
  exerciseId: string,
  sessions: WorkoutSession[]
): number {
  let max = 0;
  for (const session of sessions) {
    const log = session.exerciseLogs.find(l => l.exerciseId === exerciseId);
    if (!log) continue;
    for (const set of log.sets) {
      if (set.weight > max) max = set.weight;
    }
  }
  return max;
}

export function getPersonalRecords(
  sessions: WorkoutSession[],
  exercises: Exercise[]
): Record<string, { weight: number; date: string }> {
  const prs: Record<string, { weight: number; date: string }> = {};
  const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date));
  for (const session of sorted) {
    for (const log of session.exerciseLogs) {
      for (const set of log.sets) {
        const current = prs[log.exerciseId];
        if (!current || set.weight > current.weight) {
          prs[log.exerciseId] = { weight: set.weight, date: session.date };
        }
      }
    }
  }
  return prs;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getCurrentISOTime(): string {
  return new Date().toISOString();
}
