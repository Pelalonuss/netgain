import { useState } from 'react';
import { WorkoutSet } from '../types';
import { useStore } from '../store/useStore';

interface SetRowProps {
  set: WorkoutSet;
  setIndex: number;
  exerciseId: string;
  isBodyweight: boolean;
  previousBest?: WorkoutSet | null;
}

export function SetRow({ set, setIndex, exerciseId, isBodyweight, previousBest }: SetRowProps) {
  const updateSet = useStore(s => s.updateSet);
  const deleteSet = useStore(s => s.deleteSet);
  const [editing, setEditing] = useState(false);
  const [repsVal, setRepsVal] = useState(set.reps.toString());
  const [weightVal, setWeightVal] = useState(set.weight.toString());

  const isPR = !isBodyweight && previousBest && set.weight > previousBest.weight;
  const isEqual = !isBodyweight && previousBest && set.weight === previousBest.weight;

  const commit = () => {
    const r = parseInt(repsVal) || set.reps;
    const w = parseFloat(weightVal) || set.weight;
    updateSet(exerciseId, set.id, { reps: r, weight: w });
    setEditing(false);
  };

  return (
    <div className={[
      'flex items-center gap-2 px-3 py-2 rounded transition-all duration-200',
      isPR ? 'bg-cyber-yellow/8 border border-cyber-yellow/20' : 'bg-cyber-gray-800/50',
    ].join(' ')}>
      {/* Set number */}
      <div className="w-6 flex-shrink-0 text-center">
        <span className="font-orbitron text-xs text-cyber-yellow/50">{setIndex + 1}</span>
      </div>

      {/* PR badge */}
      {isPR && <span className="pr-badge">PR!</span>}
      {isEqual && <span className="font-orbitron text-[9px] text-cyber-cyan/70 border border-cyber-cyan/30 px-1">TIE</span>}

      {editing ? (
        <>
          <div className="flex items-center gap-1 flex-1">
            <input
              type="number"
              value={repsVal}
              onChange={e => setRepsVal(e.target.value)}
              onBlur={commit}
              onKeyDown={e => e.key === 'Enter' && commit()}
              autoFocus
              className="cyber-input w-14 px-2 py-1 text-center text-sm rounded"
            />
            <span className="font-rajdhani text-cyber-yellow/50 text-xs">wdh</span>
            {!isBodyweight && (
              <>
                <input
                  type="number"
                  value={weightVal}
                  onChange={e => setWeightVal(e.target.value)}
                  onBlur={commit}
                  onKeyDown={e => e.key === 'Enter' && commit()}
                  className="cyber-input w-16 px-2 py-1 text-center text-sm rounded"
                  step="0.5"
                />
                <span className="font-rajdhani text-cyber-yellow/50 text-xs">kg</span>
              </>
            )}
          </div>
          <button onClick={commit} className="text-cyber-yellow font-orbitron text-xs px-2 py-1 border border-cyber-yellow/40 hover:border-cyber-yellow rounded">✓</button>
        </>
      ) : (
        <>
          <div className="flex-1 flex items-center gap-3">
            <span className="font-rajdhani font-bold text-cyber-yellow text-base">{set.reps} WDH</span>
            {!isBodyweight && (
              <span className="font-rajdhani font-bold text-cyber-yellow text-base">{set.weight} KG</span>
            )}
            {isBodyweight && (
              <span className="font-rajdhani text-cyber-yellow/40 text-xs">KÖRPERGEWICHT</span>
            )}
          </div>
          <button
            onClick={() => setEditing(true)}
            className="text-cyber-yellow/40 hover:text-cyber-yellow transition-colors p-1"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button
            onClick={() => deleteSet(exerciseId, set.id)}
            className="text-cyber-magenta/40 hover:text-cyber-magenta transition-colors p-1"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
