import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  AppState, Exercise, WorkoutSet, DayKey,
  WorkoutSession, BodyWeightEntry, WorkoutTimerState
} from '../types';
import { generateId, todayStr } from '../utils/helpers';
import { calcSessionXP } from '../utils/xp';

const DEFAULT_EXERCISES: Exercise[] = [
  { id: 'ex-1', name: 'Flachbank Hanteln Drücken', dayKey: 'monday',    category: 'push',     isBodyweight: false, order: 1 },
  { id: 'ex-2', name: 'Katana Extensions (Trizeps)', dayKey: 'monday',  category: 'push',     isBodyweight: false, order: 2 },
  { id: 'ex-3', name: 'Schulter Seitenheben',        dayKey: 'monday',  category: 'push',     isBodyweight: false, order: 3 },
  { id: 'ex-4', name: 'Einarmiges Kurzhantelrudern', dayKey: 'tuesday', category: 'pull',     isBodyweight: false, order: 1 },
  { id: 'ex-5', name: 'Pull Ups',                    dayKey: 'tuesday', category: 'pull',     isBodyweight: true,  order: 2 },
  { id: 'ex-6', name: 'Konzentrations-Curls (Bizeps)',dayKey: 'tuesday', category: 'pull',    isBodyweight: false, order: 3 },
  { id: 'ex-7', name: 'Kniebeugen mit Hanteln',      dayKey: 'wednesday',category: 'legs_abs',isBodyweight: false, order: 1 },
  { id: 'ex-8', name: 'Crunches mit Gewicht',        dayKey: 'wednesday',category: 'legs_abs',isBodyweight: false, order: 2 },
];

