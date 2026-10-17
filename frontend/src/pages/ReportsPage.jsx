import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  FileText,
  Shield,
  CheckCircle2,
  Clock,
  Zap,
  TrendingDown,
  Layers,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

export const ReportsPage = () => {
  const [downloadMsg, setDownloadMsg] = useState('');

  const weeklyDistributionData = [
    { week: 'Week 1', critical: 3, high: 6, medium: 14 },
    { week: 'Week 2', critical: 2, high: 5, medium: 12 },
    { week: 'Week 3', critical: 1, high: 3, medium: 9 },
    { week: 'Week 4', critical: 0, high: 2, medium: 7 }, // Zero critical in week 4!
  ];

  const convergenceData = [
    { day: 'Day 01', detected: 21, remediated: 4 },
    { day: 'Day 08', detected: 20, remediated: 8 },
    { day: 'Day 15', detected: 19, remediated: 11 },
    { day: 'Day 22', detected: 18, remediated: 13 },
    { day: 'Day 30', detected: 17, remediated: 14 },
  ];

  const handleDownload = (pkgName, format) => {
    setDownloadMsg(`Generating cryptographically signed ${format} for ${pkgName}...`);
    setTimeout(() => {
      setDownloadMsg(`✓ ${pkgName} (${format}) generated and downloaded.`);
      setTimeout(() => setDownloadMsg(''), 4000);
    }, 1000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
              SEC-OPS ANALYTICS ENGINE // TELEMETRY REPORTING
            </span>
          </div>
          <h1 className="font-heading text-2xl font-bold text-white tracking-tight mt-1">
            Reports & Executive Analytics
          </h1>
          <p className="text-xs text-slate-400">
            Cryptographically signed compliance digests, autonomous remediation metrics, and SLA posture convergence.
          </p>
        </div>

        <div className="flex items-center gap-2.5 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 flex items-center gap-2">
            <Calendar size={13} className="text-cyan-400" />
            <span>Trailing 30D / Auto-Sync</span>
          </div>
          <button className="btn-cyber-dark text-xs">
            <Filter size={13} />
            <span>Filter Scope</span>
          </button>
          <button className="btn-cyan text-xs">
            <span>Run Custom Query</span>
          </button>
        </div>
      </div>

      {downloadMsg && (
        <div className="p-3 rounded-lg bg-cyan-950/80 border border-cyan-500/50 text-cyan-200 text-xs font-mono flex items-center justify-between animate-fadeIn">
          <span>{downloadMsg}</span>
          <span className="text-[10px] text-cyan-400 font-bold uppercase">SHA-256 Digest Attached</span>
        </div>
      )}

      {/* 4 Headline Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="cyber-card p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono font-semibold uppercase">MEAN TIME TO REMEDIATE</span>
            <Clock size={13} className="text-cyan-400" />
          </div>
          <p className="font-heading text-2xl font-bold text-white">4.2 <span className="text-sm font-normal">m</span> <span className="text-xs font-mono text-emerald-400 font-semibold">↓ -41.2%</span></p>
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
            <span>Baseline: 64.0m</span>
            <span className="text-cyan-400 font-bold">Automated Runbooks</span>
          </div>
        </div>

        <div className="cyber-card p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono font-semibold uppercase">REMEDIATION VELOCITY</span>
            <Zap size={13} className="text-cyan-400" />
          </div>
          <p className="font-heading text-2xl font-bold text-emerald-400">93.3% <span className="text-xs font-mono text-slate-400">+6.8%</span></p>
          <span className="text-[10px] text-slate-400 font-mono mt-1 block">28 of 30 Executions (2 Auto, 2 Rollbacks)</span>
        </div>

        <div className="cyber-card p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono font-semibold uppercase">SECURITY RESOLUTION RATE</span>
            <Shield size={13} className="text-purple-400" />
          </div>
          <p className="font-heading text-2xl font-bold text-white">82.4% <span className="text-xs font-mono text-cyan-400">Active</span></p>
          <span className="text-[10px] text-slate-400 font-mono mt-1 block">14 of 17 Cleared • 3 In-Triaging</span>
        </div>

        <div className="cyber-card p-4 rounded-xl border-emerald-500/30">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono font-semibold uppercase text-emerald-300">EXEC COMPLIANCE HEALTH</span>
            <CheckCircle2 size={13} className="text-emerald-400" />
          </div>
          <p className="font-heading text-2xl font-bold text-emerald-400">96.4% <span className="text-xs font-mono text-slate-400">Attested</span></p>
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
            <span>SOC2 Type II: Compliant</span>
            <span className="text-slate-300">CIS v8 Bench</span>
          </div>
        </div>
      </div>

      {/* Curated Audit Packages */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading text-sm font-bold text-white uppercase font-mono tracking-wider">
            Curated Audit Packages (Ready for SOC2, ISO27001 & Board Briefings)
          </h2>
          <span className="text-[10px] font-mono text-slate-500">HASH_TYPE: SHA-256</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1 */}
          <div className="cyber-card p-4 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                <span className="text-cyan-400 font-bold">v2.4 GA</span>
                <span className="cyber-badge badge-emerald text-[8px]">READY</span>
              </div>
              <h3 className="font-heading text-sm font-bold text-white">Operational Health & Reliability Report</h3>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                Complete operational posture digest containing fleet uptime, Kubernetes pod restart rates, and zero-trust proxy availability.
              </p>
              <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-500">
                <p>Digest SHA: f84a...92b1</p>
                <p>Generated: Today, 04:00 UTC</p>
              </div>
            </div>
            <button
              onClick={() => handleDownload('Operational Health Report', 'PDF')}
              className="w-full btn-cyber-dark text-xs justify-center py-2 mt-4 hover:border-cyan-500/50"
            >
              <Download size={13} />
              <span>Download PDF / CSV</span>
            </button>
          </div>

          {/* Card 2 */}
          <div className="cyber-card p-4 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                <span className="text-purple-400 font-bold">v1.4 CIS</span>
                <span className="cyber-badge badge-purple text-[8px]">84% PASS</span>
              </div>
              <h3 className="font-heading text-sm font-bold text-white">Security Posture & CIS Cloud Benchmark</h3>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                Multicloud IAM privilege checks, AWS S3 bucket exposure audits, and GCP Cloud KMS keyring rotation verifications.
              </p>
              <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-500">
                <p>Digest SHA: 3c09...81ae</p>
                <p>Generated: Yesterday, 23:50 UTC</p>
              </div>
            </div>
            <button
              onClick={() => handleDownload('CIS Benchmark Report', 'PDF')}
              className="w-full btn-cyber-dark text-xs justify-center py-2 mt-4 hover:border-purple-500/50"
            >
              <Download size={13} />
              <span>Download PDF</span>
            </button>
          </div>

          {/* Card 3 */}
          <div className="cyber-card p-4 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                <span className="text-amber-400 font-bold">SLA-30</span>
                <span className="cyber-badge badge-amber text-[8px]">38 ALERTS</span>
              </div>
              <h3 className="font-heading text-sm font-bold text-white">Incident SLA & Mean-Time Analysis</h3>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                Breakdown of human vs automated response velocity, tier escalation timelines, and post-mortem SLA attainment indices.
              </p>
              <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-500">
                <p>Digest SHA: 11e4...d45f</p>
                <p>Generated: 2 days ago</p>
              </div>
            </div>
            <button
              onClick={() => handleDownload('Incident SLA Analysis', 'PDF')}
              className="w-full btn-cyber-dark text-xs justify-center py-2 mt-4 hover:border-amber-500/50"
            >
              <Download size={13} />
              <span>Download PDF</span>
            </button>
          </div>

          {/* Card 4 */}
          <div className="cyber-card p-4 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                <span className="text-emerald-400 font-bold">LEDGER-JSON</span>
                <span className="cyber-badge badge-emerald text-[8px]">VERIFIABLE</span>
              </div>
              <h3 className="font-heading text-sm font-bold text-white">Automated Remediation Audit Ledger</h3>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                Immutable machine-readable trace of autonomous playbook orchestrations with cryptographic signatures & IAM principal receipts.
              </p>
              <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-500">
                <p>Digest SHA: 77ab...00c9</p>
                <p>Generated: 1 hour ago</p>
              </div>
            </div>
            <button
              onClick={() => handleDownload('Remediation Audit Ledger', 'JSON-LD')}
              className="w-full btn-cyan text-xs justify-center py-2 mt-4"
            >
              <Download size={13} />
              <span>JSON-LD / PKCS</span>
            </button>
          </div>
        </div>
      </div>

      {/* Deep Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Weekly Incident Distribution */}
        <div className="cyber-card p-5 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-heading text-sm font-bold text-white uppercase font-mono">
                Weekly Incident Distribution by Severity
              </h3>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">Real-time breakdown of alert ingestion across clusters</p>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-semibold">Zero critical in Week 4</span>
          </div>

          <div style={{ width: '100%', height: 190 }}>
            <ResponsiveContainer>
              <BarChart data={weeklyDistributionData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
                <XAxis dataKey="week" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0a101f', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'JetBrains Mono' }} />
                <Bar dataKey="critical" stackId="a" fill="#ef4444" name="Critical" />
                <Bar dataKey="high" stackId="a" fill="#f59e0b" name="High" />
                <Bar dataKey="medium" stackId="a" fill="#0284c7" name="Medium" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] font-mono text-emerald-400 mt-2">
            Weekly Reduction: 42.8% drop from W2 surge
          </p>
        </div>

        {/* Findings Convergence Curve */}
        <div className="cyber-card p-5 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-heading text-sm font-bold text-white uppercase font-mono">
                Findings Convergence Curve
              </h3>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">Detected vs Remediated closing the scissors gap</p>
            </div>
            <span className="cyber-badge badge-emerald text-[9px]">+66.7% CLEARANCE</span>
          </div>

          <div style={{ width: '100%', height: 190 }}>
            <ResponsiveContainer>
              <LineChart data={convergenceData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={[0, 25]} />
                <Tooltip contentStyle={{ backgroundColor: '#0a101f', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'JetBrains Mono' }} />
                <Line type="monotone" dataKey="detected" stroke="#00f0ff" strokeWidth={2.5} dot={{ r: 3 }} name="Detected (17)" />
                <Line type="monotone" dataKey="remediated" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} name="Remediated (14)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-2">
            <span>Net unresolved delta: 3 open vulnerabilities</span>
            <span className="text-emerald-400 font-semibold">Remediation velocity tracking positive</span>
          </div>
        </div>
      </div>
    </div>
  );
};
