import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

const NAV_ITEMS = [
  {
    path: '/',
    label: 'HOME',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    path: '/workout',
    label: 'WORKOUT',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6 6 18M8 6l10 10"/>
        <circle cx="5" cy="5" r="2"/><circle cx="19" cy="5" r="2"/>
        <circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/>
      </svg>
    ),
  },
  {
    path: '/stats',
    label: 'STATS',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.5} strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
  {
    path: '/settings',
    label: 'SETUP',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  },
];

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeSession = useStore(s => s.activeSession);

  return (
    <nav className="bottom-nav fixed bottom-0 left-0 right-0 z-50">
      <div className="flex">
        {NAV_ITEMS.map(item => {
          const isActive = location.pathname === item.path ||
            (item.path === '/workout' && location.pathname.startsWith('/workout'));
          const isWorkout = item.path === '/workout';

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={[
                'flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-all duration-200 relative',
                isActive ? 'text-cyber-yellow' : 'text-cyber-yellow/35 hover:text-cyber-yellow/70',
              ].join(' ')}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-cyber-yellow"
                  style={{ boxShadow: '0 0 8px #F3E600' }} />
              )}
              {/* Active session dot */}
              {isWorkout && activeSession && (
                <div className="absolute top-2 right-1/4 w-2 h-2 rounded-full bg-cyber-magenta"
                  style={{ boxShadow: '0 0 6px #FF0080', animation: 'pulseCyber 1.5s ease-in-out infinite' }} />
              )}
              {item.icon(isActive)}
              <span className="font-orbitron text-[9px] tracking-wider">{item.label}</span>
            </button>
          );
        })}
      </div>
      <div className="h-safe-bottom" style={{ height: 'env(safe-area-inset-bottom)' }} />
    </nav>
  );
}