// ── Historische Sessions ─────────────────────────────────────────────────────
const HISTORY_SESSIONS: WorkoutSession[] = [
  // ── PUSH 2026-05-18 (Testwoche, leicht weniger Gewicht → zeigt Progression) ─
  {
    id: 'hist-push-2026-05-18',
    date: '2026-05-18',
    startedAt: '2026-05-18T09:00:00',
    dayKey: 'monday',
    isManual: true,
    completedAt: '2026-05-18T10:30:00',
    xpEarned: 282,
    durationMinutes: 85,
    exerciseLogs: [
      {
        exerciseId: 'ex-1',
        sets: [
          { id: 'p18-1', reps: 12, weight: 28 },
          { id: 'p18-2', reps: 12, weight: 28 },
          { id: 'p18-3', reps: 11, weight: 28 },
          { id: 'p18-4', reps: 10, weight: 28 },
        ],
      },
      {
        exerciseId: 'ex-2',
        sets: [
          { id: 'p18-5', reps: 12, weight: 11 },
          { id: 'p18-6', reps: 12, weight: 11 },
          { id: 'p18-7', reps: 12, weight: 11 },
          { id: 'p18-8', reps: 10, weight: 11 },
        ],
      },
      {
        exerciseId: 'ex-3',
        sets: [
          { id: 'p18-9',  reps: 12, weight: 9 },
          { id: 'p18-10', reps: 12, weight: 9 },
          { id: 'p18-11', reps: 12, weight: 9 },
          { id: 'p18-12', reps: 10, weight: 9 },
        ],
      },
    ],
  },
  // ── PULL 2026-05-20 (Testwoche) ─────────────────────────────────────────────
  {
    id: 'hist-pull-2026-05-20',
    date: '2026-05-20',
    startedAt: '2026-05-20T09:00:00',
    dayKey: 'tuesday',
    isManual: true,
    completedAt: '2026-05-20T10:30:00',
    xpEarned: 363,
    durationMinutes: 88,
    exerciseLogs: [
      {
        exerciseId: 'ex-4',
        sets: [
          { id: 'pl20-1', reps: 12, weight: 33 },
          { id: 'pl20-2', reps: 9,  weight: 33 },
          { id: 'pl20-3', reps: 8,  weight: 33 },
          { id: 'pl20-4', reps: 8,  weight: 33 },
        ],
      },
      {
        exerciseId: 'ex-5',
        sets: [
          { id: 'pl20-5', reps: 8, weight: 0 },
          { id: 'pl20-6', reps: 7, weight: 0 },
          { id: 'pl20-7', reps: 6, weight: 0 },
          { id: 'pl20-8', reps: 6, weight: 0 },
        ],
      },
      {
        exerciseId: 'ex-6',
        sets: [
          { id: 'pl20-9',  reps: 11, weight: 11 },
          { id: 'pl20-10', reps: 12, weight: 11 },
          { id: 'pl20-11', reps: 11, weight: 11 },
          { id: 'pl20-12', reps: 8,  weight: 11 },
        ],
      },
    ],
  },
  // ── PUSH 2026-05-25 (deine echten Daten) ───────────────────────────────────
  {
    id: 'hist-push-2026-05-25',
    date: '2026-05-25',
    startedAt: '2026-05-25T09:00:00',
    dayKey: 'monday',
    isManual: true,
    completedAt: '2026-05-25T10:30:00',
    xpEarned: 286,
    durationMinutes: 90,
    exerciseLogs: [
      {
        exerciseId: 'ex-1',
        sets: [
          { id: 'h1-1', reps: 12, weight: 29 },
          { id: 'h1-2', reps: 12, weight: 29 },
          { id: 'h1-3', reps: 12, weight: 29 },
          { id: 'h1-4', reps: 12, weight: 29 },
        ],
      },
      {
        exerciseId: 'ex-2',
        sets: [
          { id: 'h2-1', reps: 12, weight: 11 },
          { id: 'h2-2', reps: 12, weight: 11 },
          { id: 'h2-3', reps: 12, weight: 11 },
          { id: 'h2-4', reps: 12, weight: 11 },
        ],
      },
      {
        exerciseId: 'ex-3',
        sets: [
          { id: 'h3-1', reps: 12, weight: 9 },
          { id: 'h3-2', reps: 12, weight: 9 },
          { id: 'h3-3', reps: 12, weight: 9 },
          { id: 'h3-4', reps: 12, weight: 9 },
        ],
      },
    ],
  },
  {
    id: 'hist-pull-2026-05-27',
    date: '2026-05-27',
    startedAt: '2026-05-27T09:00:00',
    dayKey: 'tuesday',
    isManual: true,
    completedAt: '2026-05-27T10:30:00',
    xpEarned: 368,
    durationMinutes: 90,
    exerciseLogs: [
      {
        exerciseId: 'ex-4',
        sets: [
          { id: 'h4-1', reps: 12, weight: 34 },
          { id: 'h4-2', reps: 9,  weight: 34 },
          { id: 'h4-3', reps: 8,  weight: 34 },
          { id: 'h4-4', reps: 8,  weight: 34 },
        ],
      },
      {
        exerciseId: 'ex-5',
        sets: [
          { id: 'h5-1', reps: 8, weight: 0 },
          { id: 'h5-2', reps: 8, weight: 0 },
          { id: 'h5-3', reps: 7, weight: 0 },
          { id: 'h5-4', reps: 6, weight: 0 },
        ],
      },
      {
        exerciseId: 'ex-6',
        sets: [
          { id: 'h6-1', reps: 11, weight: 11 },
          { id: 'h6-2', reps: 12, weight: 11 },
          { id: 'h6-3', reps: 12, weight: 11 },
          { id: 'h6-4', reps: 8,  weight: 11 },
        ],
      },
    ],
  },
];

