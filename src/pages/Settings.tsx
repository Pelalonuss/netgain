import { useState } from 'react';
import { useStore } from '../store/useStore';
import { GlitchButton } from '../components/GlitchButton';
import { DAY_LABELS, DAY_SUBTITLE, DAY_COLOR, todayStr } from '../utils/helpers';
import { DayKey, CategoryKey } from '../types';

const DAYS: DayKey[] = ['monday', 'tuesday', 'wednesday'];
const CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: 'push', label: 'Push' },
  { key: 'pull', label: 'Pull' },
  { key: 'legs_abs', label: 'Legs+Abs' },
];

type SectionKey = 'bodyweight' | 'exercises' | 'sessions' | 'profile';

export function Settings() {
  const {
    exercises, bodyWeightEntries, profile, sessions,
    addExercise, deleteExercise, addBodyWeight, deleteBodyWeight, updateProfile, deleteSession,
  } = useStore();

  const [activeSection, setActiveSection] = useState<SectionKey>('bodyweight');
  const [newWeight, setNewWeight]   = useState('');
  const [weightDate, setWeightDate] = useState(todayStr());
  const [newExName, setNewExName]   = useState('');
  const [newExDay, setNewExDay]     = useState<DayKey>('monday');
  const [newExCat, setNewExCat]     = useState<CategoryKey>('push');
  const [newExBW, setNewExBW]       = useState(false);
  const [newName, setNewName]       = useState(profile.name);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleAddWeight = () => {
    const w = parseFloat(newWeight);
    if (isNaN(w) || w <= 0 || w > 300) return;
    addBodyWeight({ date: weightDate, weight: w });
    setNewWeight('');
  };

  const handleAddExercise = () => {
    if (!newExName.trim()) return;
    addExercise({ name: newExName.trim(), dayKey: newExDay, category: newExCat, isBodyweight: newExBW });
    setNewExName('');
  };

  const sortedWeights = [...bodyWeightEntries].sort((a, b) => b.date.localeCompare(a.date));

  const SECTIONS = [
    { key: 'bodyweight' as SectionKey, label: 'GEWICHT' },
    { key: 'exercises'  as SectionKey, label: 'ÜBUNGEN' },
    { key: 'sessions'   as SectionKey, label: 'SESSIONS' },
    { key: 'profile'    as SectionKey, label: 'PROFIL'  },
  ];

  return (
    <div className="flex flex-col gap-4 p-4 pb-2 page-enter">
      <div className="safe-top pt-2">
        <div className="font-orbitron text-cyber-yellow/40 text-[10px] tracking-[0.3em] mb-1">CONFIGURATION</div>
        <h1 className="font-orbitron font-black text-cyber-yellow text-2xl neon-text">SETUP</h1>
      </div>

      <div className="flex border border-cyber-yellow/20 rounded overflow-hidden">
        {SECTIONS.map(s => (
          <button key={s.key} onClick={() => setActiveSection(s.key)}
            className={[
              'flex-1 py-2.5 font-orbitron text-[10px] tracking-wider transition-all',
              activeSection === s.key
                ? 'bg-cyber-yellow text-black font-black'
                : 'text-cyber-yellow/50 hover:text-cyber-yellow',
            ].join(' ')}>
            {s.label}
          </button>
        ))}
      </div>

      {/* ── KÖRPERGEWICHT ── */}
      {activeSection === 'bodyweight' && (
        <div className="flex flex-col gap-4">
          <div className="cyber-card p-4">
            <h2 className="font-orbitron font-bold text-cyber-yellow text-sm tracking-widest mb-3">GEWICHT EINTRAGEN</h2>
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="font-rajdhani text-cyber-yellow/50 text-xs tracking-wider block mb-1">DATUM</label>
                  <input type="date" value={weightDate} onChange={e => setWeightDate(e.target.value)}
                    className="cyber-input w-full px-3 py-2.5 rounded text-sm" style={{ colorScheme: 'dark' }} />
                </div>
                <div className="w-28">
                  <label className="font-rajdhani text-cyber-yellow/50 text-xs tracking-wider block mb-1">KG</label>
                  <input type="number" value={newWeight} onChange={e => setNewWeight(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddWeight()}
                    placeholder="72.5" className="cyber-input w-full px-3 py-2.5 rounded text-sm text-center"
                    step="0.1" min="30" max="300" />
                </div>
              </div>
              <GlitchButton fullWidth onClick={handleAddWeight} variant="primary" size="md">+ EINTRAGEN</GlitchButton>
            </div>
          </div>

          <div className="cyber-card p-4">
            <h2 className="font-orbitron font-bold text-cyber-yellow text-sm tracking-widest mb-3">
              VERLAUF ({bodyWeightEntries.length})
            </h2>
            {sortedWeights.length === 0 ? (
              <div className="text-center py-4 font-rajdhani text-cyber-yellow/30 text-sm">Noch keine Einträge</div>
            ) : (
              <div className="flex flex-col gap-1 max-h-72 overflow-y-auto">
                {sortedWeights.map((entry, idx) => {
                  const sorted = [...bodyWeightEntries].sort((a, b) => a.date.localeCompare(b.date));
                  const i = sorted.findIndex(e => e.id === entry.id);
                  const prev = sorted[i - 1];
                  const diff = prev ? (entry.weight - prev.weight) : null;
                  return (
                    <div key={entry.id} className="flex items-center justify-between py-2 border-b border-cyber-yellow/10 last:border-0">
                      <span className="font-rajdhani text-cyber-yellow/60 text-sm">{entry.date}</span>
                      <div className="flex items-center gap-2">
                        {diff !== null && (
                          <span className={`font-rajdhani text-xs tabular-nums ${diff < 0 ? 'text-cyber-cyan' : diff > 0 ? 'text-cyber-magenta' : 'text-cyber-yellow/30'}`}>
                            {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                          </span>
                        )}
                        <span className="font-orbitron text-cyber-yellow font-bold">{entry.weight}kg</span>
                        <button onClick={() => setConfirmDelete(entry.id)}
                          className="text-cyber-magenta/30 hover:text-cyber-magenta p-1 transition-colors">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ÜBUNGEN ── */}
      {activeSection === 'exercises' && (
        <div className="flex flex-col gap-4">
          <div className="cyber-card p-4">
            <h2 className="font-orbitron font-bold text-cyber-yellow text-sm tracking-widest mb-3">NEUE ÜBUNG</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="font-rajdhani text-cyber-yellow/50 text-xs tracking-wider block mb-1">NAME</label>
                <input type="text" value={newExName} onChange={e => setNewExName(e.target.value)}
                  placeholder="Übungsname..." className="cyber-input w-full px-3 py-2.5 rounded text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-rajdhani text-cyber-yellow/50 text-xs tracking-wider block mb-1">TRAINING TYP</label>
                  <select value={newExDay} onChange={e => setNewExDay(e.target.value as DayKey)}
                    className="cyber-select w-full px-3 py-2.5 rounded text-sm">
                    {DAYS.map(d => <option key={d} value={d}>{DAY_LABELS[d]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-rajdhani text-cyber-yellow/50 text-xs tracking-wider block mb-1">KATEGORIE</label>
                  <select value={newExCat} onChange={e => setNewExCat(e.target.value as CategoryKey)}
                    className="cyber-select w-full px-3 py-2.5 rounded text-sm">
                    {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-rajdhani text-cyber-yellow/70 text-sm">Körpergewicht-Übung</span>
                <button onClick={() => setNewExBW(v => !v)} className={`cyber-toggle ${newExBW ? 'on' : ''}`} />
              </div>
              <GlitchButton fullWidth onClick={handleAddExercise} variant="primary" size="md">+ HINZUFÜGEN</GlitchButton>
            </div>
          </div>

          {DAYS.map(day => {
            const dayExercises = exercises.filter(e => e.dayKey === day);
            const color = DAY_COLOR[day];
            return (
              <div key={day} className="cyber-card overflow-hidden">
                <div className="h-0.5" style={{ background: color }} />
                <div className="p-4">
                  <h2 className="font-orbitron font-bold text-sm tracking-widest mb-0.5" style={{ color }}>{DAY_LABELS[day]}</h2>
                  <div className="font-rajdhani text-cyber-yellow/40 text-xs mb-3">{DAY_SUBTITLE[day]}</div>
                  {dayExercises.length === 0 ? (
                    <div className="font-rajdhani text-cyber-yellow/20 text-sm text-center py-2">Keine Übungen</div>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {dayExercises.map(ex => (
                        <div key={ex.id} className="flex items-center justify-between py-1.5 border-b border-cyber-yellow/10 last:border-0">
                          <div className="flex items-center gap-2">
                            <div className="w-1 h-5 rounded-full" style={{ background: color, opacity: 0.6 }} />
                            <div>
                              <div className="font-rajdhani text-cyber-yellow text-sm font-semibold">{ex.name}</div>
                              {ex.isBodyweight && <div className="font-orbitron text-cyber-cyan/60 text-[9px]">BODYWEIGHT</div>}
                            </div>
                          </div>
                          <button onClick={() => setConfirmDelete(`ex-${ex.id}`)}
                            className="text-cyber-magenta/30 hover:text-cyber-magenta p-1.5 transition-colors">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                              <path d="M10 11v6M14 11v6"/>
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── SESSIONS ── */}
      {activeSection === 'sessions' && (
        <div className="flex flex-col gap-3">
          <div className="font-rajdhani text-cyber-yellow/50 text-sm text-center py-1">
            Alle gespeicherten Sessions · Tippe 🗑 zum Löschen (XP wird abgezogen)
          </div>
          {sessions.length === 0 ? (
            <div className="cyber-card p-8 text-center font-rajdhani text-cyber-yellow/30 text-sm">
              Keine Sessions vorhanden
            </div>
          ) : (
            [...sessions]
              .sort((a, b) => b.date.localeCompare(a.date))
              .map(s => {
                const sets = s.exerciseLogs.reduce((a, l) => a + l.sets.length, 0);
                const color = ({ monday: '#F3E600', tuesday: '#00D4FF', wednesday: '#FF0080' } as Record<string, string>)[s.dayKey] ?? '#F3E600';
                const dayLabel = ({ monday: 'PUSH DAY', tuesday: 'PULL DAY', wednesday: 'LEGS+ABS' } as Record<string, string>)[s.dayKey] ?? s.dayKey;
                return (
                  <div key={s.id} className="cyber-card p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ background: color }} />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-orbitron text-xs font-bold" style={{ color }}>{dayLabel}</span>
                          {s.isManual && (
                            <span className="font-orbitron text-cyber-cyan/50 text-[9px] border border-cyber-cyan/20 px-1">MANUELL</span>
                          )}
                          {!s.completedAt && (
                            <span className="font-orbitron text-cyber-magenta/70 text-[9px] border border-cyber-magenta/30 px-1">OFFEN</span>
                          )}
                        </div>
                        <div className="font-rajdhani text-cyber-yellow/50 text-xs">{s.date} · {sets} Sets</div>
                        {s.completedAt && (
                          <div className="font-orbitron text-cyber-yellow/30 text-[9px]">+{s.xpEarned} XP · {s.durationMinutes}min</div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setConfirmDelete(`session-${s.id}`)}
                      className="text-cyber-magenta/30 hover:text-cyber-magenta p-2 transition-colors flex-shrink-0"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6M14 11v6"/>
                      </svg>
                    </button>
                  </div>
                );
              })
          )}
        </div>
      )}

      {/* ── PROFIL ── */}
      {activeSection === 'profile' && (
        <div className="flex flex-col gap-4">
          <div className="cyber-card p-4">
            <h2 className="font-orbitron font-bold text-cyber-yellow text-sm tracking-widest mb-3">DEIN PROFIL</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="font-rajdhani text-cyber-yellow/50 text-xs tracking-wider block mb-1">NAME / CALLSIGN</label>
                <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
                  placeholder="NAME..." className="cyber-input w-full px-3 py-2.5 rounded text-sm" />
              </div>
              <GlitchButton fullWidth onClick={() => { if (newName.trim()) updateProfile({ name: newName.trim() }); }} variant="primary" size="md">
                SPEICHERN
              </GlitchButton>
            </div>
          </div>

          <div className="cyber-card p-4">
            <h2 className="font-orbitron font-bold text-cyber-yellow text-sm tracking-widest mb-3">APP STATS</h2>
            <div className="flex flex-col gap-2 font-rajdhani text-cyber-yellow/50 text-sm">
              {[
                ['App Name', 'NETGAIN v1.0'],
                ['Gespeicherte Sessions', sessions.length],
                ['Abgeschlossene Sessions', sessions.filter(s => s.completedAt).length],
                ['Gewicht-Einträge', bodyWeightEntries.length],
                ['Übungen', exercises.length],
                ['Total XP', profile.totalXP.toLocaleString()],
              ].map(([k, v]) => (
                <div key={String(k)} className="flex justify-between border-b border-cyber-yellow/10 pb-1.5">
                  <span>{k}</span>
                  <span className="font-orbitron text-cyber-yellow/80 text-xs">{String(v)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="cyber-card p-4 border-cyber-cyan/30">
            <h2 className="font-orbitron font-bold text-cyber-cyan text-sm tracking-widest mb-2">GITHUB DEPLOY</h2>
            <p className="font-rajdhani text-cyber-yellow/50 text-sm leading-relaxed">
              Alle Daten werden lokal im Browser gespeichert (localStorage).
              Pushe den Code auf GitHub, aktiviere GitHub Pages → deine App ist online.
              Daten bleiben auf dem Gerät gespeichert — niemals gelöscht, so lange du den Browser-Cache nicht leerst.
            </p>
            <div className="mt-3 font-rajdhani text-cyber-yellow/30 text-xs">
              Icon (Icon.png) in den <code className="text-cyber-cyan/60">public/</code> Ordner legen → fertig.
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {confirmDelete && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setConfirmDelete(null)}>
          <div className="modal-sheet p-6">
            <div className="w-10 h-1 rounded-full bg-cyber-yellow/30 mx-auto mb-4" />
            <h3 className="font-orbitron font-bold text-cyber-magenta text-center mb-2">LÖSCHEN?</h3>
            <p className="font-rajdhani text-cyber-yellow/60 text-sm text-center mb-6">
              Dieser Eintrag wird unwiderruflich gelöscht.
            </p>
            <div className="flex gap-3">
              <GlitchButton fullWidth onClick={() => setConfirmDelete(null)} variant="secondary">ABBRECHEN</GlitchButton>
              <GlitchButton fullWidth onClick={() => {
                if (confirmDelete.startsWith('ex-')) deleteExercise(confirmDelete.slice(3));
                else if (confirmDelete.startsWith('session-')) deleteSession(confirmDelete.slice(8));
                else deleteBodyWeight(confirmDelete);
                setConfirmDelete(null);
              }} variant="danger">LÖSCHEN</GlitchButton>
            </div>
            <div className="h-4" />
          </div>
        </div>
      )}
    </div>
  );
}
