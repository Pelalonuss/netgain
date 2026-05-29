export type DayKey = 'monday' | 'tuesday' | 'wednesday';
export type CategoryKey = 'push' | 'pull' | 'legs_abs';

export interface Exercise {
  id: string;
  name: string;
  dayKey: DayKey;
  category: CategoryKey;
  isBodyweight: boolean;
  order: number;
}

export interface WorkoutSet {
  id: string;
  reps: number;
  weight: number;
}

export interface ExerciseLog {
  exerciseId: string;
  sets: WorkoutSet[];
}

export interface WorkoutSession {
  id: string;
  date: string;            // YYYY-MM-DD (kann auch vergangene Daten sein)
  startedAt: string;       // ISO Timestamp wann Session gestartet wurde
  dayKey: DayKey;          // Trainings-Template (Push/Pull/Legs)
  exerciseLogs: ExerciseLog[];
  completedAt: string | null;
  xpEarned: number;
  durationMinutes: number;
  isManual: boolean;       // true = manuell nachgetragen
}

export interface WorkoutTimerState {
  targetMs: number | null;    // Ziel-Dauer in ms; null = nur aufwärts zählen
  startTime: number | null;   // Date.now() bei letztem Start/Resume
  elapsedMs: number;          // akkumulierte ms vor letzter Pause
  isPaused: boolean;
  sessionId: string | null;   // zugehörige Session
}

export interface BodyWeightEntry {
  id: string;
  date: string;
  weight: number;
}

export interface UserProfile {
  name: string;
  totalXP: number;
  streak: number;
  lastWorkoutDate: string | null;
}

export interface AppState {
  exercises: Exercise[];
  sessions: WorkoutSession[];
  bodyWeightEntries: BodyWeightEntry[];
  profile: UserProfile;
  activeSession: WorkoutSession | null;
  activeSessionStartTime: number | null;
  workoutTimer: WorkoutTimerState | null;

  // Exercise
  addExercise: (ex: Omit<Exercise, 'id' | 'order'>) => void;
  deleteExercise: (id: string) => void;
  updateExercise: (id: string, updates: Partial<Exercise>) => void;

  // Session
  startSession: (dayKey: DayKey, customDate?: string, customTime?: string) => void;
  deleteSession: (id: string) => void;
  addSet: (exerciseId: string, set: Omit<WorkoutSet, 'id'>) => void;
  deleteSet: (exerciseId: string, setId: string) => void;
  updateSet: (exerciseId: string, setId: string, updates: Partial<WorkoutSet>) => void;
  completeSession: () => void;
  cancelSession: () => void;

  // Workout Timer
  startWorkoutTimer: (targetMinutes: number | null) => void;
  pauseWorkoutTimer: () => void;
  resumeWorkoutTimer: () => void;
  resetWorkoutTimer: () => void;
  stopWorkoutTimer: () => void;

  // Body Weight
  addBodyWeight: (entry: Omit<BodyWeightEntry, 'id'>) => void;
  deleteBodyWeight: (id: string) => void;

  // Profile
  updateProfile: (updates: Partial<UserProfile>) => void;
}
