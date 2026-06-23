// src/components/Sidebar.jsx
import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  PanelLeftClose, PanelLeftOpen,
  LayoutDashboard, FileText, MessageSquare,
  NotebookPen, Trophy, LogOut, Monitor, Moon, Sun, ChevronUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

const NAV_ITEMS = [
  { path: '/dashboard',            label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/dashboard/documents',  label: 'Documents',  icon: FileText },
  { path: '/dashboard/chat',       label: 'Chats',      icon: MessageSquare },
  { path: '/dashboard/notes',      label: 'Notes',      icon: NotebookPen },
  { path: '/dashboard/quizzes',    label: 'Quizzes',    icon: Trophy },
];

const THEME_OPTIONS = [
  { value: 'light',  icon: Sun,     label: 'Light' },
  { value: 'system', icon: Monitor, label: 'System' },
  { value: 'dark',   icon: Moon,    label: 'Dark' },
];

function ThemeDropdown({ collapsed }) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = THEME_OPTIONS.find(o => o.value === theme) || THEME_OPTIONS[1];
  const CurrentIcon = current.icon;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', padding: collapsed ? '0.25rem' : '0.25rem 0' }}>
      <button
        onClick={() => setOpen(!open)}
        title="Change theme"
        style={{
          display: 'flex', alignItems: 'center', gap: '0.625rem',
          width: '100%', padding: collapsed ? '0.625rem' : '0.625rem 0.75rem',
          justifyContent: collapsed ? 'center' : 'flex-start',
          background: open ? 'var(--bg-tertiary)' : 'transparent',
          color: 'var(--text-secondary)', border: 'none',
          borderRadius: 'var(--radius)', cursor: 'pointer',
          transition: 'all 0.15s', fontSize: '0.875rem',
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
      >
        <CurrentIcon size={17} strokeWidth={1.75} style={{ flexShrink: 0 }} />
        {!collapsed && (
          <>
            <span style={{ flex: 1, textAlign: 'left' }}>{current.label} mode</span>
            <ChevronUp
              size={14}
              strokeWidth={2}
              style={{ transform: open ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s' }}
            />
          </>
        )}
      </button>

      {/* Dropdown — opens upward since it's at the bottom */}
      {open && (
        <div style={{
          position: 'absolute',
          bottom: '110%', left: 0, right: 0,
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow)',
          zIndex: 200,
          minWidth: collapsed ? 120 : 'auto',
          left: collapsed ? '50%' : 0,
          transform: collapsed ? 'translateX(-50%)' : 'none',
        }}>
          {THEME_OPTIONS.map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => { setTheme(value); setOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.625rem',
                width: '100%', padding: '0.625rem 0.875rem',
                background: theme === value ? 'var(--accent-glow)' : 'transparent',
                color: theme === value ? 'var(--accent)' : 'var(--text-secondary)',
                border: 'none', cursor: 'pointer',
                fontSize: '0.8rem', fontWeight: theme === value ? 600 : 400,
                transition: 'background 0.15s', textAlign: 'left',
              }}
              onMouseEnter={(e) => { if (theme !== value) e.currentTarget.style.background = 'var(--bg-hover)'; }}
              onMouseLeave={(e) => { if (theme !== value) e.currentTarget.style.background = 'transparent'; }}
            >
              <Icon size={15} strokeWidth={1.75} />
              {label}
              {theme === value && <span style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0, bottom: 0,
      width: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      transition: 'width 0.2s ease',
      zIndex: 100, overflow: 'hidden',
    }}>

      {/* Logo + collapse */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        padding: '0.875rem 1rem',
        borderBottom: '1px solid var(--border)',
        minHeight: 68, gap: '0.5rem',
      }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', overflow: 'hidden' }}>
            <img src="/logo.png" alt="Synapse AI" style={{ width: 42, height: 42, objectFit: 'contain', flexShrink: 0 }} />
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--accent-soft)', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
              SYNAPSE AI
            </span>
          </div>
        )}
        {collapsed && <img src="/logo.png" alt="Synapse AI" style={{ width: 36, height: 36, objectFit: 'contain' }} />}
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            background: 'transparent', color: 'var(--text-secondary)',
            padding: '0.3rem', borderRadius: 4, border: 'none',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            flexShrink: 0, transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          {collapsed ? <PanelLeftOpen size={18} strokeWidth={1.75} /> : <PanelLeftClose size={18} strokeWidth={1.75} />}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0.5rem 0', overflowY: 'auto' }}>
        {NAV_ITEMS.map(({ path, label, icon: Icon, exact }) => (
          <NavLink
            key={label}
            to={path}
            end={exact}
            title={collapsed ? label : undefined}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center',
              gap: '0.75rem', padding: collapsed ? '0.7rem' : '0.7rem 1rem',
              justifyContent: collapsed ? 'center' : 'flex-start',
              color: isActive ? 'var(--accent-soft)' : 'var(--text-secondary)',
              background: isActive ? 'var(--accent-glow)' : 'transparent',
              borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
              fontSize: '0.875rem', fontWeight: isActive ? 600 : 400,
              transition: 'all 0.15s', textDecoration: 'none', whiteSpace: 'nowrap',
            })}
          >
            <Icon size={17} strokeWidth={1.75} style={{ flexShrink: 0 }} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '0.5rem 0.5rem 0.75rem' }}>
        <ThemeDropdown collapsed={collapsed} />

        {!collapsed && (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '0.625rem',
    padding: '0.625rem 0.75rem', margin: '0.375rem 0',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
  }}>
    <div style={{
      width: 32, height: 32, borderRadius: '50%',
      background: 'var(--accent)', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontSize: '0.875rem', fontWeight: 700,
      color: 'var(--bg-primary)', flexShrink: 0,
    }}>
      {user?.name?.[0]?.toUpperCase() || '?'}
    </div>
    <div style={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
      {user ? (
        <>
          <div style={{
            fontSize: '0.8rem', fontWeight: 600,
            color: 'var(--text-primary)',
            whiteSpace: 'nowrap', overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {user.name}
          </div>
          <div style={{
            fontSize: '0.7rem', color: 'var(--text-secondary)',
            whiteSpace: 'nowrap', overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {user.email}
          </div>
        </>
      ) : (
        <>
          <div style={{
            height: 10, width: '70%', borderRadius: 4,
            background: 'var(--bg-hover)', marginBottom: '0.3rem',
          }} />
          <div style={{
            height: 8, width: '90%', borderRadius: 4,
            background: 'var(--bg-hover)',
          }} />
        </>
      )}
    </div>
  </div>
)}

        <button
          onClick={handleLogout}
          title="Log out"
          style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            width: '100%', padding: collapsed ? '0.6rem' : '0.5rem 0.75rem',
            justifyContent: collapsed ? 'center' : 'flex-start',
            background: 'transparent', color: 'var(--danger)',
            borderRadius: 'var(--radius)', fontSize: '0.8rem',
            border: 'none', cursor: 'pointer', transition: 'opacity 0.15s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          <LogOut size={16} strokeWidth={1.75} />
          {!collapsed && <span>Log out</span>}
        </button>
      </div>
    </aside>
  );
}