import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Server,
  AlertTriangle,
  Clock,
  Sliders,
  RotateCw,
  Zap,
  Terminal,
  CheckCircle2,
  TrendingUp,
  Cpu
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export const MonitoringPage = () => {
  const navigate = useNavigate();
  const [timeWindow, setTimeWindow] = useState('1H');
  const [promqlModalOpen, setPromqlModalOpen] = useState(false);
  const [promqlQuery, setPromqlQuery] = useState('histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))');

  // Chart 1: CPU Utilization (%) peaking at 88.4%
  const cpuChartData = [
    { time: 'T-60m', cpu: 26, threshold: 80 },
    { time: 'T-45m', cpu: 32, threshold: 80 },
    { time: 'T-30m', cpu: 34, threshold: 80 },
    { time: 'T-15m', cpu: 46, threshold: 80 },
    { time: 'T-8m', cpu: 72, threshold: 80 },
    { time: 'T-4m', cpu: 88.4, threshold: 80 }, // Spike!
    { time: 'Now', cpu: 56, threshold: 80 },
  ];

  // Chart 2: Memory Usage (Cluster)
  const memoryChartData = [
    { time: 'T-60m', used: 3.2, limit: 6.0 },
    { time: 'T-45m', used: 3.4, limit: 6.0 },
    { time: 'T-30m', used: 3.6, limit: 6.0 },
    { time: 'T-15m', used: 3.9, limit: 6.0 },
    { time: 'T-5m', used: 4.1, limit: 6.0 },
    { time: 'Now', used: 4.1, limit: 6.0 },
  ];

  // Chart 3: Throughput & HTTP 5xx rate
  const throughputData = [
    { time: '10:00', rps: 380, errRate: 0.2 },
    { time: '10:15', rps: 410, errRate: 0.5 },
    { time: '10:30', rps: 450, errRate: 6.2 }, // Error spike!
    { time: '10:45', rps: 420, errRate: 1.8 },
    { time: '11:00', rps: 395, errRate: 0.3 },
  ];

  // Chart 4: Latency Percentiles (p50, p90, p99)
  const latencyData = [
    { time: '10:00', p50: 82, p90: 160, p99: 210 },
    { time: '10:15', p50: 84, p90: 165, p99: 215 },
    { time: '10:30', p50: 95, p90: 240, p99: 410 }, // Latency spike!
    { time: '10:45', p50: 88, p90: 198, p99: 240 },
    { time: '11:00', p50: 86, p90: 175, p99: 215 },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header & Engine Status */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-mono font-bold tracking-wider text-emerald-400 uppercase">
              PROMETHEUS v2.48 ONLINE
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-xs font-mono text-slate-400">Live 10s Stream • Scrape Interval: 5000ms</span>
          </div>
          <h1 className="font-heading text-2xl font-bold text-white tracking-tight mt-1">
            Monitoring & Observability
          </h1>
          <p className="text-xs text-slate-400">
            Track resource metrics and detect operational anomalies in real-time telemetry pipelines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Window Switcher */}
          <div className="flex bg-slate-900 border border-slate-700/80 rounded-lg p-0.5 text-xs font-mono">
            {['1H', '6H', '24H'].map((t) => (
              <button
                key={t}
                onClick={() => setTimeWindow(t)}
                className={`px-3 py-1 rounded font-semibold transition-colors ${timeWindow === t ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={() => navigate('/settings')}
            className="btn-cyber-dark text-xs"
          >
            <Sliders size={14} />
            <span>Configure Alert Rules</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="cyber-card p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono font-semibold uppercase">HEALTHY TARGETS</span>
            <span className="cyber-badge badge-emerald text-[9px]">83.3% SLA</span>
          </div>
          <p className="font-heading text-2xl font-bold text-white">10 <span className="text-slate-500 text-base">/ 12</span></p>
          <span className="text-[10px] text-emerald-400 font-mono mt-1 block">Optimal SLA • +2.1%</span>
        </div>

        <div className="cyber-card p-4 rounded-xl border-amber-500/30">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono font-semibold uppercase text-amber-300">UNHEALTHY TARGETS</span>
            <span className="cyber-badge badge-amber text-[9px]">2 ATTN REQ</span>
          </div>
          <p className="font-heading text-2xl font-bold text-amber-400">2</p>
          <span className="text-[10px] text-slate-400 font-mono mt-1 block">1 Degraded • 1 Down (k8s-worker-us-east-04)</span>
        </div>

        <div className="cyber-card p-4 rounded-xl border-rose-500/30">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono font-semibold uppercase text-rose-300">ACTIVE ALERTS</span>
            <span className="cyber-badge badge-rose text-[9px]">3 FIRING</span>
          </div>
          <p className="font-heading text-2xl font-bold text-rose-400">3</p>
          <span className="text-[10px] text-slate-400 font-mono mt-1 block">1 Critical • 2 Warning</span>
        </div>

        <div className="cyber-card p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono font-semibold uppercase">AVG REQUEST LATENCY</span>
            <span className="cyber-badge badge-rose text-[9px]">410ms Spike</span>
          </div>
          <p className="font-heading text-2xl font-bold text-white">124 <span className="text-slate-500 text-base">ms</span></p>
          <span className="text-[10px] text-slate-400 font-mono mt-1 block">p50: 86ms • p90: 198ms • p99: 410ms</span>
        </div>
      </div>

      {/* Active Trigger Thresholds Strip */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-400 flex-wrap gap-2">
        <span className="text-slate-500 font-bold tracking-wider uppercase text-[10px]">
          ACTIVE TRIGGER THRESHOLDS:
        </span>
        <div className="flex items-center gap-4 flex-wrap">
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">CPU &gt; 80% (5m)</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">Memory &gt; 85%</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">Probe Fail 3× 500</span>
          <span className="px-2 py-0.5 rounded bg-rose-950/80 border border-rose-800/60 text-rose-300 font-semibold">
            5xx Rate &gt; 5.0% (TRIPPED)
          </span>
        </div>
      </div>

      {/* 4 Rich Real-Time Telemetry Charts (2x2 Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: CPU Utilization (%) */}
        <div className="cyber-card p-5 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <Cpu size={15} className="text-rose-400" />
                <h3 className="font-heading text-sm font-bold text-white uppercase font-mono">
                  CPU Utilization (%)
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">Cluster aggregate peak load vs threshold</p>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-rose-400 font-mono">88.4%</span>
              <span className="text-[10px] text-slate-500 font-mono block">LIMIT: 80%</span>
            </div>
          </div>

          <div style={{ width: '100%', height: 180 }}>
            <ResponsiveContainer>
              <AreaChart data={cpuChartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="cpuRoseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0a101f', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px' }} />
                <Line type="monotone" dataKey="threshold" stroke="#ef4444" strokeDasharray="4 4" dot={false} strokeWidth={1.5} />
                <Area type="monotone" dataKey="cpu" stroke="#f43f5e" strokeWidth={2.5} fill="url(#cpuRoseGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] font-mono text-rose-400 mt-2 text-right">Now (Spike 88.4% - Auto-remediation candidate)</p>
        </div>

        {/* Chart 2: Memory Usage (Cluster) */}
        <div className="cyber-card p-5 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <Server size={15} className="text-emerald-400" />
                <h3 className="font-heading text-sm font-bold text-white uppercase font-mono">
                  Memory Usage (Cluster)
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">Active pool allocation vs soft headroom</p>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-emerald-400 font-mono">4.1 / 6.0 GB</span>
              <span className="text-[10px] text-slate-500 font-mono block">68% NOMINAL</span>
            </div>
          </div>

          <div style={{ width: '100%', height: 180 }}>
            <ResponsiveContainer>
              <AreaChart data={memoryChartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="memEmeraldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={[0, 6.5]} />
                <Tooltip contentStyle={{ backgroundColor: '#0a101f', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px' }} />
                <Area type="monotone" dataKey="used" stroke="#10b981" strokeWidth={2.5} fill="url(#memEmeraldGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] font-mono text-slate-500 mt-2">
            Allocated: 4.1 GB Buffers: 480 MB Cached: 790 MB Available: 1.9 GB
          </p>
        </div>

        {/* Chart 3: Throughput & HTTP 5xx Rate */}
        <div className="cyber-card p-5 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp size={15} className="text-cyan-400" />
                <h3 className="font-heading text-sm font-bold text-white uppercase font-mono">
                  Throughput & HTTP 5xx
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">Rate 420 rps | 5xx threshold &gt; 5.0%</p>
            </div>
            <span className="cyber-badge badge-rose text-[10px]">6.2% Max 5xx TRIPPED</span>
          </div>

          <div style={{ width: '100%', height: 180 }}>
            <ResponsiveContainer>
              <BarChart data={throughputData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0a101f', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="rps" fill="#0284c7" radius={[4, 4, 0, 0]} name="Throughput (rps)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] font-mono text-cyan-400 mt-2">Peak error rate correlates with worker pool threadlock</p>
        </div>

        {/* Chart 4: Latency Percentiles (p50, p90, p99) */}
        <div className="cyber-card p-5 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-indigo-400" />
                <h3 className="font-heading text-sm font-bold text-white uppercase font-mono">
                  Latency Distribution
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">p50, p90, and p99 SLA envelope over time</p>
            </div>
            <span className="cyber-badge badge-rose text-[10px]">410ms p99 DEGRADATION</span>
          </div>

          <div style={{ width: '100%', height: 180 }}>
            <ResponsiveContainer>
              <LineChart data={latencyData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={[0, 450]} />
                <Tooltip contentStyle={{ backgroundColor: '#0a101f', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px' }} />
                <Line type="monotone" dataKey="p50" stroke="#00f0ff" strokeWidth={2} dot={false} name="p50 (86ms)" />
                <Line type="monotone" dataKey="p90" stroke="#6366f1" strokeWidth={2} dot={false} name="p90 (198ms)" />
                <Line type="monotone" dataKey="p99" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 3 }} name="p99 (410ms)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-2">
            <span className="text-cyan-400">p50: 86ms (Nominal)</span>
            <span className="text-indigo-400">p90: 198ms</span>
            <span className="text-rose-400">p99: 410ms (SLA Breach)</span>
          </div>
        </div>
      </div>

      {/* PromQL Alert Diagnostics Section */}
      <div className="cyber-card p-5 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Terminal size={16} className="text-cyan-400" />
            <h3 className="font-heading text-sm font-bold text-white uppercase font-mono">
              Alert Diagnostics (PromQL Inspect)
            </h3>
          </div>
          <button
            onClick={() => setPromqlModalOpen(!promqlModalOpen)}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300"
          >
            {promqlModalOpen ? 'Hide Query Console' : 'Open PromQL Console'}
          </button>
        </div>

        {promqlModalOpen && (
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2 mb-3">
            <input
              type="text"
              value={promqlQuery}
              onChange={(e) => setPromqlQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs font-mono text-cyan-300 focus:outline-none"
            />
            <div className="flex justify-end gap-2 text-xs font-mono">
              <button className="btn-cyan text-[11px] py-1 px-3">Execute Query</button>
            </div>
          </div>
        )}

        <div className="space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between p-2.5 rounded bg-slate-900/60 border border-slate-800">
            <span className="text-rose-400 font-semibold">ServiceEndpointTimeout</span>
            <span className="text-slate-400">Target: cloudshield-api:8080 (3 consecutive timeouts)</span>
            <span className="cyber-badge badge-rose text-[9px]">FIRING</span>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded bg-slate-900/60 border border-slate-800">
            <span className="text-amber-400 font-semibold">HighCPUUtilization</span>
            <span className="text-slate-400">Target: test-web-service (&gt;80% for 5m)</span>
            <span className="cyber-badge badge-amber text-[9px]">WARNING</span>
          </div>
        </div>
      </div>
    </div>
  );
};
