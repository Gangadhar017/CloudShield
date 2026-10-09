import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Server,
  Activity,
  ShieldCheck,
  AlertTriangle,
  Wrench,
  FileText,
  BarChart3,
  Settings,
  Shield,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = () => {
  const { user } = useAuth();
  const displayName = user?.email?.split('@')[0] || 'Alex Rivera';

  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/resources', label: 'Resources', icon: Server },
    { to: '/monitoring', label: 'Monitoring', icon: Activity },
    { to: '/security', label: 'Security Posture', icon: ShieldCheck },
    { to: '/incidents', label: 'Incidents', icon: AlertTriangle, badge: '4' },
    { to: '/remediation', label: 'Remediation', icon: Wrench },
    { to: '/audit', label: 'Audit Logs', icon: FileText },
    { to: '/reports', label: 'Reports', icon: BarChart3 },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      style={{
        width: '230px',
        borderRight: '1px solid var(--border-subtle)',
        background: 'var(--bg-sidebar)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '16px 12px',
        minHeight: 'calc(100vh - 56px)',
      }}
    >
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 px-3 py-2 mb-6 border-b border-slate-800/80 pb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25 ring-1 ring-cyan-400/30">
            <Shield size={18} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-bold text-base text-white tracking-tight">CloudShield</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 font-semibold">
                v2.4
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono">SecOps Command Center</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={17} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-mono font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Status Card */}
      <div className="pt-3 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2 px-2">
          <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-bold">
            LOCAL LAB
          </span>
          <span className="flex items-center gap-1 text-emerald-400 text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            99.8% OK
          </span>
        </div>

        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800/60">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
            {displayName[0]?.toUpperCase() || 'A'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-slate-200 truncate capitalize">{displayName}</p>
            <p className="text-[10px] font-mono text-slate-400 capitalize">{user?.role || 'Administrator'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
