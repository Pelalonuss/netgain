import { useState } from 'react';
import { Exercise, WorkoutSet } from '../types';
import { useStore } from '../store/useStore';
import { SetRow } from './SetRow';
import { GlitchButton } from './GlitchButton';
import { getMaxWeightForExercise } from '../utils/helpers';

interface ExerciseCardProps {
  exercise: Exercise;
  onTimerOpen?: () => void;
}

export function ExerciseCard({ exercise, onTimerOpen }: ExerciseCardProps) {
  const addSet = useStore(s => s.addSet);
  const sessions = useStore(s => s.sessions);
  const activeSession = useStore(s => s.activeSession);

  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [collapsed, setCollapsed] = useState(false);

  const log = activeSession?.exerciseLogs.find(l => l.exerciseId === exercise.id);
  const sets = log?.sets ?? [];

  const maxWeight = getMaxWeightForExercise(exercise.id, sessions.filter(s => s.completedAt));

  const previousSets: WorkoutSet[] = (() => {
    const prevSessions = [...sessions]
      .filter(s => s.completedAt && s.dayKey === activeSession?.dayKey && s.id !== activeSession?.id)
      .sort((a, b) => b.date.localeCompare(a.date));
    if (prevSessions.length === 0) return [];
    const prevLog = prevSessions[0].exerciseLogs.find(l => l.exerciseId === exercise.id);
    return prevLog?.sets ?? [];
  })();

  const handleAddSet = () => {
    const r = parseInt(reps);
    const w = exercise.isBodyweight ? 0 : parseFloat(weight);
    if (!r || r <= 0) return;
    if (!exercise.isBodyweight && (isNaN(w) || w < 0)) return;
    addSet(exercise.id, { reps: r, weight: w });
    setReps('');
    if (!exercise.isBodyweight) setWeight('');
    onTimerOpen?.();
  };

  const totalVolume = sets.reduce((sum, s) => sum + s.reps * (exercise.isBodyweight ? 1 : s.weight), 0);

  return (
    <div className="cyber-card rounded overflow-hidden slide-up">
      {/* Header */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full flex items-center justify-between p-3 bg-cyber-gray-800 active:bg-cyber-gray-700 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-1 h-8 bg-cyber-yellow rounded-full"
            style={{ boxShadow: '0 0 6px #F3E600' }} />
          <div className="text-left">
            <div className="font-orbitron font-bold text-cyber-yellow text-sm tracking-wide">
              {exercise.name.toUpperCase()}
            </div>
            <div className="font-rajdhani text-cyber-yellow/40 text-xs mt-0.5">
              {sets.length} Sets
              {totalVolume > 0 && ` · ${totalVolume.toFixed(0)} VOL`}
              {maxWeight > 0 && ` · MAX: ${maxWeight}kg`}
              {exercise.isBodyweight && ' · BODYWEIGHT'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {sets.length > 0 && (
            <div className="w-5 h-5 rounded-full border border-cyber-yellow/50 flex items-center justify-center">
              <span className="font-orbitron text-cyber-yellow text-[10px]">{sets.length}</span>
            </div>
          )}
          <span className={`text-cyber-yellow/40 text-xs transition-transform ${collapsed ? 'rotate-180' : ''}`}>▼</span>
        </div>
      </button>

      {!collapsed && (
        <div className="p-3 flex flex-col gap-2">
          {/* Previous session reference */}
          {previousSets.length > 0 && (
            <div className="text-xs font-rajdhani text-cyber-yellow/30 px-2 pb-1 border-b border-cyber-yellow/10">
              LETZTES MAL:&nbsp;
              {previousSets.slice(0, 3).map((ps, i) => (
                <span key={i}>
                  {i > 0 && ' | '}{ps.reps}wdh{!exercise.isBodyweight && ` × ${ps.weight}kg`}
                </span>
              ))}
            </div>
          )}

          {/* Sets */}
          {sets.map((set, i) => (
            <SetRow
              key={set.id}
              set={set}
              setIndex={i}
              exerciseId={exercise.id}
              isBodyweight={exercise.isBodyweight}
              previousBest={previousSets[i] ?? null}
            />
          ))}

          {/* Add set form */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="number"
              value={reps}
              onChange={e => setReps(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddSet()}
              placeholder="WDH"
              className="cyber-input w-20 px-2 py-2 text-center text-sm rounded"
            />
            {!exercise.isBodyweight && (
              <input
                type="number"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddSet()}
                placeholder="KG"
                className="cyber-input w-20 px-2 py-2 text-center text-sm rounded"
                step="0.5"
              />
            )}
            <GlitchButton
              onClick={handleAddSet}
              variant="primary"
              size="sm"
              className="flex-1"
            >
              + SET
            </GlitchButton>
            {onTimerOpen && (
              <button
                onClick={onTimerOpen}
                className="p-2 border border-cyber-yellow/30 text-cyber-yellow/60 hover:text-cyber-yellow hover:border-cyber-yellow rounded transition-all"
                title="Rest Timer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
