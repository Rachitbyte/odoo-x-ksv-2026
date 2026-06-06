import { Bell, Sun, Moon, Menu, Search } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLocation, useNavigate } from 'react-router-dom';

const pathLabel = (pathname) => {
  if (pathname === '/' || pathname === '/dashboard') return 'Dashboard';
  const segments = pathname.split('/').filter(Boolean);
  return segments.map(s =>
    s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  ).join(' › ');
};

const TopBar = ({ onMenuToggle }) => {
  const { user } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const isDark = theme === 'dark';
  const label = pathLabel(location.pathname);

  return (
    <header className="topbar">
      {/* Left: hamburger (mobile) + breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onMenuToggle}
          className="lg:hidden"
          style={{
            padding: '6px',
            borderRadius: '8px',
            color: 'var(--txt-2)',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Menu size={20} />
        </button>

        <div>
          <h1 style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
            fontSize: '15px',
            color: 'var(--txt)',
            letterSpacing: '-0.01em',
          }}>
            {label}
          </h1>
        </div>
      </div>

      {/* Right: search + notifications + theme + user */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>

        {/* Search button (shell — future feature) */}
        <button
          style={{
            display: 'none',
            padding: '7px 12px',
            borderRadius: '8px',
            border: '1.5px solid var(--border)',
            backgroundColor: 'var(--surface-2)',
            color: 'var(--txt-m)',
            cursor: 'pointer',
            fontSize: '13px',
            gap: '8px',
            alignItems: 'center',
          }}
          className="md:flex"
        >
          <Search size={14} />
          <span>Search...</span>
          <span style={{ fontSize: '11px', opacity: 0.6, fontFamily: 'var(--font-mono)' }}>⌘K</span>
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            padding: '7px',
            borderRadius: '8px',
            border: '1.5px solid var(--border)',
            backgroundColor: 'var(--surface-2)',
            color: 'var(--txt-2)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--txt)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--txt-2)'; }}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notification bell */}
        <button
          style={{
            padding: '7px',
            borderRadius: '8px',
            border: '1.5px solid var(--border)',
            backgroundColor: 'var(--surface-2)',
            color: 'var(--txt-2)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <Bell size={16} />
          <span style={{
            position: 'absolute',
            top: '6px', right: '6px',
            width: '7px', height: '7px',
            borderRadius: '999px',
            backgroundColor: 'var(--danger)',
            border: '1.5px solid var(--surface)',
          }} />
        </button>

        {/* User profile chip */}
        <button
          onClick={() => navigate('/profile')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 10px 5px 5px',
            borderRadius: '999px',
            border: '1.5px solid var(--border)',
            backgroundColor: 'var(--surface-2)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            marginLeft: '4px',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
        >
          <div style={{
            width: '26px', height: '26px', borderRadius: '999px',
            backgroundColor: 'var(--primary)',
            color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '12px',
            flexShrink: 0,
          }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div style={{ display: 'none' }} className="sm:block">
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--txt)', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
              {user?.name?.split(' ')[0] || 'User'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--txt-m)', textTransform: 'capitalize', lineHeight: 1.2 }}>
              {user?.role}
            </div>
          </div>
        </button>
      </div>
    </header>
  );
};

export default TopBar;
