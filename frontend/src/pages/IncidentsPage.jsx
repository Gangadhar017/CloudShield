import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { incidentsApi } from '../services/api';
import {
  AlertTriangle,
  Clock,
  Zap,
  CheckCircle2,
  Share2,
  UserCheck,
  RotateCw,
  Search,
  ExternalLink,
  Cpu,
  Shield,
  Activity,
  ArrowRight,
  ChevronRight,
  Flame,
  Layers,
  Terminal,
  FileText
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export const IncidentsPage = () => {
  const navigate = useNavigate();
  const [selectedIncident, setSelectedIncident] = useState('INC-8041');
  const [activeTab, setActiveTab] = useState('overview');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionDone, setActionDone] = useState(false);

  // Telemetry Snapshot Chart Data (Last 30 Min) with sudden latency/error surge
  const telemetrySnapshotData = [
    { time: '10:35', latency: 42, errorRate: 0 },
    { time: '10:40', latency: 44, errorRate: 0 },
    { time: '10:44', latency: 50, errorRate: 0 },
    { time: '10:46', latency: 680, errorRate: 45 }, // Probe Timeout Spike!
    { time: '10:50', latency: 1100, errorRate: 90 },
    { time: '10:55', latency: 1250, errorRate: 100 },
    { time: '11:00', latency: 1250, errorRate: 100 },
  ];

  const incidentsList = [
    {
      id: 'INC-8041',
      title: 'API health check failed (503 Service Unavailable)',
      severity: 'CRITICAL',
      status: 'IN PROGRESS',
      resource: 'cloudshield-api:8080',
      time: '14m ago',
      assigned: 'Alex Rivera (Administrator)',
      leadPlaybook: 'PB-RESTART-04',
      jobId: 'REM-109'
    },
    {
      id: 'INC-7922',
      title: 'CPU utilization sustained >80% threshold',
      severity: 'HIGH',
      status: 'OPEN',
      resource: 'test-web-service',
      time: '48m ago',
      assigned: 'Unassigned',
      leadPlaybook: 'PB-SCALE-OUT',
      jobId: 'REM-110'
    },
    {
      id: 'INC-7890',
      title: 'Public storage access permission drift detected',
      severity: 'MEDIUM',
      status: 'ACKNOWLEDGED',
      resource: 'test-storage-bucket',
      time: '2h ago',
      assigned: 'Security Bot',
      leadPlaybook: 'PB-S3-PRIVATE',
      jobId: 'REM-107'
    },
    {
      id: 'INC-7811',
      title: 'Application response latency spike (p99 > 410ms)',
      severity: 'MEDIUM',
      status: 'RESOLVED',
      resource: 'cloudshield-frontend',
      time: '5h ago',
      assigned: 'Alex Rivera',
      leadPlaybook: 'PB-CACHE-PURGE',
      jobId: 'REM-108'
    }
  ];

  const filteredIncidents = incidentsList.filter(inc => {
    if (filterSeverity !== 'all' && inc.severity.toLowerCase() !== filterSeverity.toLowerCase()) return false;
    if (searchQuery && !inc.title.toLowerCase().includes(searchQuery.toLowerCase()) && !inc.id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const activeInc = incidentsList.find(i => i.id === selectedIncident) || incidentsList[0];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-heading text-2xl font-bold text-white tracking-tight">
              Incident Management
            </h1>
            <span className="cyber-badge badge-rose">4 ACTIVE INCIDENTS</span>
            <span className="cyber-badge badge-slate">LOCAL LAB TESTBED</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Investigate, prioritize, and orchestrate controlled recovery for operational anomalies and security breaches.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button className="btn-cyber-dark text-xs">
            Export Report
          </button>
          <button className="btn-cyber-dark text-xs">
            Create Manual
          </button>
          <button
            onClick={() => navigate('/monitoring')}
            className="btn-cyan text-xs"
          >
            <Activity size={14} />
            <span>Run Diagnostics Probe</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="cyber-card p-4 rounded-xl border-rose-500/30">
          <span className="text-[11px] font-mono text-rose-300 block mb-1">OPEN INCIDENTS</span>
          <p className="font-heading text-2xl font-bold text-rose-400">4 <span className="text-xs font-mono text-rose-300 font-semibold">(1 Critical)</span></p>
          <span className="text-[10px] text-slate-400 font-mono mt-1 block">1 High • 2 Medium</span>
        </div>

        <div className="cyber-card p-4 rounded-xl">
          <span className="text-[11px] font-mono text-slate-400 block mb-1">MEAN TIME TO DETECT (MTTD)</span>
          <p className="font-heading text-2xl font-bold text-white">4.2 <span className="text-xs font-mono text-slate-400">m</span> <span className="text-xs font-mono text-emerald-400 font-semibold">↓ -18%</span></p>
          <span className="text-[10px] text-slate-500 font-mono mt-1 block">vs. last week rolling baseline</span>
        </div>

        <div className="cyber-card p-4 rounded-xl">
          <span className="text-[11px] font-mono text-slate-400 block mb-1">MEAN TIME TO RECOVER (MTTR)</span>
          <p className="font-heading text-2xl font-bold text-white">18.5 <span className="text-xs font-mono text-slate-400">m</span> <span className="cyber-badge badge-purple text-[8px] py-0 px-1">AUTO-HOOK</span></p>
          <span className="text-[10px] text-slate-500 font-mono mt-1 block">Leveraging automated playbooks</span>
        </div>

        <div className="cyber-card p-4 rounded-xl">
          <span className="text-[11px] font-mono text-slate-400 block mb-1">REMEDIATION READY</span>
          <p className="font-heading text-2xl font-bold text-cyan-400">3 / 4 <span className="text-xs font-mono text-slate-400">75%</span></p>
          <span className="text-[10px] text-emerald-400 font-mono mt-1 block">Ready for 1-click execution</span>
        </div>
      </div>

      {/* Main Investigation Split Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Incidents Queue */}
        <div className="lg:col-span-4 space-y-3">
          <div className="cyber-card p-3 rounded-xl space-y-2.5">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search incident ID, service..."
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none font-mono"
              />
            </div>

            {/* Severity Tabs */}
            <div className="grid grid-cols-4 gap-1 text-[11px] font-mono">
              {[
                { label: 'All (4)', key: 'all' },
                { label: 'Crit (1)', key: 'critical', activeColor: 'text-rose-400 border-rose-500/40 bg-rose-950/40' },
                { label: 'High (1)', key: 'high' },
                { label: 'Med (2)', key: 'medium' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilterSeverity(tab.key)}
                  className={`py-1 rounded text-center font-semibold transition-all border ${
                    filterSeverity === tab.key
                      ? tab.activeColor || 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                      : 'border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Incident Items */}
          <div className="space-y-2.5">
            {filteredIncidents.map((inc) => {
              const isSelected = selectedIncident === inc.id;
              return (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncident(inc.id)}
                  className={`p-3.5 rounded-xl cyber-card cursor-pointer transition-all ${
                    isSelected ? 'cyber-card-active bg-slate-900/90' : 'hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-cyan-400 font-bold text-xs">{inc.id}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{inc.time}</span>
                  </div>

                  <p className="text-xs font-semibold text-slate-100 line-clamp-2 leading-relaxed">
                    {inc.title}
                  </p>

                  <div className="flex items-center justify-between mt-3 text-[10px] font-mono">
                    <span className={`cyber-badge ${inc.severity === 'CRITICAL' ? 'badge-rose' : inc.severity === 'HIGH' ? 'badge-amber' : 'badge-slate'}`}>
                      {inc.severity}
                    </span>
                    <span className="text-slate-400">{inc.resource}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <Zap size={14} className="text-cyan-400" />
              Lab Cluster Node Ingress
            </span>
            <span className="cyber-badge badge-emerald text-[9px]">Normal Flow</span>
          </div>
        </div>

        {/* Right Column: Deep Investigation Workspace */}
        <div className="lg:col-span-8 space-y-4">
          <div className="cyber-card p-6 rounded-xl border-cyan-500/30">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="cyber-badge badge-rose">{activeInc.severity}</span>
                  <span className="cyber-badge badge-cyan">{activeInc.status}</span>
                  <span className="font-mono text-xs text-slate-400 font-semibold">{activeInc.id}</span>
                </div>
                <h2 className="font-heading text-xl font-bold text-white tracking-tight">
                  {activeInc.title}
                </h2>
                <div className="flex items-center gap-4 text-xs font-mono text-slate-400 mt-2">
                  <span>Target: <span className="text-slate-200 font-semibold">{activeInc.resource}</span></span>
                  <span>Assigned: <span className="text-slate-200">{activeInc.assigned}</span></span>
                </div>
              </div>

              <button
                onClick={() => navigate('/remediation')}
                className="btn-cyan text-xs font-mono font-bold py-2 px-4 shadow-lg shadow-cyan-500/20"
              >
                <Zap size={14} />
                <span>Initiate {activeInc.jobId}</span>
              </button>
            </div>

            {/* Quick Action Toolbar */}
            <div className="flex items-center gap-2 py-3 border-b border-slate-800/80 text-xs font-mono flex-wrap">
              <button className="btn-cyber-dark text-[11px] py-1 px-3">
                <CheckCircle2 size={13} className="text-emerald-400" />
                <span>Acknowledge</span>
              </button>
              <button className="btn-cyber-dark text-[11px] py-1 px-3">
                <span>Change Severity</span>
              </button>
              <button className="btn-cyber-dark text-[11px] py-1 px-3">
                <UserCheck size={13} />
                <span>Assign Operator</span>
              </button>
              <button className="btn-cyber-dark text-[11px] py-1 px-3">
                <Share2 size={13} />
                <span>Share Thread</span>
              </button>
            </div>

            {/* Workspace Tabs */}
            <div className="flex gap-4 border-b border-slate-800 mt-3 text-xs font-mono">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-2 font-semibold transition-colors ${activeTab === 'overview' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-white'}`}
              >
                Overview & Diagnostics
              </button>
              <button
                onClick={() => setActiveTab('timeline')}
                className={`pb-2 font-semibold transition-colors ${activeTab === 'timeline' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-white'}`}
              >
                Event Timeline
              </button>
              <button
                onClick={() => setActiveTab('telemetry')}
                className={`pb-2 font-semibold transition-colors ${activeTab === 'telemetry' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-white'}`}
              >
                Telemetry & Logs
              </button>
              <button
                onClick={() => setActiveTab('related')}
                className={`pb-2 font-semibold transition-colors ${activeTab === 'related' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-white'}`}
              >
                Related Findings (1)
              </button>
            </div>

            {/* Tab 1: Overview & Diagnostics */}
            {activeTab === 'overview' && (
              <div className="space-y-4 pt-4">
                {/* AI Root Cause Diagnostics */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase font-mono flex items-center gap-1.5">
                      <Flame size={14} className="text-cyan-400" />
                      Automated Root Cause Diagnostics
                    </span>
                    <span className="cyber-badge badge-emerald text-[9px]">94% CONFIDENCE AI ENGINE</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono space-y-2">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">ROOT CAUSE HYPOTHESIS</span>
                    <p className="text-slate-200 leading-relaxed">
                      Out-of-memory worker thread lock caused by unoptimized JSON log parser aggregation loop, leading to failed HTTP health probes at <code className="text-cyan-400 font-bold">/healthz</code>.
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                      <span className="text-slate-400">Prometheus Alert Triggered: <span className="text-rose-400 font-semibold">ServiceEndpointTimeout</span></span>
                      <span className="text-slate-400">Failure Signature: <span className="text-amber-400">504 Gateway Timeout &gt; 3 probes</span></span>
                    </div>
                  </div>

                  {/* Telemetry Snapshot (Last 30 Min) */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[11px] font-mono text-slate-400">
                      <span>TELEMETRY SNAPSHOT (LAST 30 MINUTES)</span>
                      <span className="text-rose-400 font-bold">Latency (p99) • Error Rate %</span>
                    </div>
                    <div style={{ width: '100%', height: 140 }}>
                      <ResponsiveContainer>
                        <LineChart data={telemetrySnapshotData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
                          <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                          <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#0a101f', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px' }} />
                          <Line type="monotone" dataKey="latency" stroke="#00f0ff" strokeWidth={2.5} dot={{ r: 2 }} name="Latency (ms)" />
                          <Line type="monotone" dataKey="errorRate" stroke="#f43f5e" strokeWidth={2} strokeDasharray="3 3" dot={false} name="Error Rate %" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                      <span>10:35 UTC (Baseline 42ms)</span>
                      <span className="text-rose-400 font-semibold">10:46 UTC (Probe Timeout Spike)</span>
                      <span>11:00 UTC (Current 1,250ms / 100% err)</span>
                    </div>
                  </div>
                </div>

                {/* Chronological Incident Timeline */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white uppercase text-xs flex items-center gap-1.5">
                      <Clock size={14} className="text-cyan-400" />
                      Chronological Incident Timeline
                    </span>
                    <span className="text-[10px] text-slate-500">UTC Timestamp sync</span>
                  </div>

                  <div className="space-y-2.5 border-l-2 border-slate-800 pl-4 ml-1">
                    <div className="relative">
                      <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                      <p className="text-slate-200 font-semibold">10:46 UTC • Alert Fired</p>
                      <p className="text-[11px] text-slate-400">Prometheus alert <code className="text-rose-400">ServiceEndpointTimeout</code> triggered on target cloudshield-api.</p>
                    </div>

                    <div className="relative">
                      <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                      <p className="text-slate-200 font-semibold">10:48 UTC • Incident Auto-Created</p>
                      <p className="text-[11px] text-slate-400">Automated severity assigned as <code className="text-rose-400 font-bold">CRITICAL</code> based on tier-1 API service availability rules.</p>
                    </div>

                    <div className="relative">
                      <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
                      <p className="text-slate-200 font-semibold">10:52 UTC • Operator Triage</p>
                      <p className="text-[11px] text-slate-400">Alex Rivera acknowledged incident, confirmed deadlock state, and matched automated runbook <code className="text-cyan-400 font-bold">PB-RESTART-04</code>.</p>
                    </div>

                    <div className="relative">
                      <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                      <p className="text-slate-200 font-semibold">10:58 UTC • Remediation Job Generated</p>
                      <p className="text-[11px] text-slate-400">Remediation pipeline generated job <code className="text-cyan-400 font-bold">REM-109</code> (Graceful Docker container restart & health probe verification) ready for approval.</p>
                    </div>
                  </div>
                </div>

                {/* Linked Finding & Lab Sandbox Policy */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-lg bg-slate-900/80 border border-amber-500/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-amber-300 font-semibold flex items-center gap-1">
                        <AlertTriangle size={13} />
                        Linked Security Finding
                      </span>
                      <span className="cyber-badge badge-amber text-[9px]">SEC-005</span>
                    </div>
                    <p className="text-slate-300 text-[11px] mt-1">
                      Privileged container execution flag enabled on cloudshield-api. Pod sandbox policy requires capability dropping.
                    </p>
                    <button
                      onClick={() => navigate('/security')}
                      className="text-cyan-400 hover:text-cyan-300 text-[10px] mt-2 block"
                    >
                      View Policy Finding in Security Posture &gt;
                    </button>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <Shield size={13} />
                        Lab Sandbox Policy
                      </span>
                      <span className="cyber-badge badge-emerald text-[9px]">ISOLATED</span>
                    </div>
                    <p className="text-slate-300 text-[11px] mt-1">
                      Safe Lab Execution verified: Container restart will execute within local Docker sandbox without persistent data loss or upstream router disruption.
                    </p>
                    <span className="text-slate-500 text-[10px] block mt-2">✓ Idempotent operation confirmed</span>
                  </div>
                </div>

                {/* Recommended Recovery Action Banner */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/60 to-slate-900/90 border border-cyan-500/50 flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold tracking-wider uppercase block">
                      RECOMMENDED RECOVERY ACTION
                    </span>
                    <p className="text-sm font-bold text-white mt-0.5">
                      Restart test container cloudshield-api and execute automated post-start health probe at /healthz.
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Playbook: <code className="text-cyan-300 font-bold">PB-RESTART-04</code> • Estimated duration: <span className="text-emerald-400">~8 seconds</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="btn-cyber-dark text-xs">
                      Reject / False Positive
                    </button>
                    <button
                      onClick={() => navigate('/remediation')}
                      className="btn-cyan text-xs font-bold py-2 px-4 shadow-lg shadow-cyan-500/30"
                    >
                      <Zap size={14} />
                      <span>Approve & Run Remediation</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab !== 'overview' && (
              <div className="p-8 text-center text-xs font-mono text-slate-400">
                <p>Viewing verified cryptographically chained records for {activeInc.id}.</p>
                <button
                  onClick={() => setActiveTab('overview')}
                  className="btn-cyan text-xs mt-3"
                >
                  Return to Overview & Diagnostics
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
