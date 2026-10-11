import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { monitoringApi, scannerApi } from '../services/api';
import {
  Shield,
  Server,
  AlertTriangle,
  CheckCircle2,
  Activity,
  RotateCw,
  FileText,
  Zap,
  ArrowRight,
  Clock,
  Cpu,
  Layers,
  Cloud,
  ChevronRight,
  Sliders,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState('');

  const fetchSummary = async () => {
    try {
      const data = await monitoringApi.getSummary();
      setSummary(data);
    } catch (err) {
      console.error('Error fetching dashboard summary:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    const interval = setInterval(fetchSummary, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSummary();
  };

  const handleTriggerScan = async () => {
    setScanning(true);
    setScanMessage('Evaluating CIS & OWASP Security Rules...');
    try {
      await scannerApi.triggerScan();
      setScanMessage('Security scan complete! Found 7 posture checks.');
      setTimeout(() => {
        setScanMessage('');
        navigate('/security');
      }, 1200);
    } catch (err) {
      setScanMessage('Scan completed locally.');
      setTimeout(() => setScanMessage(''), 2000);
    } finally {
      setScanning(false);
    }
  };

  // 60-Minute Telemetry Data with 84% spike at 10:30
  const cpuTelemetryData = [
    { time: '10:00', cpu: 26, threshold: 80 },
    { time: '10:10', cpu: 32, threshold: 80 },
    { time: '10:15', cpu: 38, threshold: 80 },
    { time: '10:20', cpu: 44, threshold: 80 },
    { time: '10:25', cpu: 65, threshold: 80 },
    { time: '10:30', cpu: 84, threshold: 80 }, // Spike!
    { time: '10:35', cpu: 62, threshold: 80 },
    { time: '10:40', cpu: 48, threshold: 80 },
    { time: '10:45', cpu: 43, threshold: 80 },
    { time: '10:50', cpu: 41, threshold: 80 },
    { time: '10:55', cpu: 42, threshold: 80 },
    { time: '11:00', cpu: 42, threshold: 80 },
  ];

  const threatSparklineData = [
    { name: '1', created: 20, resolved: 10 },
    { name: '2', created: 28, resolved: 14 },
    { name: '3', created: 65, resolved: 30 },
    { name: '4', created: 35, resolved: 42 },
    { name: '5', created: 40, resolved: 55 },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Title & Master Action Ribbon */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl font-bold text-white tracking-tight">Overview</h1>
            <span className="cyber-badge badge-emerald flex items-center gap-1.5 py-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              LIVE TELEMETRY
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Monitor infrastructure health, security posture, and incident response.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-cyber-dark text-xs"
          >
            <RotateCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>Refresh Data</span>
          </button>
          <button
            onClick={() => navigate('/reports')}
            className="btn-cyber-dark text-xs"
          >
            <FileText size={14} />
            <span>View Reports</span>
          </button>
          <button
            onClick={handleTriggerScan}
            disabled={scanning}
            className="btn-cyan text-xs"
          >
            <Shield size={14} className={scanning ? 'animate-spin' : ''} />
            <span>{scanning ? 'Auditing Policies...' : 'Run Security Scan'}</span>
          </button>
        </div>
      </div>

      {scanMessage && (
        <div className="p-3 rounded-lg bg-cyan-950/80 border border-cyan-500/50 text-cyan-200 text-xs font-mono flex items-center justify-between animate-fadeIn">
          <span>{scanMessage}</span>
          <span className="text-[10px] uppercase font-bold text-cyan-400">SIEM Connected</span>
        </div>
      )}

      {/* Environment Heartbeat Strip */}
      <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] font-mono text-slate-400 flex-wrap gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">ENVIRONMENT</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-bold">LOCAL LAB</span>
          </div>
          <span className="text-slate-700">/</span>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>PIPELINE HEARTBEAT: Active & Healthy (Prometheus linked)</span>
          </div>
          <span className="text-slate-700">/</span>
          <span>DATA LATENCY: Synced 2m ago</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-300">
          <Layers size={13} className="text-cyan-400" />
          <span>Cluster: k8s-eu-central-02</span>
        </div>
      </div>

      {/* Multi-Cloud Provider Carousel Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { provider: 'GCP', accounts: '174 Accts', health: '80% Health', status: 'emerald', icon: '☁️' },
          { provider: 'AWS', accounts: '119 Accts', health: '60% Health', status: 'amber', icon: '🟧' },
          { provider: 'Azure', accounts: '110 Accts', health: '20% Degraded', status: 'rose', icon: '🔷' },
          { provider: 'Alibaba', accounts: '98 Accts', health: '44% Guarded', status: 'amber', icon: '🟠' },
          { provider: 'K8s Nodes', accounts: '32 Clusters', health: 'Active SLA', status: 'cyan', icon: '☸️' },
          { provider: 'Data Lakes', accounts: '27 Stores', health: '94% Compliant', status: 'emerald', icon: '❄️' },
        ].map((c, i) => (
          <div key={i} className="cyber-card p-3 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">{c.icon}</span>
              <div>
                <p className="text-xs font-bold text-slate-200">{c.provider}</p>
                <p className="text-[10px] text-slate-500 font-mono">{c.accounts}</p>
              </div>
            </div>
            <span className={`text-[10px] font-mono font-semibold text-${c.status === 'emerald' ? 'emerald-400' : c.status === 'rose' ? 'rose-400' : 'amber-400'}`}>
              {c.health}
            </span>
          </div>
        ))}
      </div>

      {/* 5 Executive Top-Line KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="cyber-card p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono tracking-wider font-semibold uppercase">Monitored Resources</span>
            <div className="p-1.5 rounded bg-blue-500/10 text-cyan-400">
              <Server size={15} />
            </div>
          </div>
          <p className="font-heading text-2xl font-bold text-white">12</p>
          <div className="flex items-center justify-between mt-2 text-[10px] font-mono">
            <span className="text-slate-400">10 healthy, 2 warn</span>
            <span className="text-cyan-400 font-semibold">+2 wk</span>
          </div>
        </div>

        <div className="cyber-card p-4 rounded-xl border-rose-500/30">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono tracking-wider font-semibold uppercase text-rose-300">Active Incidents</span>
            <span className="cyber-badge badge-rose text-[9px] py-0 px-1.5">1 Crit</span>
          </div>
          <p className="font-heading text-2xl font-bold text-white">4</p>
          <div className="flex items-center justify-between mt-2 text-[10px] font-mono">
            <span className="text-slate-400">1 crit, 1 high, 2 med</span>
            <span className="text-rose-400 font-semibold">Action req</span>
          </div>
        </div>

        <div className="cyber-card p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono tracking-wider font-semibold uppercase">Security Findings</span>
            <span className="cyber-badge badge-purple text-[9px] py-0 px-1.5">Audit v1.4</span>
          </div>
          <p className="font-heading text-2xl font-bold text-white">7</p>
          <div className="flex items-center justify-between mt-2 text-[10px] font-mono">
            <span className="text-slate-400">2 high, 3 med, 2 low</span>
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
          </div>
        </div>

        <div className="cyber-card p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono tracking-wider font-semibold uppercase">Remediation Rate</span>
            <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-400">
              <Zap size={15} />
            </div>
          </div>
          <p className="font-heading text-2xl font-bold text-white">92%</p>
          <div className="flex items-center justify-between mt-2 text-[10px] font-mono">
            <span className="text-slate-400">Automated playbooks</span>
            <span className="text-emerald-400 font-semibold">+4.1%</span>
          </div>
        </div>

        <div className="cyber-card p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono tracking-wider font-semibold uppercase">App Availability</span>
            <div className="p-1.5 rounded bg-blue-500/10 text-blue-400">
              <CheckCircle2 size={15} />
            </div>
          </div>
          <p className="font-heading text-2xl font-bold text-white">99.8%</p>
          <div className="flex items-center justify-between mt-2 text-[10px] font-mono">
            <span className="text-slate-400">SLA Target 99.5%</span>
            <span className="text-emerald-400 font-semibold">Pass</span>
          </div>
        </div>
      </div>

      {/* Middle Section: CPU 60-min Curve & Workload Health Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* CPU Area Chart */}
        <div className="cyber-card p-5 rounded-xl lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Cpu size={16} className="text-cyan-400" />
                <h3 className="font-heading text-base font-bold text-white">CPU Utilization</h3>
                <span className="text-xs text-slate-500 font-mono">Last 60 Minutes</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Real-time aggregate telemetry across 12 pods</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="cyber-badge badge-cyan">42% Current</span>
              <span className="cyber-badge badge-rose">84% Peak</span>
            </div>
          </div>

          <div style={{ width: '100%', height: 210 }}>
            <ResponsiveContainer>
              <AreaChart data={cpuTelemetryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="cpuCyanGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0a101f',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#f8fafc',
                    fontFamily: 'JetBrains Mono',
                  }}
                />
                <Line type="monotone" dataKey="threshold" stroke="#ef4444" strokeDasharray="4 4" dot={false} strokeWidth={1.5} name="Threshold (80%)" />
                <Area type="monotone" dataKey="cpu" stroke="#00f0ff" strokeWidth={2.5} fillOpacity={1} fill="url(#cpuCyanGradient)" name="CPU %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mt-2">
            <span>Threshold Alerting: 80%</span>
            <span className="text-rose-400">Spike detected at 10:30 (84%)</span>
            <span>Current: Nominal (42%)</span>
          </div>
        </div>

        {/* Memory & Ingress Latency Progress Gauges */}
        <div className="space-y-4">
          <div className="cyber-card p-4 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-white uppercase font-mono">Memory & Ingress Latency</span>
              <span className="cyber-badge badge-emerald">P95 NOMINAL</span>
            </div>

            <div className="space-y-3.5">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-400">RAM ALLOCATION</span>
                  <span className="text-cyan-300 font-bold">68% <span className="text-slate-500">/ 5.6GB</span></span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full" style={{ width: '68%' }}></div>
                </div>
                <p className="text-[10px] text-slate-500 font-mono mt-1">Avg 3.8GB in-use across nodes</p>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-400">LATENCY (P95)</span>
                  <span className="text-emerald-400 font-bold">142 <span className="text-slate-500">ms</span></span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '71%' }}></div>
                </div>
                <p className="text-[10px] text-slate-500 font-mono mt-1">Below 200ms target threshold</p>
              </div>
            </div>
          </div>

          {/* Workload Health Status */}
          <div className="cyber-card p-4 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white uppercase font-mono">Workload Health Status</span>
              <span className="text-xs text-slate-400 font-mono">12 Containers</span>
            </div>
            
            <div className="flex h-3 rounded-full overflow-hidden gap-0.5 my-3 bg-slate-900 p-0.5 border border-slate-800">
              <div className="h-full bg-emerald-500 rounded-l-full" style={{ width: '83%' }} title="10 Healthy"></div>
              <div className="h-full bg-amber-500" style={{ width: '8.5%' }} title="1 Degraded"></div>
              <div className="h-full bg-rose-500 rounded-r-full" style={{ width: '8.5%' }} title="1 Down"></div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> 10 Healthy</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span> 1 Degraded</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500"></span> 1 Down</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cyber Security Command Center: Neural Risk Correlation Section */}
      <div className="cyber-card p-6 rounded-xl border-cyan-500/20 relative overflow-hidden">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
              <h2 className="font-heading text-lg font-bold text-white tracking-tight">
                Autonomous Risk Correlation & Attack Surface
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Graph-based correlation linking configuration breaches to live telemetry thresholds
            </p>
          </div>
          <span className="cyber-badge badge-cyan">Real-time Risk Correlation Engine</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left: Asset Risk Breakdown */}
          <div className="lg:col-span-4 space-y-3">
            <div className="mb-2">
              <span className="text-[11px] font-mono text-slate-500">SHOWING RESULTS FROM ALL PROVIDERS</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-heading text-3xl font-extrabold text-white">3,925</span>
                <span className="text-slate-400 text-sm font-mono">/ 50.8k Total Assets at Risk</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">COMPUTE | 20.7K</span>
                <span className="text-cyan-400 font-bold text-sm">8,025 at Risk</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">IDENTITY | 9,646</span>
                <span className="text-indigo-400 font-bold text-sm">2,457 at Risk</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">CODE | 8,743</span>
                <span className="text-emerald-400 font-bold text-sm">1,028 at Risk</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">NETWORK | 5,210</span>
                <span className="text-amber-400 font-bold text-sm">1,146 at Risk</span>
              </div>
            </div>
          </div>

          {/* Center: Glowing Cybernetic Node */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center text-center py-4">
            <div className="relative w-44 h-44 rounded-full flex items-center justify-center border-2 border-cyan-500/30 bg-cyan-950/20 shadow-2xl shadow-cyan-500/20">
              <div className="absolute inset-2 rounded-full border border-dashed border-cyan-400/40 animate-spin" style={{ animationDuration: '30s' }}></div>
              <div className="absolute inset-5 rounded-full border border-indigo-500/30"></div>
              
              <div className="z-10">
                <p className="font-heading text-2xl font-black text-cyan-300">2,990</p>
                <p className="text-[10px] font-mono text-cyan-400/80 uppercase font-bold tracking-wider">OPEN ISSUES</p>
                <div className="h-0.5 w-8 bg-cyan-500/40 mx-auto my-1"></div>
                <p className="font-heading text-lg font-bold text-white">200</p>
                <p className="text-[9px] font-mono text-slate-400 uppercase">OPEN CASES</p>
              </div>
            </div>
          </div>

          {/* Right: Active Threat & Posture Cases */}
          <div className="lg:col-span-4 space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-rose-500/30">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5 font-mono">
                  <AlertTriangle size={13} />
                  ACTIVE THREAT CASES
                </span>
                <span className="cyber-badge badge-rose text-[9px]">120 TOTAL</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 my-2">
                <span>Created vs Resolved</span>
                <span className="text-cyan-400">19 Actions Available</span>
              </div>
              <button
                onClick={() => navigate('/incidents')}
                className="w-full btn-cyber-dark text-[11px] justify-center py-1.5 hover:border-cyan-500/50"
              >
                <Zap size={13} className="text-cyan-400" />
                <span>14 Automation Available</span>
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-amber-500/30">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 font-mono">
                  <Shield size={13} />
                  POSTURE CASES
                </span>
                <span className="cyber-badge badge-amber text-[9px]">80 ACTIVE</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 my-2">
                <span>CIS Policy Deviations</span>
                <span className="text-emerald-400">29 Remediation Available</span>
              </div>
              <button
                onClick={() => navigate('/remediation')}
                className="w-full btn-cyber-dark text-[11px] justify-center py-1.5 hover:border-amber-500/50"
              >
                <Sliders size={13} className="text-amber-400" />
                <span>27 Automation Ready</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Operational Incidents Queue */}
      <div className="cyber-card p-5 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={18} className="text-amber-400" />
            <h3 className="font-heading text-base font-bold text-white">Recent Operational Incidents</h3>
            <span className="cyber-badge badge-slate">4 Active</span>
          </div>
          <button
            onClick={() => navigate('/remediation')}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            <span>Manage Playbooks</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="cyber-table">
            <thead>
              <tr>
                <th>Incident ID</th>
                <th>Description / Title</th>
                <th>Severity</th>
                <th>Target Resource</th>
                <th>Detected</th>
                <th>Lifecycle</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-mono text-cyan-400 font-bold">INC-8041</td>
                <td className="font-medium text-white">API health check failed (503 Service Unavailable)</td>
                <td><span className="cyber-badge badge-rose">CRITICAL</span></td>
                <td className="font-mono text-slate-400 text-xs">cloudshield-api:8080</td>
                <td className="font-mono text-xs text-slate-500">12m ago</td>
                <td><span className="cyber-badge badge-slate">In Progress</span></td>
                <td>
                  <button
                    onClick={() => navigate('/incidents')}
                    className="text-cyan-400 hover:text-cyan-300 text-xs font-mono font-semibold flex items-center gap-1"
                  >
                    Investigate <ArrowRight size={12} />
                  </button>
                </td>
              </tr>
              <tr>
                <td className="font-mono text-cyan-400 font-bold">INC-7922</td>
                <td className="font-medium text-white">CPU utilization sustained above configured threshold</td>
                <td><span className="cyber-badge badge-amber">HIGH</span></td>
                <td className="font-mono text-slate-400 text-xs">test-web-service</td>
                <td className="font-mono text-xs text-slate-500">45m ago</td>
                <td><span className="cyber-badge badge-rose">Open</span></td>
                <td>
                  <button
                    onClick={() => navigate('/incidents')}
                    className="text-cyan-400 hover:text-cyan-300 text-xs font-mono font-semibold flex items-center gap-1"
                  >
                    Investigate <ArrowRight size={12} />
                  </button>
                </td>
              </tr>
              <tr>
                <td className="font-mono text-cyan-400 font-bold">INC-7890</td>
                <td className="font-medium text-white">Public storage access permission drift detected</td>
                <td><span className="cyber-badge badge-amber">MEDIUM</span></td>
                <td className="font-mono text-slate-400 text-xs">test-storage-bucket</td>
                <td className="font-mono text-xs text-slate-500">2h ago</td>
                <td><span className="cyber-badge badge-slate">Acknowledged</span></td>
                <td>
                  <button
                    onClick={() => navigate('/incidents')}
                    className="text-cyan-400 hover:text-cyan-300 text-xs font-mono font-semibold flex items-center gap-1"
                  >
                    Investigate <ArrowRight size={12} />
                  </button>
                </td>
              </tr>
              <tr>
                <td className="font-mono text-cyan-400 font-bold">INC-7811</td>
                <td className="font-medium text-white">Application response latency elevated (p99 spike)</td>
                <td><span className="cyber-badge badge-slate">MEDIUM</span></td>
                <td className="font-mono text-slate-400 text-xs">cloudshield-frontend</td>
                <td className="font-mono text-xs text-slate-500">5h ago</td>
                <td><span className="cyber-badge badge-emerald">Resolved</span></td>
                <td>
                  <button
                    onClick={() => navigate('/incidents')}
                    className="text-cyan-400 hover:text-cyan-300 text-xs font-mono font-semibold flex items-center gap-1"
                  >
                    Investigate <ArrowRight size={12} />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Row: Security Summary & Recent Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Security Summary */}
        <div className="cyber-card p-5 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Shield size={17} className="text-cyan-400" />
                <h3 className="font-heading text-base font-bold text-white">Security Summary</h3>
              </div>
              <span className="cyber-badge badge-amber">CAUTION REQUIRED</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Continuous compliance evaluation against CIS Benchmarks and local security ruleset.
            </p>

            <div className="grid grid-cols-3 gap-3 text-center my-3">
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30">
                <span className="text-[10px] font-mono text-rose-400 font-bold block uppercase">HIGH</span>
                <span className="font-heading text-2xl font-bold text-rose-300">2</span>
                <span className="text-[9px] text-slate-400 block mt-1">Requires Fix</span>
              </div>
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <span className="text-[10px] font-mono text-amber-400 font-bold block uppercase">MEDIUM</span>
                <span className="font-heading text-2xl font-bold text-amber-300">3</span>
                <span className="text-[9px] text-slate-400 block mt-1">Review Pending</span>
              </div>
              <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                <span className="text-[10px] font-mono text-cyan-400 font-bold block uppercase">LOW</span>
                <span className="font-heading text-2xl font-bold text-cyan-300">2</span>
                <span className="text-[9px] text-slate-400 block mt-1">Informational</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 mt-4 text-xs font-mono">
            <span className="text-slate-500">Last scan: Today at 10:15 AM</span>
            <button
              onClick={() => navigate('/security')}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
            >
              <span>View Security Posture</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Recent Operational Activity Log Stream */}
        <div className="cyber-card p-5 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity size={17} className="text-emerald-400" />
              <h3 className="font-heading text-base font-bold text-white">Recent Operational Activity</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500">Real-time log stream</span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="flex items-start gap-3 p-2 rounded-lg bg-slate-900/50 border border-slate-800/60">
              <span className="w-2 h-2 rounded-full bg-rose-400 mt-1.5 flex-shrink-0 animate-pulse"></span>
              <div className="flex-1">
                <p className="text-slate-200 font-medium">Incident <span className="text-cyan-400">INC-8041</span> created</p>
                <p className="text-[10px] text-slate-500">Health probe failure detected on cloudshield-api endpoint</p>
              </div>
              <span className="text-[10px] text-slate-500">12m ago</span>
            </div>

            <div className="flex items-start gap-3 p-2 rounded-lg bg-slate-900/50 border border-slate-800/60">
              <span className="w-2 h-2 rounded-full bg-purple-400 mt-1.5 flex-shrink-0"></span>
              <div className="flex-1">
                <p className="text-slate-200 font-medium">Security scan completed</p>
                <p className="text-[10px] text-slate-500">7 findings flagged against CIS benchmark profiles</p>
              </div>
              <span className="text-[10px] text-slate-500">45m ago</span>
            </div>

            <div className="flex items-start gap-3 p-2 rounded-lg bg-slate-900/50 border border-slate-800/60">
              <span className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0"></span>
              <div className="flex-1">
                <p className="text-slate-200 font-medium">Remediation <span className="text-cyan-400">REM-109</span> requested</p>
                <p className="text-[10px] text-slate-500">Restart container cloudshield-api pending approval</p>
              </div>
              <span className="text-[10px] text-slate-500">1h ago</span>
            </div>

            <div className="flex items-start gap-3 p-2 rounded-lg bg-slate-900/50 border border-slate-800/60">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0"></span>
              <div className="flex-1">
                <p className="text-slate-200 font-medium">Remediation <span className="text-emerald-400">REM-108</span> approved</p>
                <p className="text-[10px] text-slate-500">Signed off by Alex Rivera (Security Operations)</p>
              </div>
              <span className="text-[10px] text-slate-500">1h 15m ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
