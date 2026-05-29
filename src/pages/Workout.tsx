import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ExerciseCard } from '../components/ExerciseCard';
import { GlitchButton } from '../components/GlitchButton';
import { RestTimer } from '../components/RestTimer';
import { WorkoutTimer } from '../components/WorkoutTimer';
import {
  DAY_LABELS, DAY_SUBTITLE, DAY_COLOR, formatTimestamp, formatDuration, todayStr
} from '../utils/helpers';
import { DayKey } from '../types';
import { calcSessionXP } from '../utils/xp';

const DAYS: DayKey[] = ['monday', 'tuesday', 'wednesday'];

export function Workout() {
  const navigate = useNavigate();
  const {
    exercises, activeSession, sessions, profile,
    startSession, completeSession, cancelSession,
  } = useStore();

  const [timerOpen, setTimerOpen]         = useState(false);
  const [confirmCancel, setConfirmCancel]  = useState(false);
  const [showComplete, setShowComplete]    = useState(false);
  const [completedXP, setCompletedXP]     = useState(0);
  const [completedLevelUp, setCompletedLevelUp] = useState(false); // BUG FIX: capture BEFORE store update

  // Manual Entry State
  const [showManual, setShowManual] = useState(false);
  const [manualDay, setManualDay]   = useState<DayKey>('monday');
  const [manualDate, setManualDate] = useState(todayStr());
  const [manualTime, setManualTime] = useState('09:00');

  // Preview XP & Level (for display while session is active)
  const previewXP   = activeSession ? calcSessionXP(activeSession.exerciseLogs, exercises) : 0;
  const previewLevel = Math.floor((profile.totalXP + previewXP) / 1000) + 1;
  const currentLevel = Math.floor(profile.totalXP / 1000) + 1;

  const handleComplete = () => {
    const xp = calcSessionXP(activeSession!.exerciseLogs, exercises);
    // WICHTIG: willLevelUp VOR completeSession() prüfen, sonst ist activeSession null
    const newTotalXP = profile.totalXP + xp;
    const lvlBefore  = Math.floor(profile.totalXP / 1000) + 1;
    const lvlAfter   = Math.floor(newTotalXP / 1000) + 1;
    setCompletedLevelUp(lvlAfter > lvlBefore);
    setCompletedXP(xp);
    completeSession();
    setShowComplete(true);
    setTimeout(() => { setShowComplete(false); navigate('/'); }, 2800);
  };

  const handleCancel = () => { cancelSession(); setConfirmCancel(false); };

  const handleStartManual = () => {
    startSession(manualDay, manualDate, manualTime);
    setShowManual(false);
  };

  // ── Kein aktives Training → Template-Auswahl ──────────────────────────────
  if (!activeSession) {
    return (
      <div className="flex flex-col gap-4 p-4 page-enter safe-top pt-6">
        <div>
          <div className="font-orbitron text-cyber-yellow/40 text-[10px] tracking-[0.3em] mb-1">TRAINING WÄHLEN</div>
          <h1 className="font-orbitron font-black text-cyber-yellow text-2xl neon-text">WORKOUT</h1>
          <p className="font-rajdhani text-cyber-yellow/40 text-sm mt-0.5">
            Starte ein Training oder trage es manuell nach
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {DAYS.map(day => {
            const dayExercises = exercises.filter(e => e.dayKey === day);
            const daySessions = [...sessions]
              .filter(s => s.dayKey === day && s.completedAt)
              .sort((a, b) => b.date.localeCompare(a.date));
            const lastSession = daySessions[0];
            const color = DAY_COLOR[day];

            return (
              <div key={day} className="cyber-card overflow-hidden">
                {/* Color header strip */}
                <div className="h-1 w-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-orbitron font-black text-lg" style={{ color }}>{DAY_LABELS[day]}</div>
                      <div className="font-rajdhani text-cyber-yellow/50 text-xs mt-0.5">{DAY_SUBTITLE[day]}</div>
                    </div>
                    {lastSession && (
                      <div className="text-right">
                        <div className="font-rajdhani text-cyber-yellow/30 text-[10px]">ZULETZT</div>
                        <div className="font-orbitron text-cyber-yellow/50 text-xs">{lastSession.date}</div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1 mb-3">
                    {dayExercises.map(ex => (
                      <div key={ex.id} className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: color, opacity: 0.6 }} />
                        <span className="font-rajdhani text-cyber-yellow/60 text-sm">{ex.name}</span>
                        {ex.isBodyweight && (
                          <span className="font-orbitron text-[9px] text-cyber-cyan/60 border border-cyber-cyan/20 px-1">BW</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <GlitchButton
                      fullWidth
                      onClick={() => startSession(day)}
                      variant="primary"
                      size="md"
                    >
                      ⚡ HEUTE STARTEN
                    </GlitchButton>
                    <button
                      onClick={() => { setManualDay(day); setShowManual(true); }}
                      className="px-3 py-2 border border-cyber-yellow/30 text-cyber-yellow/50 hover:border-cyber-yellow hover:text-cyber-yellow font-orbitron text-xs transition-all"
                      title="Manuell nachträglich eintragen"
                    >
                      ↩
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Manual Entry global button */}
        <button
          onClick={() => setShowManual(true)}
          className="w-full py-3 border border-cyber-yellow/20 text-cyber-yellow/40 hover:border-cyber-yellow/50 hover:text-cyber-yellow/70 font-orbitron text-xs tracking-widest transition-all"
        >
          + TRAINING NACHTRÄGLICH EINTRAGEN
        </button>

        {/* Manual Entry Modal */}
        {showManual && (
          <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setShowManual(false)}>
            <div className="modal-sheet p-5">
              <div className="w-10 h-1 rounded-full bg-cyber-yellow/30 mx-auto mb-4" />
              <h3 className="font-orbitron font-bold text-cyber-yellow text-sm tracking-widest mb-4 text-center">
                TRAINING EINTRAGEN
              </h3>

              <div className="flex flex-col gap-3">
                {/* Datum */}
                <div>
                  <label className="font-rajdhani text-cyber-yellow/50 text-xs tracking-wider block mb-1">DATUM</label>
                  <input
                    type="date"
                    value={manualDate}
                    onChange={e => setManualDate(e.target.value)}
                    className="cyber-input w-full px-3 py-2.5 rounded text-sm"
                    style={{ colorScheme: 'dark' }}
                    max={todayStr()}
                  />
                </div>

                {/* Uhrzeit */}
                <div>
                  <label className="font-rajdhani text-cyber-yellow/50 text-xs tracking-wider block mb-1">UHRZEIT (ca.)</label>
                  <input
                    type="time"
                    value={manualTime}
                    onChange={e => setManualTime(e.target.value)}
                    className="cyber-input w-full px-3 py-2.5 rounded text-sm"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>

                {/* Template */}
                <div>
                  <label className="font-rajdhani text-cyber-yellow/50 text-xs tracking-wider block mb-1">TRAINING TYP</label>
                  <div className="flex gap-2">
                    {DAYS.map(d => (
                      <button
                        key={d}
                        onClick={() => setManualDay(d)}
                        className={[
                          'flex-1 py-2 font-orbitron text-xs border transition-all',
                          manualDay === d
                            ? 'border-cyber-yellow bg-cyber-yellow text-black font-black'
                            : 'border-cyber-yellow/30 text-cyber-yellow/50 hover:border-cyber-yellow hover:text-cyber-yellow',
                        ].join(' ')}
                      >
                        {DAY_LABELS[d].split(' ')[0]}
                      </button>
                    ))}
                  </div>
                  <div className="font-rajdhani text-cyber-yellow/40 text-xs mt-1 text-center">
                    {DAY_SUBTITLE[manualDay]}
                  </div>
                </div>

                <div className="flex gap-3 mt-1">
                  <GlitchButton fullWidth onClick={() => setShowManual(false)} variant="secondary">
                    ABBRECHEN
                  </GlitchButton>
                  <GlitchButton fullWidth onClick={handleStartManual} variant="primary">
                    EINTRAGEN
                  </GlitchButton>
                </div>
              </div>
              <div className="h-4" />
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Aktives Training ──────────────────────────────────────────────────────
  const sessionExercises = exercises
    .filter(e => e.dayKey === activeSession.dayKey)
    .sort((a, b) => a.order - b.order);

  const totalSets = activeSession.exerciseLogs.reduce((sum, l) => sum + l.sets.length, 0);
  const color = DAY_COLOR[activeSession.dayKey];

  return (
    <div className="flex flex-col gap-3 p-4 pb-2 page-enter">
      {/* Header */}
      <div className="flex items-start justify-between safe-top pt-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#FF0080', boxShadow: '0 0 6px #FF0080' }} />
            <span className="font-orbitron text-cyber-magenta text-[10px] tracking-widest">LIVE SESSION</span>
            {activeSession.isManual && (
              <span className="font-orbitron text-cyber-cyan/60 text-[9px] border border-cyber-cyan/20 px-1">MANUELL</span>
            )}
          </div>
          <h1 className="font-orbitron font-black text-xl" style={{ color, textShadow: `0 0 10px ${color}` }}>
            {DAY_LABELS[activeSession.dayKey]}
          </h1>
          <div className="font-rajdhani text-cyber-yellow/50 text-xs">{DAY_SUBTITLE[activeSession.dayKey]}</div>
          <div className="font-rajdhani text-cyber-yellow/30 text-xs mt-0.5">
            📅 {formatTimestamp(activeSession.startedAt)}
          </div>
        </div>
        <div className="text-right">
          <div className="font-orbitron font-bold text-cyber-yellow text-sm">+{previewXP}</div>
          <div className="font-rajdhani text-cyber-yellow/40 text-xs">XP VORSCHAU</div>
          <div className="font-rajdhani text-cyber-yellow/30 text-xs">{totalSets} Sets</div>
          {previewLevel > currentLevel && (
              <div className="font-orbitron text-cyber-cyan text-[10px] animate-pulse mt-0.5">LEVEL UP!</div>
            )}
        </div>
      </div>

      {/* Workout Timer */}
      <WorkoutTimer />

      {/* Exercise Cards */}
      <div className="flex flex-col gap-3">
        {sessionExercises.map(ex => (
          <ExerciseCard
            key={ex.id}
            exercise={ex}
            onTimerOpen={() => setTimerOpen(true)}
          />
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <GlitchButton
          onClick={() => setConfirmCancel(true)}
          variant="danger"
          size="md"
          className="px-3"
        >
          ✕
        </GlitchButton>
        <GlitchButton
          fullWidth
          onClick={handleComplete}
          variant="primary"
          size="lg"
        >
          ✓ ABSCHLIESSEN
        </GlitchButton>
        <button
          onClick={() => setTimerOpen(true)}
          className="p-3 border border-cyber-yellow/30 text-cyber-yellow/60 hover:border-cyber-yellow hover:text-cyber-yellow rounded transition-all"
          title="Rest Timer"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        </button>
      </div>

      {/* Rest Timer Modal – kein Box-Container, Timer schwebt frei */}
      {timerOpen && (
        <div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(6px)' }}
          onClick={e => e.target === e.currentTarget && setTimerOpen(false)}
        >
          {/* Ambient Glow Hintergrund – weicher Lichtschein */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 340, height: 340,
              background: 'radial-gradient(circle, rgba(243,230,0,0.06) 0%, transparent 70%)',
            }}
          />
          <RestTimer onClose={() => setTimerOpen(false)} />
        </div>
      )}

      {/* Cancel Confirm */}
      {confirmCancel && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setConfirmCancel(false)}>
          <div className="modal-sheet p-6">
            <div className="w-10 h-1 rounded-full bg-cyber-yellow/30 mx-auto mb-4" />
            <h3 className="font-orbitron font-bold text-cyber-magenta text-center mb-2">SESSION ABBRECHEN?</h3>
            <p className="font-rajdhani text-cyber-yellow/60 text-sm text-center mb-6">
              Alle eingetragenen Sets gehen verloren. Kein XP wird gespeichert.
            </p>
            <div className="flex gap-3">
              <GlitchButton fullWidth onClick={() => setConfirmCancel(false)} variant="secondary">ZURÜCK</GlitchButton>
              <GlitchButton fullWidth onClick={handleCancel} variant="danger">ABBRECHEN</GlitchButton>
            </div>
            <div className="h-4" />
          </div>
        </div>
      )}

      {/* Completion Flash */}
      {showComplete && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/95">
          <div className="text-center level-up-anim">
            <div className="font-orbitron font-black text-cyber-yellow text-6xl mb-4 neon-text">DONE!</div>
            <div className="font-orbitron text-cyber-yellow/80 text-2xl mb-2">+{completedXP} XP</div>
            {completedLevelUp && (
              <div className="font-orbitron text-cyber-cyan text-2xl animate-pulse mt-2 neon-text-cyan">
                ⬆ LEVEL UP!
              </div>
            )}
            <div className="font-rajdhani text-cyber-yellow/40 text-sm mt-4">{totalSets} Sets abgeschlossen</div>
          </div>
        </div>
      )}
    </div>
  );
}
