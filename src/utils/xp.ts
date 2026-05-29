import { WorkoutSet, Exercise, ExerciseLog } from '../types';

export const XP_PER_LEVEL = 1000;

export function calcSetXP(set: WorkoutSet, exercise: Exercise): number {
  if (exercise.isBodyweight) {
    return set.reps * 5;
  }
  return Math.max(1, Math.round(set.reps * set.weight * 0.1));
}

export function calcSessionXP(logs: ExerciseLog[], exercises: Exercise[]): number {
  let total = 0;
  for (const log of logs) {
    const ex = exercises.find(e => e.id === log.exerciseId);
    if (!ex) continue;
    for (const set of log.sets) {
      total += calcSetXP(set, ex);
    }
  }
  return total + 50; // +50 XP bonus for completing a session
}

export function getLevel(totalXP: number): number {
  return Math.floor(totalXP / XP_PER_LEVEL) + 1;
}

export function getLevelProgress(totalXP: number): number {
  return (totalXP % XP_PER_LEVEL) / XP_PER_LEVEL;
}

export function getXPInCurrentLevel(totalXP: number): number {
  return totalXP % XP_PER_LEVEL;
}

export function getLevelTitle(level: number): string {
  if (level < 5)  return 'ROOKIE';
  if (level < 10) return 'RUNNER';
  if (level < 20) return 'STREET SAM';
  if (level < 35) return 'NETRUNNER';
  if (level < 50) return 'CORPO ELITE';
  if (level < 75) return 'LEGEND';
  return 'CHROME GOD';
}
