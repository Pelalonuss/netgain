import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { formatMs, formatMsShort } from '../utils/helpers';
import { GlitchButton } from './GlitchButton';

const PRESET_DURATIONS = [
  { label: '30 MIN', minutes: 30 },
  { label: '45 MIN', minutes: 45 },
  { label: '60 MIN', minutes: 60 },
  { label: '75 MIN', minutes: 75 },
  { label: '90 MIN', minutes: 90 },
];

export function WorkoutTimer() {
  const {
    workoutTimer,
    startWorkoutTimer,
    pauseWorkoutTimer,
    resumeWorkoutTimer,
    resetWorkoutTimer,
    stopWorkoutTimer,
  } = useStore();

  const [elapsedMs, setElapsedMs] = useState(0);
  const [showSetup, setShowSetup] = useState(false);
  const [customMin, setCustomMin] = useState('');
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevFinished = useRef(false);

  // Tick – berechnet Elapsed Time aus persistiertem State
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (!workoutTimer) {
      setElapsedMs(0);
      setFinished(false);
      prevFinished.current = false;
      return;
    }

    const tick = () => {
      const timer = useStore.getState().workoutTimer;
      if (!timer) return;
      const live = timer.isPaused
        ? timer.elapsedMs
        : timer.elapsedMs + (Date.now() - (timer.startTime ?? Date.now()));
      setElapsedMs(live);

      if (timer.targetMs && live >= timer.targetMs && !prevFinished.current) {
        prevFinished.current = true;
        setFinished(true);
        if ('vibrate' in navigator) navigator.vibrate([300, 100, 300, 100, 300]);
      }
    };

    tick(); // sofortiger erster Tick
    intervalRef.current = setInterval(tick, 500);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [workoutTimer?.startTime, workoutTimer?.isPaused, workoutTimer?.targetMs]);

  const targetMs = workoutTimer?.targetMs ?? null;
  const isPaused  = workoutTimer?.isPaused ?? false;
  const progress  = targetMs ? Math.min(elapsedMs / targetMs, 1) : 0;
  const remaining = targetMs ? Math.max(targetMs - elapsedMs, 0) : null;

  // Farbe abhängig vom Fortschritt
  const getBarColor = () => {
    if (!targetMs) return '#F3E600';
    if (progress >= 1)    return '#FF0080';
    if (progress >= 0.8)  return '#FF6B00';
    if (progress >= 0.6)  return '#00D4FF';
    return '#F3E600';
  };

  const barColor = getBarColor();

  // Kein Timer aktiv → Setup-Screen anzeigen
  if (!workoutTimer) {
    return (
      <div className="cyber-card p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F3E600" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <span className="font-orbitron text-cyber-yellow text-xs tracking-widest">TRAINING TIMER</span>
          </div>
          {!showSetup && (
            <GlitchButton size="sm" variant="secondary" onClick={() => setShowSetup(true)}>
              TIMER SETZEN
            </GlitchButton>
          )}
        </div>

        {showSetup && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              {PRESET_DURATIONS.map(p => (
                <button
                  key={p.minutes}
                  onClick={() => { startWorkoutTimer(p.minutes); setShowSetup(false); setFinished(false); prevFinished.current = false; }}
                  className="font-orbitron text-xs px-3 py-1.5 border border-cyber-yellow/40 text-cyber-yellow/70 hover:border-cyber-yellow hover:text-cyber-yellow transition-all"
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                value={customMin}
                onChange={e => setCustomMin(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    const v = parseInt(customMin);
                    if (v > 0 && v <= 300) { startWorkoutTimer(v); setShowSetup(false); setCustomMin(''); setFinished(false); prevFinished.current = false; }
                  }
                }}
                placeholder="Min. eingeben..."
                className="cyber-input flex-1 px-3 py-2 text-sm rounded"
              />
              <GlitchButton
                size="sm"
                variant="primary"
                onClick={() => {
                  const v = parseInt(customMin);
                  if (v > 0 && v <= 300) { startWorkoutTimer(v); setShowSetup(false); setCustomMin(''); setFinished(false); prevFinished.current = false; }
                }}
              >
                OK
              </GlitchButton>
              <GlitchButton
                size="sm"
                variant="ghost"
                onClick={() => { startWorkoutTimer(null); setShowSetup(false); setFinished(false); prevFinished.current = false; }}
              >
                OHNE ZIEL
              </GlitchButton>
            </div>
            <button onClick={() => setShowSetup(false)} className="font-orbitron text-cyber-yellow/30 text-xs hover:text-cyber-yellow/60 text-center">
              ABBRECHEN
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── Timer läuft ─────────────────────────────────────────────────────────────
  const fillPct = targetMs ? (1 - progress) * 100 : 0; // wie viel Balken noch übrig

  return (
    <div className={[
      'cyber-card overflow-hidden transition-all duration-300',
      finished ? 'border-cyber-magenta' : '',
    ].join(' ')} style={finished ? { boxShadow: '0 0 20px rgba(255,0,128,0.4)' } : {}}>

      {/* ─ Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 pt-2.5 pb-1">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: barColor,
              boxShadow: `0 0 6px ${barColor}`,
              animation: !isPaused ? 'pulseCyber 1.5s ease-in-out infinite' : 'none',
            }}
          />
          <span className="font-orbitron text-[10px] tracking-[0.2em]" style={{ color: barColor }}>
            TRAINING TIMER {isPaused ? '· PAUSIERT' : finished ? '· FERTIG!' : '· LÄUFT'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {/* Pause / Resume */}
          <button
            onClick={() => isPaused ? resumeWorkoutTimer() : pauseWorkoutTimer()}
            className="p-1.5 border border-cyber-yellow/30 text-cyber-yellow/60 hover:border-cyber-yellow hover:text-cyber-yellow rounded transition-all"
            title={isPaused ? 'Fortsetzen' : 'Pause'}
          >
            {isPaused ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            )}
          </button>
          {/* Reset */}
          <button
            onClick={() => { resetWorkoutTimer(); setFinished(false); prevFinished.current = false; }}
            className="p-1.5 border border-cyber-yellow/30 text-cyber-yellow/60 hover:border-cyber-yellow hover:text-cyber-yellow rounded transition-all"
            title="Zurücksetzen"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
            </svg>
          </button>
          {/* Stop */}
          <button
            onClick={() => { stopWorkoutTimer(); setFinished(false); prevFinished.current = false; }}
            className="p-1.5 border border-cyber-magenta/30 text-cyber-magenta/60 hover:border-cyber-magenta hover:text-cyber-magenta rounded transition-all"
            title="Timer beenden"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
          </button>
        </div>
      </div>

      {/* ─ Timer Bar ───────────────────────────────────────────────────────── */}
      {targetMs ? (
        <div className="px-3 pb-1">
          <div className="relative h-5 bg-black border border-cyber-yellow/20 overflow-hidden rounded-sm">
            {/* Remaining fill */}
            <div
              className="absolute left-0 top-0 h-full transition-none"
              style={{
                width: `${fillPct}%`,
                background: `linear-gradient(90deg, ${barColor}88 0%, ${barColor}BB 70%, ${barColor} 90%, #FFFFFF 100%)`,
                boxShadow: `0 0 12px ${barColor}`,
                transition: isPaused ? 'none' : 'width 0.5s linear',
              }}
            >
              {/* Shimmer */}
              {!isPaused && !finished && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                    animation: 'xpShimmer 2s ease-in-out infinite',
                  }}
                />
              )}
              {/* Pulsing right edge */}
              {!finished && fillPct > 2 && (
                <div
                  className="absolute right-0 top-0 h-full w-1.5"
                  style={{
                    background: barColor,
                    boxShadow: `0 0 8px ${barColor}, 0 0 16px ${barColor}`,
                    animation: 'pulseCyber 0.8s ease-in-out infinite',
                  }}
                />
              )}
            </div>
            {/* Tick marks */}
            {[0.25, 0.5, 0.75].map(p => (
              <div
                key={p}
                className="absolute top-0 h-full w-px bg-black/60 z-10"
                style={{ left: `${p * 100}%` }}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Kein Ziel: einfacher Puls-Balken */
        <div className="px-3 pb-1">
          <div className="h-2 bg-black border border-cyber-yellow/20 overflow-hidden rounded-sm">
            <div
              className="h-full"
              style={{
                width: '30%',
                background: `linear-gradient(90deg, transparent, ${barColor}, transparent)`,
                animation: 'xpShimmer 2s ease-in-out infinite',
              }}
            />
          </div>
        </div>
      )}

      {/* ─ Time Display ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 pb-2.5">
        <div>
          <div className="font-rajdhani text-cyber-yellow/40 text-[9px] tracking-wider">VERGANGEN</div>
          <div className="font-orbitron font-black text-sm tabular-nums" style={{ color: barColor }}>
            {formatMs(elapsedMs)}
          </div>
        </div>
        {targetMs && (
          <div className="text-center">
            <div className="font-orbitron font-black text-xl tabular-nums"
              style={{ color: barColor, textShadow: `0 0 12px ${barColor}` }}>
              {finished ? 'DONE!' : formatMsShort(remaining ?? 0)}
            </div>
            {!finished && (
              <div className="font-rajdhani text-[9px] tracking-wider" style={{ color: `${barColor}80` }}>
                VERBLEIBEND
              </div>
            )}
          </div>
        )}
        {targetMs && (
          <div className="text-right">
            <div className="font-rajdhani text-cyber-yellow/40 text-[9px] tracking-wider">ZIEL</div>
            <div className="font-orbitron text-sm text-cyber-yellow/60 tabular-nums">
              {formatMsShort(targetMs)}
            </div>
          </div>
        )}
      </div>

      {/* Finished Banner */}
      {finished && (
        <div className="flex items-center justify-center gap-2 pb-2.5 animate-pulse">
          <span className="font-orbitron text-cyber-magenta text-xs tracking-widest neon-text-magenta">
            ⚡ TRAINING ABGESCHLOSSEN! ⚡
          </span>
        </div>
      )}
    </div>
  );
}
