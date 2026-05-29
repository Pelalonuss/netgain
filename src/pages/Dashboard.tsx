import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { XPBar } from '../components/XPBar';
import { GlitchButton } from '../components/GlitchButton';
import {
  DAY_LABELS, DAY_SUBTITLE, DAY_COLOR, formatDate, formatTimestamp, formatDuration, todayStr
} from '../utils/helpers';
import { getLevel, getLevelTitle } from '../utils/xp';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export function Dashboard() {
  const navigate = useNavigate();
  const { sessions, exercises, profile, bodyWeightEntries, activeSession } = useStore();

  const level = getLevel(profile.totalXP);
  const levelTitle = getLevelTitle(level);

  const completedSessions = sessions.filter(s => s.completedAt);
  const totalWorkouts = completedSessions.length;
  const totalSets = completedSessions.reduce(
    (sum, s) => sum + s.exerciseLogs.reduce((a, l) => a + l.sets.length, 0), 0
  );

  const latestWeight = bodyWeightEntries.length > 0
    ? [...bodyWeightEntries].sort((a, b) => b.date.localeCompare(a.date))[0]
    : null;

  const todaySessions = sessions.filter(s => s.date === todayStr());
  const todayCompleted = todaySessions.filter(s => s.completedAt);

  const lastSession = completedSessions.length > 0
    ? [...completedSessions].sort((a, b) => b.date.localeCompare(a.date))[0]
    : null;

  const todayDate = format(new Date(), "EEEE, dd. MMMM yyyy", { locale: de });
  const nowTime = format(new Date(), "HH:mm");

  return (
    <div className="flex flex-col gap-4 p-4 pb-2 page-enter">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between safe-top pt-2">
        <div>
          <div className="font-orbitron text-cyber-yellow/40 text-[10px] tracking-[0.3em] uppercase">
            {todayDate} · {nowTime}
          </div>
          <h1 className="font-orbitron font-black text-cyber-yellow text-3xl mt-1 neon-text animate-flicker tracking-tight">
            NETGAIN
          </h1>
          <div className="font-rajdhani text-cyber-yellow/60 text-sm tracking-widest">
            {levelTitle} · LVL {level} · {profile.name}
          </div>
        </div>
        {latestWeight && (
          <div className="cyber-card px-3 py-2 flex flex-col items-end">
            <span className="font-orbitron font-black text-cyber-yellow text-xl">
              {latestWeight.weight}<span className="text-xs opacity-60 ml-0.5">kg</span>
            </span>
            <span className="font-rajdhani text-cyber-yellow/40 text-[10px]">KÖRPERGEW.</span>
            <span className="font-rajdhani text-cyber-yellow/30 text-[9px]">{latestWeight.date}</span>
          </div>
        )}
      </div>

      {/* ── XP Bar ─────────────────────────────────────────────────────────── */}
      <XPBar />

      {/* ── Stats Row ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'WORKOUTS', value: totalWorkouts, color: 'text-cyber-yellow' },
          { label: 'TOTAL SETS', value: totalSets, color: 'text-cyber-cyan' },
          { label: 'STREAK', value: `${profile.streak ?? 0}🔥`, color: 'text-cyber-magenta' },
        ].map(stat => (
          <div key={stat.label} className="cyber-card p-3 flex flex-col items-center">
            <span className={`font-orbitron font-black text-xl ${stat.color}`}>{stat.value}</span>
            <span className="font-rajdhani text-cyber-yellow/40 text-[10px] tracking-wider mt-0.5">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* ── Heute / Aktive Session ─────────────────────────────────────────── */}
      {activeSession && (
        <div className="cyber-card p-4 border-cyber-magenta/40"
          style={{ boxShadow: '0 0 15px rgba(255,0,128,0.15)' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-cyber-magenta animate-pulse"
              style={{ boxShadow: '0 0 6px #FF0080' }} />
            <span className="font-orbitron text-cyber-magenta text-xs tracking-widest">AKTIVE SESSION</span>
          </div>
          <div className="font-orbitron text-cyber-yellow font-bold mb-1">
            {DAY_LABELS[activeSession.dayKey]}
          </div>
          <div className="font-rajdhani text-cyber-yellow/50 text-xs mb-3">
            📅 {formatTimestamp(activeSession.startedAt)}
          </div>
          <GlitchButton fullWidth onClick={() => navigate('/workout')} variant="cyan" size="md">
            ▶ SESSION FORTSETZEN
          </GlitchButton>
        </div>
      )}

      {/* ── Training Templates Overview ─────────────────────────────────────── */}
      <div className="cyber-card p-4">
        <h2 className="font-orbitron font-bold text-cyber-yellow text-sm tracking-widest mb-3">
          TRAINING ÜBERSICHT
        </h2>
        <div className="flex flex-col gap-2">
          {(['monday', 'tuesday', 'wednesday'] as const).map(day => {
            const daySessions = completedSessions.filter(s => s.dayKey === day);
            const lastDaySession = daySessions.length > 0
              ? [...daySessions].sort((a, b) => b.date.localeCompare(a.date))[0]
              : null;
            const color = DAY_COLOR[day];
            return (
              <div
                key={day}
                className="flex items-center gap-3 py-2 border-b border-cyber-yellow/10 last:border-0 cursor-pointer active:bg-cyber-yellow/5"
                onClick={() => navigate('/workout')}
              >
                <div className="w-1 h-8 rounded-full flex-shrink-0"
                  style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
                <div className="flex-1">
                  <div className="font-orbitron text-xs font-bold" style={{ color }}>{DAY_LABELS[day]}</div>
                  <div className="font-rajdhani text-cyber-yellow/40 text-[11px]">{DAY_SUBTITLE[day]}</div>
                </div>
                <div className="text-right">
                  {lastDaySession ? (
                    <>
                      <div className="font-rajdhani text-cyber-yellow/50 text-xs">{formatDate(lastDaySession.date)}</div>
                      <div className="font-orbitron text-cyber-yellow/30 text-[9px]">+{lastDaySession.xpEarned}XP</div>
                    </>
                  ) : (
                    <span className="font-orbitron text-cyber-yellow/20 text-[10px]">NEU</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {!activeSession && (
          <GlitchButton fullWidth onClick={() => navigate('/workout')} variant="secondary" size="md" className="mt-3">
            ⚡ TRAINING STARTEN
          </GlitchButton>
        )}
      </div>

      {/* ── Letzte Sessions ────────────────────────────────────────────────── */}
      {completedSessions.length > 0 && (
        <div className="cyber-card p-4">
          <h2 className="font-orbitron font-bold text-cyber-yellow text-sm tracking-widest mb-3">
            LETZTE SESSIONS
          </h2>
          <div className="flex flex-col gap-2">
            {[...completedSessions]
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 4)
              .map(s => {
                const sets = s.exerciseLogs.reduce((a, l) => a + l.sets.length, 0);
                const color = DAY_COLOR[s.dayKey];
                return (
                  <div key={s.id} className="flex items-center justify-between py-2 border-b border-cyber-yellow/10 last:border-0">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-8 rounded-full flex-shrink-0"
                        style={{ background: color, boxShadow: `0 0 4px ${color}` }} />
                      <div>
                        <div className="font-orbitron text-xs font-bold" style={{ color }}>{DAY_LABELS[s.dayKey]}</div>
                        <div className="font-rajdhani text-cyber-yellow/40 text-xs">
                          {formatTimestamp(s.startedAt)}
                        </div>
                        {s.isManual && (
                          <div className="font-orbitron text-cyber-cyan/50 text-[9px]">MANUELL EINGETRAGEN</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-orbitron text-cyber-yellow font-bold text-sm">+{s.xpEarned}</div>
                      <div className="font-rajdhani text-cyber-yellow/40 text-xs">{sets} Sets</div>
                      {s.durationMinutes > 0 && (
                        <div className="font-rajdhani text-cyber-yellow/30 text-[10px]">{formatDuration(s.durationMinutes)}</div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
