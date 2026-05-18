import { useLocation, useNavigate } from 'react-router-dom'

const ICONS = {
  home: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5 12 3l9 6.5V21H3z" />
      <path d="M9 21V12h6v9" />
    </svg>
  ),
  mirror: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="20" x2="6" y2="10" />
      <line x1="12" y1="20" x2="12" y2="6" />
      <line x1="18" y1="20" x2="18" y2="13" />
    </svg>
  ),
  motivation: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  path: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  ),
}

const TABS = [
  { key: 'home', label: 'Home', route: '/home', icon: ICONS.home, matchPrefix: false },
  { key: 'mirror', label: 'Mirror', route: '/mirror', icon: ICONS.mirror, matchPrefix: true },
  { key: 'motivation', label: 'Motivation', route: '/motivation', icon: ICONS.motivation, matchPrefix: true },
  { key: 'path', label: 'Vow Path', route: '/vow-path', icon: ICONS.path, matchPrefix: true },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (tab) => {
    if (tab.matchPrefix) {
      return location.pathname === tab.route || location.pathname.startsWith(tab.route + '/')
    }
    return location.pathname === tab.route
  }

  return (
    <>
      <div style={styles.spacer} aria-hidden="true" />

      <nav style={styles.wrap}>
        <div style={styles.bar}>
          {TABS.map(tab => {
            const active = isActive(tab)
            return (
              <button
                key={tab.key}
                onClick={() => navigate(tab.route)}
                style={{
                  ...styles.tab,
                  ...(active ? styles.tabActive : {}),
                }}
                aria-current={active ? 'page' : undefined}
                aria-label={tab.label}
              >
                <div style={styles.icon}>{tab.icon}</div>
                <span style={{
                  ...styles.label,
                  ...(active ? styles.labelActive : {}),
                }}>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}

const styles = {
  spacer: {
    height: '60px',
  },
  wrap: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
    zIndex: 50,
  },
  bar: {
    maxWidth: '440px',
    width: '100%',
    background: '#FAF7F1',
    borderTop: '0.5px solid #E8DFD0',
    paddingTop: '6px',
    paddingBottom: 'calc(6px + env(safe-area-inset-bottom, 0px))',
    paddingLeft: '8px',
    paddingRight: '8px',
    boxShadow: '0 -2px 12px rgba(80,50,20,0.04)',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    pointerEvents: 'auto',
  },
  tab: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2px',
    background: 'transparent',
    border: 'none',
    padding: '3px 0',
    cursor: 'pointer',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    color: '#9C8C78',
    transition: 'color 0.15s',
  },
  tabActive: {
    color: '#854F0B',
  },
  icon: {
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: '10px',
    fontWeight: 500,
    color: '#9C8C78',
    letterSpacing: '0.04em',
  },
  labelActive: {
    color: '#854F0B',
    fontWeight: 600,
  },
}