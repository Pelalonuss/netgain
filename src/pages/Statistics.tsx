import { useState } from 'react';
import { useStore } from '../store/useStore';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, ReferenceLine,
} from 'recharts';
import { formatDateShort, formatDateMedium, DAY_LABELS, DAY_COLOR, getPersonalRecords } from '../utils/helpers';
import { DayKey } from '../types';

type TabKey = 'strength' | 'bodyweight' | 'volume' | 'records';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'strength', label: 'KRAFT' },
  { key: 'bodyweight', label: 'GEWICHT' },
  { key: 'volume', label: 'VOLUMEN' },
  { key: 'records', label: 'RECORDS' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-black border border-cyber-yellow/50 p-2 rounded text-xs font-rajdhani"
      style={{ boxShadow: '0 0 10px rgba(243,230,0,0.3)' }}>
      <div className="text-cyber-yellow/60 mb-1">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color }} className="font-bold">
          {p.name}: {p.value}{p.unit ?? ''}
        </div>
      ))}
    </div>
  );
};

export function Statistics() {
  const { sessions, exercises, bodyWeightEntries } = useStore();
  const [activeTab, setActiveTab] = useState<TabKey>('strength');
  const [selectedExerciseId, setSelectedExerciseId] = useState(exercises[0]?.id ?? '');

  const completedSessions = sessions
    .filter(s => s.completedAt)
    .sort((a, b) => a.date.localeCompare(b.date));

  const prs = getPersonalRecords(completedSessions, exercises);

  // ── Kraft-Daten ───────────────────────────────────────────────────────────
  const strengthData = completedSessions
    .filter(s => s.exerciseLogs.some(l => l.exerciseId === selectedExerciseId))
    .map(s => {
      const log = s.exerciseLogs.find(l => l.exerciseId === selectedExerciseId);
      const maxWeight = log ? Math.max(...log.sets.map(st => st.weight), 0) : 0;
      const totalReps = log ? log.sets.reduce((sum, st) => sum + st.reps, 0) : 0;
      return { date: formatDateShort(s.date), fullDate: s.date, maxKg: maxWeight, totalReps };
    });

  // ── Körpergewicht ─────────────────────────────────────────────────────────
  const bodyWeightData = [...bodyWeightEntries]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(e => ({ date: formatDateShort(e.date), kg: e.weight }));

  const avgWeight = bodyWeightData.length
    ? (bodyWeightData.reduce((s, e) => s + e.kg, 0) / bodyWeightData.length).toFixed(1)
    : null;
  const minWeight = bodyWeightData.length ? Math.min(...bodyWeightData.map(e => e.kg)).toFixed(1) : null;
  const maxBodyWeight = bodyWeightData.length ? Math.max(...bodyWeightData.map(e => e.kg)).toFixed(1) : null;

  // ── Volumen ───────────────────────────────────────────────────────────────
  const volumeData = completedSessions.slice(-20).map(s => {
    let vol = 0;
    for (const log of s.exerciseLogs) {
      const ex = exercises.find(e => e.id === log.exerciseId);
      for (const st of log.sets) vol += ex?.isBodyweight ? st.reps : st.reps * st.weight;
    }
    return {
      date: formatDateShort(s.date),
      vol: Math.round(vol),
      day: DAY_LABELS[s.dayKey as DayKey],
      color: DAY_COLOR[s.dayKey as DayKey],
    };
  });

  const strengthMin = strengthData.length ? Math.max(0, Math.min(...strengthData.map(d => d.maxKg)) - 5) : 0;
  const strengthMax = strengthData.length ? Math.max(...strengthData.map(d => d.maxKg)) + 5 : 100;
  const bwMin = bodyWeightData.length ? Math.max(0, Math.min(...bodyWeightData.map(d => d.kg)) - 3) : 60;
  const bwMax = bodyWeightData.length ? Math.max(...bodyWeightData.map(d => d.kg)) + 3 : 100;
  const selectedEx = exercises.find(e => e.id === selectedExerciseId);

  return (
    <div className="flex flex-col gap-4 p-4 pb-2 page-enter">
      {/* Header */}
      <div className="safe-top pt-2">
        <div className="font-orbitron text-cyber-yellow/40 text-[10px] tracking-[0.3em] mb-1">DATA ANALYSIS</div>
        <h1 className="font-orbitron font-black text-cyber-yellow text-2xl neon-text">STATISTIK</h1>
        <div className="font-rajdhani text-cyber-yellow/50 text-sm">{completedSessions.length} Sessions · komplett gespeichert</div>
      </div>

      {/* Tabs */}
      <div className="flex border border-cyber-yellow/20 rounded overflow-hidden">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={[
              'flex-1 py-2.5 font-orbitron text-[10px] tracking-wider transition-all',
              activeTab === tab.key
                ? 'bg-cyber-yellow text-black font-black'
                : 'text-cyber-yellow/50 hover:text-cyber-yellow hover:bg-cyber-yellow/5',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── KRAFT ── */}
      {activeTab === 'strength' && (
        <div className="flex flex-col gap-4">
          <select
            value={selectedExerciseId}
            onChange={e => setSelectedExerciseId(e.target.value)}
            className="cyber-select px-3 py-2.5 rounded text-sm w-full"
          >
            {exercises.map(ex => (
              <option key={ex.id} value={ex.id}>{ex.name}</option>
            ))}
          </select>

          {strengthData.length === 0 ? (
            <div className="cyber-card p-8 text-center">
              <div className="font-orbitron text-cyber-yellow/30 text-sm">KEINE DATEN</div>
              <div className="font-rajdhani text-cyber-yellow/20 text-xs mt-1">
                Trainiere &quot;{selectedEx?.name}&quot; um Daten zu sehen
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'SESSIONS', value: strengthData.length, color: 'text-cyber-yellow' },
                  { label: 'PERSÖNL. REC', value: prs[selectedExerciseId] ? `${prs[selectedExerciseId].weight}kg` : '–', color: 'text-cyber-yellow' },
                  { label: 'LETZTES', value: strengthData[strengthData.length - 1]?.maxKg ? `${strengthData[strengthData.length - 1].maxKg}kg` : '–', color: 'text-cyber-cyan' },
                ].map(stat => (
                  <div key={stat.label} className="cyber-card p-2.5 text-center">
                    <div className={`font-orbitron font-black text-base ${stat.color}`}>{stat.value}</div>
                    <div className="font-rajdhani text-cyber-yellow/40 text-[10px]">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="cyber-card p-3">
                <div className="font-orbitron text-cyber-yellow/60 text-[10px] tracking-widest mb-3">MAX GEWICHT / SESSION</div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={strengthData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(243,230,0,0.08)" />
                    <XAxis dataKey="date" tick={{ fill: 'rgba(243,230,0,0.5)', fontSize: 10, fontFamily: 'Rajdhani' }} />
                    <YAxis domain={[strengthMin, strengthMax]} tick={{ fill: 'rgba(243,230,0,0.5)', fontSize: 10, fontFamily: 'Rajdhani' }} />
                    <Tooltip content={<CustomTooltip />} />
                    {prs[selectedExerciseId] && (
                      <ReferenceLine y={prs[selectedExerciseId].weight} stroke="rgba(243,230,0,0.25)" strokeDasharray="4 4"
                        label={{ value: 'PR', position: 'right', fill: 'rgba(243,230,0,0.6)', fontSize: 10 }} />
                    )}
                    <Line type="monotone" dataKey="maxKg" name="Max kg" stroke="#F3E600" strokeWidth={2.5}
                      dot={{ fill: '#F3E600', r: 4, strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: '#F3E600', stroke: '#000', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="cyber-card p-3">
                <div className="font-orbitron text-cyber-yellow/60 text-[10px] tracking-widest mb-3">TOTAL WIEDERHOLUNGEN</div>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={strengthData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(243,230,0,0.08)" />
                    <XAxis dataKey="date" tick={{ fill: 'rgba(243,230,0,0.5)', fontSize: 10, fontFamily: 'Rajdhani' }} />
                    <YAxis tick={{ fill: 'rgba(243,230,0,0.5)', fontSize: 10, fontFamily: 'Rajdhani' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="totalReps" name="Wiederh." fill="#F3E600" opacity={0.8} radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── KÖRPERGEWICHT ── */}
      {activeTab === 'bodyweight' && (
        <div className="flex flex-col gap-4">
          {bodyWeightData.length === 0 ? (
            <div className="cyber-card p-8 text-center">
              <div className="font-orbitron text-cyber-yellow/30 text-sm">KEINE EINTRÄGE</div>
              <div className="font-rajdhani text-cyber-yellow/20 text-xs mt-1">Füge dein Gewicht unter SETUP → GEWICHT ein</div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'AKTUELL', value: `${bodyWeightData[bodyWeightData.length - 1]?.kg}kg`, color: 'text-cyber-yellow' },
                  { label: 'MINIMUM', value: `${minWeight}kg`, color: 'text-cyber-cyan' },
                  { label: 'MAXIMUM', value: `${maxBodyWeight}kg`, color: 'text-cyber-magenta' },
                ].map(stat => (
                  <div key={stat.label} className="cyber-card p-2.5 text-center">
                    <div className={`font-orbitron font-black text-base ${stat.color}`}>{stat.value}</div>
                    <div className="font-rajdhani text-cyber-yellow/40 text-[10px]">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="cyber-card p-3">
                <div className="font-orbitron text-cyber-yellow/60 text-[10px] tracking-widest mb-3">
                  GEWICHTSVERLAUF ({bodyWeightData.length} Einträge)
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={bodyWeightData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,212,255,0.08)" />
                    <XAxis dataKey="date" tick={{ fill: 'rgba(0,212,255,0.5)', fontSize: 10, fontFamily: 'Rajdhani' }} />
                    <YAxis domain={[bwMin, bwMax]} tick={{ fill: 'rgba(0,212,255,0.5)', fontSize: 10, fontFamily: 'Rajdhani' }} />
                    <Tooltip content={<CustomTooltip />} />
                    {avgWeight && (
                      <ReferenceLine y={parseFloat(avgWeight)} stroke="rgba(0,212,255,0.3)" strokeDasharray="4 4"
                        label={{ value: `Ø ${avgWeight}`, position: 'right', fill: 'rgba(0,212,255,0.6)', fontSize: 10 }} />
                    )}
                    <Line type="monotone" dataKey="kg" name="Gewicht" unit="kg" stroke="#00D4FF" strokeWidth={2.5}
                      dot={{ fill: '#00D4FF', r: 3, strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: '#00D4FF', stroke: '#000', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="cyber-card p-3">
                <div className="font-orbitron text-cyber-yellow/60 text-[10px] tracking-widest mb-2">LETZTE EINTRÄGE</div>
                <div className="flex flex-col max-h-60 overflow-y-auto">
                  {[...bodyWeightEntries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 14).map((entry, idx) => {
                    const sorted = [...bodyWeightEntries].sort((a, b) => a.date.localeCompare(b.date));
                    const i = sorted.findIndex(e => e.id === entry.id);
                    const prev = sorted[i - 1];
                    const diff = prev ? (entry.weight - prev.weight) : null;
                    return (
                      <div key={entry.id} className="flex items-center justify-between py-1.5 border-b border-cyber-yellow/10 last:border-0">
                        <span className="font-rajdhani text-cyber-yellow/60 text-sm">{entry.date}</span>
                        <div className="flex items-center gap-2">
                          {diff !== null && (
                            <span className={`font-rajdhani text-xs tabular-nums ${diff < 0 ? 'text-cyber-cyan' : diff > 0 ? 'text-cyber-magenta' : 'text-cyber-yellow/30'}`}>
                              {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                            </span>
                          )}
                          <span className="font-orbitron text-cyber-yellow font-bold text-sm">{entry.weight}kg</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── VOLUMEN ── */}
      {activeTab === 'volume' && (
        <div className="flex flex-col gap-4">
          {volumeData.length === 0 ? (
            <div className="cyber-card p-8 text-center">
              <div className="font-orbitron text-cyber-yellow/30 text-sm">KEINE DATEN</div>
            </div>
          ) : (
            <>
              <div className="cyber-card p-3">
                <div className="font-orbitron text-cyber-yellow/60 text-[10px] tracking-widest mb-3">TRAININGSVOLUMEN</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={volumeData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(243,230,0,0.08)" />
                    <XAxis dataKey="date" tick={{ fill: 'rgba(243,230,0,0.5)', fontSize: 10, fontFamily: 'Rajdhani' }} />
                    <YAxis tick={{ fill: 'rgba(243,230,0,0.5)', fontSize: 10, fontFamily: 'Rajdhani' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="vol" name="Volumen" fill="#F3E600" opacity={0.85} radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="cyber-card p-3">
                <div className="font-orbitron text-cyber-yellow/60 text-[10px] tracking-widest mb-2">SESSION HISTORY</div>
                {completedSessions.slice().reverse().slice(0, 10).map(s => {
                  let vol = 0;
                  for (const log of s.exerciseLogs) {
                    const ex = exercises.find(e => e.id === log.exerciseId);
                    for (const st of log.sets) vol += ex?.isBodyweight ? st.reps : st.reps * st.weight;
                  }
                  const sets = s.exerciseLogs.reduce((a, l) => a + l.sets.length, 0);
                  const color = DAY_COLOR[s.dayKey as DayKey];
                  return (
                    <div key={s.id} className="flex items-center justify-between py-2 border-b border-cyber-yellow/10 last:border-0">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-7 rounded-full flex-shrink-0" style={{ background: color }} />
                        <div>
                          <div className="font-orbitron text-xs font-bold" style={{ color }}>{DAY_LABELS[s.dayKey as DayKey]}</div>
                          <div className="font-rajdhani text-cyber-yellow/40 text-xs">{s.date} · {sets} Sets</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-orbitron text-cyber-yellow font-bold text-sm">{Math.round(vol)}</div>
                        <div className="font-rajdhani text-cyber-yellow/40 text-[10px]">VOL</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── RECORDS ── */}
      {activeTab === 'records' && (
        <div className="flex flex-col gap-3">
          <div className="font-rajdhani text-cyber-yellow/50 text-sm text-center py-1">
            Persönliche Bestleistungen aller Übungen
          </div>
          {exercises.map(ex => {
            const pr = prs[ex.id];
            const color = DAY_COLOR[ex.dayKey];
            return (
              <div key={ex.id} className={[
                'cyber-card p-3 flex items-center justify-between',
                pr ? '' : 'opacity-40',
              ].join(' ')}>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ background: color }} />
                  <div>
                    <div className="font-orbitron text-cyber-yellow text-xs font-bold">{ex.name}</div>
                    <div className="font-rajdhani text-cyber-yellow/40 text-[10px]">
                      {DAY_LABELS[ex.dayKey]} {ex.isBodyweight ? '· BW' : ''}
                    </div>
                  </div>
                </div>
                {pr ? (
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 justify-end">
                      <span className="pr-badge">PR</span>
                      {!ex.isBodyweight && (
                        <span className="font-orbitron font-black text-cyber-yellow text-lg">{pr.weight}kg</span>
                      )}
                    </div>
                    <div className="font-rajdhani text-cyber-yellow/40 text-[10px]">{pr.date}</div>
                  </div>
                ) : (
                  <span className="font-rajdhani text-cyber-yellow/20 text-xs">KEIN EINTRAG</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
