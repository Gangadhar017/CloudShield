import React, { useState, useEffect } from 'react';
import { resourcesApi, monitoringApi } from '../services/api';
import {
  Server,
  RefreshCw,
  Copy,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Layers,
  Shield,
  Play,
  RotateCw,
  ExternalLink,
  Zap,
  Filter,
  Search,
  Check,
  Flame
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export const ResourcesPage = () => {
  const [selectedNode, setSelectedNode] = useState('cloudshield-api:8080');
  const [copied, setCopied] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');

  const cpuData = [
    { time: '14:00', cpu: 28 },
    { time: '14:05', cpu: 31 },
    { time: '14:10', cpu: 30 },
    { time: '14:15', cpu: 44 },
    { time: '14:20', cpu: 55 },
    { time: '14:25', cpu: 88 },
    { time: '14:30', cpu: 84 },
  ];

  const handleCopy = (text) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecuteAction = async (actionName) => {
    setActionLoading(true);
    setActionMessage(`Executing ${actionName}...`);
    try {
      if (actionName === 'Trigger Health Probe') {
        const res = await fetch('http://localhost:8001/health').then(r => r.json());
        setActionMessage(`Health probe response: HTTP 200 OK (${res.status || 'healthy'})`);
      } else {
        await new Promise(r => setTimeout(r, 1000));
        setActionMessage(`${actionName} completed successfully under Sandbox Policy.`);
      }
    } catch (err) {
      setActionMessage(`${actionName} simulation complete.`);
    } finally {
      setActionLoading(false);
      setTimeout(() => setActionMessage(''), 4000);
    }
  };

  const inventoryRows = [
    {
      id: 'cloudshield-api:8080',
      sub: 'k8s-pod-us-east-4a // prod',
      engine: 'K8s Container Production',
      blastScore: 92,
      blastLabel: 'Ext. Facing Gateway',
      compliance: 'CIS Fail (4)',
      complianceType: 'rose',
      threatState: 'Thermal Anomaly',
      threatType: 'rose'
    },
    {
      id: 'k8s-worker-pool-02',
      sub: 'gcp-instance-group-c1',
      engine: 'GCP Compute Staging',
      blastScore: 58,
      blastLabel: 'Private VPC peered',
      compliance: '100% Pass',
      complianceType: 'emerald',
      threatState: 'Clear Pod',
      threatType: 'emerald'
    },
    {
      id: 'vnet-prod-core-01',
      sub: 'az-sub-enterprise-99',
      engine: 'Azure VNet Production',
      blastScore: 84,
      blastLabel: 'Default NSG Unbound',
      compliance: 'Warn (1)',
      complianceType: 'amber',
      threatState: 'Ingress Overexposed',
      threatType: 'amber'
    },
    {
      id: 'postgres-primary:5432',
      sub: 'db-cluster-stateful',
      engine: 'Container Stateful',
      blastScore: 42,
      blastLabel: 'VPC Internal',
      compliance: '100% Pass',
      complianceType: 'emerald',
      threatState: 'Clear Pod',
      threatType: 'emerald'
    },
    {
      id: 'test-storage-bucket',
      sub: 's3-asset-store-vault',
      engine: 'S3 Object Storage',
      blastScore: 88,
      blastLabel: 'Public Ingress Allow',
      compliance: 'CIS Fail (1)',
      complianceType: 'rose',
      threatState: 'Drift Alert',
      threatType: 'rose'
    }
  ];

  const filteredRows = inventoryRows.filter(r => {
    if (searchQuery && !r.id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (riskFilter === 'Critical & High' && r.blastScore < 80) return false;
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Multi-Cloud Ingestion Bus Ribbon */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase">
              MULTI-CLOUD INGESTION BUS
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-xs font-mono text-cyan-400">50,812 Monitored Endpoints Synchronized</span>
          </div>
          <h1 className="font-heading text-2xl font-bold text-white tracking-tight mt-1">
            Cloud Asset Registry & Blast Radius
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button className="btn-cyber-dark text-xs">
            Export Inventory
          </button>
          <button className="btn-cyan text-xs">
            <RotateCw size={14} />
            <span>Force Rescan</span>
          </button>
        </div>
      </div>

      {/* Top 4 Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="cyber-card p-4 rounded-xl">
          <span className="text-[11px] font-mono text-slate-400 block mb-1">TOTAL DISCOVERED ASSETS</span>
          <p className="font-heading text-2xl font-bold text-white">50.8k <span className="text-xs font-mono text-cyan-400 font-semibold">+412</span></p>
          <span className="text-[10px] text-slate-500 font-mono">Across 6 multi-cloud federations</span>
        </div>

        <div className="cyber-card p-4 rounded-xl">
          <span className="text-[11px] font-mono text-slate-400 block mb-1">ZERO TRUST ENCLAVES</span>
          <p className="font-heading text-2xl font-bold text-emerald-400">24 / 24 <span className="text-xs font-mono text-slate-400">100%</span></p>
          <span className="text-[10px] text-slate-500 font-mono">All cryptographic enclaves verified</span>
        </div>

        <div className="cyber-card p-4 rounded-xl border-amber-500/30">
          <span className="text-[11px] font-mono text-amber-300 block mb-1">DEGRADED NODE POOLS</span>
          <p className="font-heading text-2xl font-bold text-amber-400">02 <span className="cyber-badge badge-amber text-[9px]">Attention req.</span></p>
          <span className="text-[10px] text-slate-500 font-mono">ap-southeast-1 & us-east-2 workers</span>
        </div>

        <div className="cyber-card p-4 rounded-xl border-rose-500/30">
          <span className="text-[11px] font-mono text-rose-300 block mb-1">CRITICAL BLAST EXPOSURE</span>
          <p className="font-heading text-2xl font-bold text-rose-400">3,925 <span className="text-xs font-mono text-rose-400">↑ 7.8% ratio</span></p>
          <span className="text-[10px] text-slate-500 font-mono">120 active attack vectors isolated</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <Search size={15} className="text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by ARN, CVE ID, Hostname, or IP..."
            className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none font-mono"
          />
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Risk Tier:</span>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none"
            >
              <option value="All">All Tiers</option>
              <option value="Critical & High">Critical & High</option>
            </select>
          </div>
          <span className="text-slate-700">|</span>
          <span className="text-slate-400">Showing {filteredRows.length} of 50,812 assets</span>
        </div>
      </div>

      {/* Main Split Layout: Inventory Table + Live Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Inventory Table */}
        <div className="lg:col-span-7 cyber-card rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server size={16} className="text-cyan-400" />
              <h3 className="font-heading text-sm font-bold text-white uppercase font-mono">Cloud Asset Registry</h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Auto-evaluating blast radius
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="cyber-table">
              <thead>
                <tr>
                  <th>Resource Identifier</th>
                  <th>Engine & Env</th>
                  <th>Blast Radius</th>
                  <th>Compliance</th>
                  <th>Threat State</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => {
                  const isSelected = selectedNode === row.id;
                  return (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedNode(row.id)}
                      className={`cursor-pointer transition-colors ${isSelected ? 'bg-cyan-950/40 border-l-2 border-l-cyan-400' : ''}`}
                    >
                      <td>
                        <p className="font-mono font-bold text-slate-200 text-xs">{row.id}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{row.sub}</p>
                      </td>
                      <td className="font-mono text-xs text-slate-400">{row.engine}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className={`font-mono text-xs font-bold ${row.blastScore >= 80 ? 'text-rose-400' : 'text-amber-400'}`}>
                            {row.blastScore}/100
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono block">{row.blastLabel}</span>
                      </td>
                      <td>
                        <span className={`cyber-badge ${row.complianceType === 'rose' ? 'badge-rose' : row.complianceType === 'amber' ? 'badge-amber' : 'badge-emerald'}`}>
                          {row.compliance}
                        </span>
                      </td>
                      <td>
                        <span className="flex items-center gap-1.5 font-mono text-xs">
                          <span className={`w-2 h-2 rounded-full ${row.threatType === 'rose' ? 'bg-rose-400 animate-ping' : row.threatType === 'amber' ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                          <span className={row.threatType === 'rose' ? 'text-rose-300' : row.threatType === 'amber' ? 'text-amber-300' : 'text-emerald-300'}>
                            {row.threatState}
                          </span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Live Telemetry & Anomaly Inspector */}
        <div className="lg:col-span-5 space-y-4">
          <div className="cyber-card p-5 rounded-xl border-cyan-500/30">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 block tracking-widest font-bold">
                  CONTAINER NODE TELEMETRY
                </span>
                <h3 className="font-heading text-base font-bold text-white mt-0.5">{selectedNode}</h3>
                <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 mt-1">
                  <span className="flex items-center gap-1 text-amber-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    DEGRADED
                  </span>
                  <span>Uptime: 4d 18h</span>
                  <span>IP: 10.244.0.18</span>
                </div>
              </div>
              <span className="cyber-badge badge-rose">CRITICAL</span>
            </div>

            {/* Anomaly Callout */}
            <div className="my-3.5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5">
              <Flame size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-300 font-mono">Thermal & Throttling Anomaly Detected</p>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Resource compute limits exceeded allocated cluster quota threshold (85%).
                </p>
              </div>
            </div>

            {/* Node Metadata */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono p-3 rounded-lg bg-slate-900/60 border border-slate-800 mb-4">
              <div>
                <span className="text-[10px] text-slate-500 block">CONTAINER ID</span>
                <span className="text-slate-300 font-semibold">sha256:7f9a2c3...90e</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">RUNTIME ENGINE</span>
                <span className="text-slate-300">Docker / Containerd v1.7</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">CLUSTER NODE</span>
                <span className="text-cyan-400 font-bold">local-lab-worker-01</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">SERVICE TARGET</span>
                <span className="text-slate-300">api.internal.local:8080</span>
              </div>
            </div>

            {/* Real-Time Telemetry (Last 30 Min) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 font-semibold">CPU Core Load (%)</span>
                <span className="text-amber-400 font-bold">Live Spike: 88% CPU</span>
              </div>
              <div style={{ width: '100%', height: 95 }}>
                <ResponsiveContainer>
                  <AreaChart data={cpuData}>
                    <defs>
                      <linearGradient id="cpuLoadYellow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="cpu" stroke="#f59e0b" strokeWidth={2} fill="url(#cpuLoadYellow)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-xs font-mono pt-2">
                <span className="text-slate-400 font-semibold">Memory Resident Set (74%)</span>
                <span className="text-cyan-400 font-bold">2.96 GB / 4.0 GB</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-cyan-400 rounded-full" style={{ width: '74%' }}></div>
              </div>
            </div>

            {/* Active Alerts */}
            <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
              <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800 text-xs font-mono flex items-center justify-between">
                <span className="text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle size={13} />
                  ALERT-409: High CPU throttling (&gt;80% for 6m)
                </span>
                <span className="text-[10px] text-slate-500">6m ago</span>
              </div>
            </div>

            {/* Available Safe Actions */}
            <div className="mt-5 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-white uppercase font-mono">Available Safe Actions</span>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <Shield size={11} /> Safe Lab Policy Applied
                </span>
              </div>

              {actionMessage && (
                <div className="p-2 rounded bg-cyan-950/80 border border-cyan-500/50 text-[11px] font-mono text-cyan-200 mb-2">
                  {actionMessage}
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleExecuteAction('Restart Test Container')}
                  disabled={actionLoading}
                  className="btn-cyber-dark text-[11px] justify-center py-2 hover:border-cyan-500/60"
                >
                  <RotateCw size={12} className={actionLoading ? 'animate-spin' : ''} />
                  <span>Restart</span>
                </button>
                <button
                  onClick={() => handleExecuteAction('Trigger Health Probe')}
                  disabled={actionLoading}
                  className="btn-cyan text-[11px] justify-center py-2"
                >
                  <Zap size={12} />
                  <span>Probe</span>
                </button>
                <button
                  onClick={() => handleExecuteAction('Flush Cache')}
                  disabled={actionLoading}
                  className="btn-cyber-dark text-[11px] justify-center py-2 hover:border-rose-500/60 text-slate-300"
                >
                  <span>Flush</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
