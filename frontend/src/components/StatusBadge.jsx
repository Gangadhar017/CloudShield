import React from 'react';

export const StatusBadge = ({ status = 'unknown', label, size = 'sm' }) => {
  const norm = String(status).toLowerCase();

  let colorClasses = 'bg-slate-800/80 text-slate-300 border-slate-700';
  let dotColor = '#94a3b8';

  if (['healthy', 'resolved', 'succeeded', 'success'].includes(norm)) {
    colorClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    dotColor = '#10b981';
  } else if (['critical', 'unhealthy', 'failed'].includes(norm)) {
    colorClasses = 'bg-rose-500/15 text-rose-400 border-rose-500/30 font-semibold';
    dotColor = '#f43f5e';
  } else if (['high'].includes(norm)) {
    colorClasses = 'bg-orange-500/15 text-orange-400 border-orange-500/30';
    dotColor = '#f97316';
  } else if (['degraded', 'acknowledged', 'medium', 'warning'].includes(norm)) {
    colorClasses = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    dotColor = '#f59e0b';
  } else if (['low'].includes(norm)) {
    colorClasses = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    dotColor = '#3b82f6';
  } else if (['pending', 'approved', 'executing'].includes(norm)) {
    colorClasses = 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 animate-pulse';
    dotColor = '#818cf8';
  }

  const padding = size === 'xs' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        borderRadius: '9999px',
        border: '1px solid',
        fontWeight: 500,
        textTransform: 'capitalize',
      }}
      className={`${colorClasses} ${padding}`}
    >
      <span className="pulse-dot" style={{ backgroundColor: dotColor, color: dotColor }} />
      {label || status}
    </span>
  );
};
