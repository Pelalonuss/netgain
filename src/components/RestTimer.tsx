import { useState, useEffect, useRef, useCallback } from 'react';
import { GlitchButton } from './GlitchButton';

interface RestTimerProps {
  onClose?: () => void;
}

const PRESET_TIMES = [30, 45, 60, 90, 120, 180];

export function RestTimer({ onClose }: RestTimerProps) {
  const [duration, setDuration] = useState(60);
  const [remaining, setRemaining] = useState(60);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Großer Ring – kein Container-Rand sichtbar
  const SIZE = 260;
  const STROKE = 16;
  const R = (SIZE - STROKE) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * R;
  const progress = remaining / duration;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRemaining(duration);
    setRunning(false);
    setFinished(false);
  }, [duration]);

  const setTime = (secs: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setDuration(secs);
    setRemaining(secs);
    setRunning(false);
    setFinished(false);
  };

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setRunning(false);
          setFinished(true);
          if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  useEffect(() => { reset(); }, [duration]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const getColor = () => {
    if (finished) return '#FF0080';
    if (progress < 0.25) return '#FF0080';
    if (progress < 0.5) return '#00D4FF';
    return '#F3E600';
  };

  const color = getColor();

  const handleCustom = () => {
    const val = parseInt(customInput);
    if (!isNaN(val) && val > 0 && val <= 600) {
      setTime(val);
      setCustomInput('');
    }
  };

  return (
    // Kein Hintergrund, kein Border – Timer schwebt frei auf dem dunklen Overlay
    <div className="flex flex-col items-center gap-5 pt-2 pb-4 px-4">

      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <span className="font-orbitron font-bold tracking-[0.25em] text-xs"
          style={{ color, textShadow: `0 0 10px ${color}` }}>
          REST TIMER
        </span>
        {onClose && (
          <button
            onClick={onClose}
            className="font-orbitron text-xs tracking-widest opacity-40 hover:opacity-100 transition-opacity"
            style={{ color }}
          >
            ✕ CLOSE
          </button>
        )}
      </div>

      {/* Preset Zeit-Buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        {PRESET_TIMES.map(t => (
          <button
            key={t}
            onClick={() => setTime(t)}
            className="font-orbitron text-xs px-3 py-1.5 transition-all"
            style={
              duration === t && !running
                ? { background: color, color: '#000', fontWeight: 900 }
                : { border: `1px solid ${color}44`, color: `${color}99` }
            }
          >
            {t < 60 ? `${t}s` : `${t / 60}m`}
          </button>
        ))}
      </div>

      {/* Custom Input */}
      <div className="flex gap-2 w-full max-w-xs">
        <input
          type="number"
          value={customInput}
          onChange={e => setCustomInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCustom()}
          placeholder="Sek. eingeben..."
          className="cyber-input flex-1 px-3 py-2 text-sm rounded"
        />
        <GlitchButton size="sm" onClick={handleCustom} variant="secondary">SET</GlitchButton>
      </div>

      {/* ── SVG Ring – kein Container, nur Glow ── */}
      <div
        className="relative flex items-center justify-center"
        style={{
          // Leuchtendes Halo rings um den Kreis – kein Box-Schatten der Ränder zeigt
          filter: `drop-shadow(0 0 24px ${color}) drop-shadow(0 0 48px ${color}55)`,
        }}
      >
        <svg
          width={SIZE}
          height={SIZE}
          style={{ overflow: 'visible' }} // Glow darf über den SVG-Rand hinaus strahlen
          className="rotate-[-90deg]"
        >
          {/* Dunkle Hintergrundspur – sehr subtil */}
          <circle
            cx={SIZE / 2} cy={SIZE / 2} r={R}
            fill="none"
            stroke={`${color}0D`}
            strokeWidth={STROKE + 2}
          />

          {/* Gedimmter Farbring als Hintergrund */}
          <circle
            cx={SIZE / 2} cy={SIZE / 2} r={R}
            fill="none"
            stroke={`${color}18`}
            strokeWidth={STROKE - 2}
          />

          {/* Haupt-Fortschritts-Ring */}
          <circle
            cx={SIZE / 2} cy={SIZE / 2} r={R}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            style={{
              transition: running
                ? 'stroke-dashoffset 1s linear, stroke 0.4s ease'
                : 'stroke 0.4s ease',
            }}
          />

          {/* Leuchtender Punkt am Ende des Fortschritts-Rings */}
          {progress > 0.02 && !finished && (() => {
            const angle = -Math.PI / 2 + (2 * Math.PI * progress);
            const dotX = SIZE / 2 + R * Math.cos(angle);
            const dotY = SIZE / 2 + R * Math.sin(angle);
            return (
              <circle
                cx={dotX} cy={dotY} r={STROKE / 2 + 2}
                fill={color}
                style={{ filter: `drop-shadow(0 0 6px ${color}) drop-shadow(0 0 12px ${color})` }}
              />
            );
          })()}
        </svg>

        {/* Zeitanzeige in der Mitte – nicht rotiert */}
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ rotate: '0deg' }}>
          <span
            className="font-orbitron font-black tabular-nums leading-none"
            style={{
              fontSize: '3.2rem',
              color,
              textShadow: `0 0 24px ${color}, 0 0 48px ${color}88`,
              letterSpacing: '0.05em',
            }}
          >
            {formatTime(remaining)}
          </span>
          <span
            className="font-rajdhani font-semibold tracking-[0.25em] text-xs mt-2 uppercase"
            style={{ color: `${color}99` }}
          >
            {finished ? 'FERTIG!' : running ? 'PAUSE' : 'BEREIT'}
          </span>
          {finished && (
            <span
              className="font-orbitron text-xs mt-1 animate-pulse tracking-widest"
              style={{ color: '#FF0080', textShadow: '0 0 10px #FF0080' }}
            >
              LOS GEHT'S!
            </span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 w-full max-w-xs">
        {!running && !finished && (
          <GlitchButton fullWidth onClick={() => setRunning(true)} variant="primary" size="lg">
            START
          </GlitchButton>
        )}
        {running && (
          <GlitchButton fullWidth onClick={() => setRunning(false)} variant="secondary" size="lg">
            PAUSE
          </GlitchButton>
        )}
        {finished && (
          <GlitchButton fullWidth onClick={reset} variant="primary" size="lg">
            WIEDER
          </GlitchButton>
        )}
        <GlitchButton onClick={reset} variant="ghost" size="lg" className="px-5 text-xl">
          ↺
        </GlitchButton>
      </div>
    </div>
  );
}
