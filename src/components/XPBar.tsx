import { useStore } from '../store/useStore';
import { getLevel, getLevelProgress, getXPInCurrentLevel, XP_PER_LEVEL, getLevelTitle } from '../utils/xp';

interface XPBarProps {
  compact?: boolean;
}

export function XPBar({ compact = false }: XPBarProps) {
  const totalXP = useStore(s => s.profile.totalXP);
  const level = getLevel(totalXP);
  const progress = getLevelProgress(totalXP);
  const xpInLevel = getXPInCurrentLevel(totalXP);
  const title = getLevelTitle(level);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-center min-w-[36px]">
          <span className="font-orbitron font-black text-cyber-yellow text-xs leading-none">{level}</span>
          <span className="font-rajdhani text-cyber-yellow/50 text-[9px] leading-none">LVL</span>
        </div>
        <div className="flex-1 h-2 bg-black border border-cyber-yellow/20 rounded-sm overflow-hidden">
          <div className="xp-bar-fill h-full rounded-sm" style={{ width: `${progress * 100}%` }} />
        </div>
        <span className="font-rajdhani text-cyber-yellow/60 text-xs min-w-[60px] text-right">
          {xpInLevel}/{XP_PER_LEVEL}
        </span>
      </div>
    );
  }

  return (
    <div className="cyber-card p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-orbitron font-black text-cyber-yellow text-3xl neon-text">{level}</span>
            <span className="font-orbitron text-cyber-yellow/50 text-xs tracking-widest">LVL</span>
          </div>
          <div className="font-orbitron text-cyber-yellow text-xs tracking-[0.2em] mt-0.5 opacity-80">{title}</div>
        </div>
        <div className="text-right">
          <div className="font-orbitron text-cyber-yellow font-bold text-sm">{totalXP.toLocaleString()}</div>
          <div className="font-rajdhani text-cyber-yellow/50 text-xs">TOTAL XP</div>
        </div>
      </div>

      {/* Bar */}
      <div className="relative h-4 bg-cyber-gray-800 border border-cyber-yellow/20 overflow-hidden rounded-sm">
        <div
          className="xp-bar-fill absolute left-0 top-0 h-full rounded-sm"
          style={{ width: `${progress * 100}%` }}
        />
        {/* Tick lines */}
        {[0.25, 0.5, 0.75].map(p => (
          <div
            key={p}
            className="absolute top-0 bottom-0 w-px bg-black/40"
            style={{ left: `${p * 100}%` }}
          />
        ))}
      </div>

      <div className="flex justify-between mt-1.5">
        <span className="font-rajdhani text-cyber-yellow/50 text-xs">{xpInLevel} XP</span>
        <span className="font-rajdhani text-cyber-yellow/50 text-xs">NEXT LVL: {XP_PER_LEVEL - xpInLevel} XP</span>
      </div>
    </div>
  );
}
