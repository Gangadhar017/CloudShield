import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Search, Bell, Shield, ChevronDown, CheckCircle2, Sun, Moon } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const location = useLocation();

  const getPageTitle = (path) => {
    switch (path) {
      case '/': return 'Overview';
      case '/resources': return 'Resources';
      case '/monitoring': return 'Monitoring & Observability';
      case '/security':
      case '/findings': return 'Security Posture';
      case '/incidents': return 'Incidents';
      case '/remediation': return 'Remediation & Approvals';
      case '/audit':
      case '/audit-logs': return 'Audit Logs';
      case '/reports': return 'Reports & Analytics';
      case '/settings': return 'Settings';
      default: return 'Overview';
    }
  };

  const displayName = user?.email?.split('@')[0] || 'Alex Rivera';

  return (
    <header
      style={{
        height: '56px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-nav)',
        backdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
      className="flex items-center justify-between px-6"
    >
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
        <span className="text-slate-500 hover:text-slate-300 cursor-pointer">Console</span>
        <span className="text-slate-600">/</span>
        <span className="text-slate-400 hover:text-slate-200 cursor-pointer">CloudShield Node-01</span>
        <span className="text-slate-600">/</span>
        <span className="text-cyan-400 font-semibold">{getPageTitle(location.pathname)}</span>
      </div>

      {/* Center Search Bar */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Filter resources, logs, CVEs... /"
            className="w-full bg-slate-900/80 border border-slate-700/60 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all font-mono"
          />
          <span className="absolute right-3 top-2 text-[10px] text-slate-500 font-mono border border-slate-700 px-1 rounded">/</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Local Lab Badge */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/60 text-xs font-mono">
          <span className="pulse-emerald"></span>
          <span className="text-slate-300 font-semibold text-[11px] tracking-wider">LOCAL LAB</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800/60 transition-all flex items-center justify-center border border-slate-800 hover:border-slate-700"
          title={isDark ? "Switch to Light Mode" : "Switch to Cyber Dark Mode"}
          id="theme-toggle-btn"
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Sun size={16} className="text-amber-400 hover:rotate-45 transition-transform" />
          ) : (
            <Moon size={16} className="text-indigo-600 hover:-rotate-12 transition-transform" />
          )}
        </button>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          title="3 Firing Alerts"
        >
          <Bell size={16} />
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-cyan-500 text-slate-950 font-bold text-[10px] flex items-center justify-center">
            3
          </span>
        </button>

        {/* User Pill / Profile Dropdown */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs ring-1 ring-cyan-500/40">
            {displayName[0]?.toUpperCase() || 'A'}
          </div>
          <div className="text-left hidden md:block">
            <p className="text-xs font-semibold text-slate-200 leading-tight capitalize">{displayName}</p>
            <p className="text-[10px] font-mono text-cyan-400 leading-tight uppercase font-semibold">{user?.role || 'SRE-ADMIN'}</p>
          </div>
          <button
            onClick={logout}
            title="Sign Out"
            className="text-slate-500 hover:text-rose-400 p-1 transition-colors ml-1"
          >
            <ChevronDown size={14} />
          </button>
        </div>
      </div>
    </header>
  );
};