// ── Store ────────────────────────────────────────────────────────────────────
export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      exercises: DEFAULT_EXERCISES,
      sessions: HISTORY_SESSIONS,
      // Testkörpergewicht: 10 Tage Verlauf (leicht abnehmend)
      bodyWeightEntries: [
        { id: 'bw-01', date: '2026-05-20', weight: 82.0 },
        { id: 'bw-02', date: '2026-05-21', weight: 81.8 },
        { id: 'bw-03', date: '2026-05-22', weight: 82.1 },
        { id: 'bw-04', date: '2026-05-23', weight: 81.6 },
        { id: 'bw-05', date: '2026-05-24', weight: 81.4 },
        { id: 'bw-06', date: '2026-05-25', weight: 81.2 },
        { id: 'bw-07', date: '2026-05-26', weight: 81.5 },
        { id: 'bw-08', date: '2026-05-27', weight: 81.0 },
        { id: 'bw-09', date: '2026-05-28', weight: 80.8 },
        { id: 'bw-10', date: '2026-05-29', weight: 80.6 },
      ],
      profile: {
        name: 'CHOOM',
        totalXP: 1299, // Push18(282) + Pull20(363) + Push25(286) + Pull27(368)
        streak: 2,
        lastWorkoutDate: '2026-05-27',
      },
      activeSession: null,
      activeSessionStartTime: null,
      workoutTimer: null,

      // ── Exercise Actions ─────────────────────────────────────────────────────
      addExercise: (ex) => {
        const exercises = get().exercises;
        const sameDay = exercises.filter(e => e.dayKey === ex.dayKey);
        const newEx: Exercise = { ...ex, id: generateId(), order: sameDay.length + 1 };
        set(s => ({ exercises: [...s.exercises, newEx] }));
      },

      deleteExercise: (id) => {
        set(s => ({ exercises: s.exercises.filter(e => e.id !== id) }));
      },

      updateExercise: (id, updates) => {
        set(s => ({ exercises: s.exercises.map(e => e.id === id ? { ...e, ...updates } : e) }));
      },

      // ── Session Actions ──────────────────────────────────────────────────────
      startSession: (dayKey: DayKey, customDate?: string, customTime?: string) => {
        const date = customDate ?? todayStr();
        const now = new Date();
        const startedAt = customDate
          ? customTime
            ? `${customDate}T${customTime}:00.000Z`
            : `${customDate}T09:00:00.000Z`
          : now.toISOString();

        // Existierende unfertige Session für diesen Tag+Template wiederherstellen (nur bei Heute)
        if (!customDate) {
          const existing = get().sessions.find(
            s => s.date === date && s.dayKey === dayKey && !s.completedAt
          );
          if (existing) {
            set({ activeSession: existing, activeSessionStartTime: Date.now() });
            return;
          }
        }

        const exercises = get().exercises.filter(e => e.dayKey === dayKey);
        const newSession: WorkoutSession = {
          id: generateId(),
          date,
          startedAt,
          dayKey,
          exerciseLogs: exercises.map(e => ({ exerciseId: e.id, sets: [] })),
          completedAt: null,
          xpEarned: 0,
          durationMinutes: 0,
          isManual: !!customDate,
        };
        set(s => ({
          sessions: [...s.sessions, newSession],
          activeSession: newSession,
          activeSessionStartTime: Date.now(),
        }));
      },

      addSet: (exerciseId, setData) => {
        const newSet: WorkoutSet = { ...setData, id: generateId() };
        set(s => {
          if (!s.activeSession) return s;
          let logs = s.activeSession.exerciseLogs;
          const hasLog = logs.some(l => l.exerciseId === exerciseId);
          if (!hasLog) {
            logs = [...logs, { exerciseId, sets: [] }];
          }
          const updatedLogs = logs.map(log =>
            log.exerciseId !== exerciseId ? log : { ...log, sets: [...log.sets, newSet] }
          );
          const updatedSession = { ...s.activeSession, exerciseLogs: updatedLogs };
          return {
            activeSession: updatedSession,
            sessions: s.sessions.map(sess => sess.id === updatedSession.id ? updatedSession : sess),
          };
        });
      },

      deleteSet: (exerciseId, setId) => {
        set(s => {
          if (!s.activeSession) return s;
          const updatedLogs = s.activeSession.exerciseLogs.map(log =>
            log.exerciseId !== exerciseId ? log : { ...log, sets: log.sets.filter(st => st.id !== setId) }
          );
          const updatedSession = { ...s.activeSession, exerciseLogs: updatedLogs };
          return {
            activeSession: updatedSession,
            sessions: s.sessions.map(sess => sess.id === updatedSession.id ? updatedSession : sess),
          };
        });
      },

      updateSet: (exerciseId, setId, updates) => {
        set(s => {
          if (!s.activeSession) return s;
          const updatedLogs = s.activeSession.exerciseLogs.map(log =>
            log.exerciseId !== exerciseId ? log : {
              ...log,
              sets: log.sets.map(st => st.id === setId ? { ...st, ...updates } : st),
            }
          );
          const updatedSession = { ...s.activeSession, exerciseLogs: updatedLogs };
          return {
            activeSession: updatedSession,
            sessions: s.sessions.map(sess => sess.id === updatedSession.id ? updatedSession : sess),
          };
        });
      },

      completeSession: () => {
        set(s => {
          if (!s.activeSession) return s;
          const xp = calcSessionXP(s.activeSession.exerciseLogs, s.exercises);
          const startTime = s.activeSessionStartTime ?? Date.now();
          const durationMinutes = Math.round((Date.now() - startTime) / 60000);
          const completedSession: WorkoutSession = {
            ...s.activeSession,
            completedAt: new Date().toISOString(),
            xpEarned: xp,
            durationMinutes: Math.max(durationMinutes, 1),
          };
          return {
            sessions: s.sessions.map(sess => sess.id === completedSession.id ? completedSession : sess),
            activeSession: null,
            activeSessionStartTime: null,
            workoutTimer: null,
            profile: { ...s.profile, totalXP: s.profile.totalXP + xp, lastWorkoutDate: completedSession.date },
          };
        });
      },

      cancelSession: () => {
        set(s => {
          if (!s.activeSession) return s;
          return {
            sessions: s.sessions.filter(sess => sess.id !== s.activeSession!.id),
            activeSession: null,
            activeSessionStartTime: null,
            workoutTimer: null,
          };
        });
      },

      deleteSession: (id) => {
        set(s => {
          const session = s.sessions.find(sess => sess.id === id);
          const xpToRemove = session?.xpEarned ?? 0;
          return {
            sessions: s.sessions.filter(sess => sess.id !== id),
            profile: { ...s.profile, totalXP: Math.max(0, s.profile.totalXP - xpToRemove) },
          };
        });
      },

      // ── Workout Timer Actions ────────────────────────────────────────────────
      startWorkoutTimer: (targetMinutes) => {
        const sessionId = get().activeSession?.id ?? null;
        const timer: WorkoutTimerState = {
          targetMs: targetMinutes !== null ? targetMinutes * 60 * 1000 : null,
          startTime: Date.now(),
          elapsedMs: 0,
          isPaused: false,
          sessionId,
        };
        set({ workoutTimer: timer });
      },

      pauseWorkoutTimer: () => {
        set(s => {
          if (!s.workoutTimer || s.workoutTimer.isPaused) return s;
          const elapsed = s.workoutTimer.elapsedMs + (Date.now() - (s.workoutTimer.startTime ?? Date.now()));
          return {
            workoutTimer: { ...s.workoutTimer, elapsedMs: elapsed, startTime: null, isPaused: true }
          };
        });
      },

      resumeWorkoutTimer: () => {
        set(s => {
          if (!s.workoutTimer || !s.workoutTimer.isPaused) return s;
          return {
            workoutTimer: { ...s.workoutTimer, startTime: Date.now(), isPaused: false }
          };
        });
      },

      resetWorkoutTimer: () => {
        set(s => {
          if (!s.workoutTimer) return s;
          return {
            workoutTimer: {
              ...s.workoutTimer,
              startTime: Date.now(),
              elapsedMs: 0,
              isPaused: false,
            }
          };
        });
      },

      stopWorkoutTimer: () => {
        set({ workoutTimer: null });
      },

      // ── Body Weight Actions ──────────────────────────────────────────────────
      addBodyWeight: (entry) => {
        const newEntry: BodyWeightEntry = { ...entry, id: generateId() };
        set(s => {
          const filtered = s.bodyWeightEntries.filter(e => e.date !== entry.date);
          return { bodyWeightEntries: [...filtered, newEntry].sort((a, b) => a.date.localeCompare(b.date)) };
        });
      },

      deleteBodyWeight: (id) => {
        set(s => ({ bodyWeightEntries: s.bodyWeightEntries.filter(e => e.id !== id) }));
      },

      // ── Profile Actions ──────────────────────────────────────────────────────
      updateProfile: (updates) => {
        set(s => ({ profile: { ...s.profile, ...updates } }));
      },
    }),
    {
      name: 'netgain-v1',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      // Migration von altem cyber-fitness-v1 Schlüssel wird automatisch ignoriert
      // (neuer Schlüssel = frischer Start mit historischen Daten)
    }
  )
);
