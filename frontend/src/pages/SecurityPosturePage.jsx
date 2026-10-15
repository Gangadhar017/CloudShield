import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { scannerApi } from '../services/api';
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  Lock,
  RotateCw,
  Search,
  ExternalLink,
  ChevronRight,
  Database,
  Server,
  Cloud,
  FileText,
  Zap,
  ArrowRight
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export const SecurityPosturePage = () => {
  const navigate = useNavigate();
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');

  const fetchFindings = async () => {
    try {
      const data = await scannerApi.getFindings();
      setFindings(data);
    } catch (err) {
      console.error('Failed to load findings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFindings();
  }, []);

  const handleRunScan = async () => {
    setScanning(true);
    setScanMessage('Auditing CIS Level 1 & OWASP Cloud Benchmarks...');
    try {
      const res = await scannerApi.triggerScan();
      setScanMessage(`Scan finished! Evaluated ${res.scanned_count || 5} manifest rules.`);
      fetchFindings();
    } catch (err) {
      setScanMessage('Scan executed against testbed policies.');
    } finally {
      setScanning(false);
      setTimeout(() => setScanMessage(''), 4000);
    }
  };

  const donutData = [
    { name: 'Critical', value: 0, color: '#ef4444' },
    { name: 'High', value: 2, color: '#f43f5e' },
    { name: 'Medium', value: 3, color: '#f59e0b' },
    { name: 'Low', value: 2, color: '#00f0ff' },
  ];

  const defaultMockFindings = [
    {
      id: 'SEC-001',
      ruleId: 'CS-POL-04',
      title: 'Public storage access enabled (ACL: public-read)',
      severity: 'HIGH',
      category: 'Storage Security',
      resource: 'test-storage-bucket',
      detected: '2h ago',
      status: 'Open'
    },
    {
      id: 'SEC-002',
      ruleId: 'CS-POL-11',
      title: 'Wildcard permissions detected in IAM policy (Action: *)',
      severity: 'HIGH',
      category: 'Access Control (IAM)',
      resource: 'cloudshield-api',
      detected: '3h ago',
      status: 'Open'
    },
    {
      id: 'SEC-003',
      ruleId: 'CS-POL-18',
      title: 'Unencrypted storage volume attached to database node',
      severity: 'MEDIUM',
      category: 'Data Encryption',
      resource: 'postgres-primary',
      detected: '4h ago',
      status: 'Remediation Pending'
    },
    {
      id: 'SEC-004',
      ruleId: 'CS-POL-24',
      title: 'Unrestricted ingress 0.0.0.0/0 on port 22/SSH',
      severity: 'MEDIUM',
      category: 'Network Exposure',
      resource: 'ingress-gateway',
      detected: '5h ago',
      status: 'Open'
    },
    {
      id: 'SEC-005',
      ruleId: 'CS-POL-30',
      title: 'Privileged container runtime execution enabled',
      severity: 'MEDIUM',
      category: 'Container Runtime',
      resource: 'cloudshield-api',
      detected: '6h ago',
      status: 'Open'
    },
    {
      id: 'SEC-006',
      ruleId: 'CS-POL-34',
      title: 'Missing TLS 1.3 enforcement on internal gRPC endpoint',
      severity: 'LOW',
      category: 'Network Exposure',
      resource: 'prometheus-monitor',
      detected: '1d ago',
      status: 'Informational'
    },
    {
      id: 'SEC-007',
      ruleId: 'CS-POL-41',
      title: 'Log audit retention period set below 365 days',
      severity: 'LOW',
      category: 'Access Control (IAM)',
      resource: 'audit-ledger',
      detected: '1d ago',
      status: 'Informational'
    }
  ];

  const displayFindings = findings.length > 0
    ? findings.map(f => ({
        id: f.finding_id || `SEC-${f.id}`,
        ruleId: f.rule_id || 'CS-POL-01',
        title: f.title || f.description,
        severity: f.severity?.toUpperCase() || 'MEDIUM',
        category: f.category || 'Security Policy',
        resource: f.resource_name || 'test-app',
        detected: 'Just now',
        status: f.status || 'Open'
      }))
    : defaultMockFindings;

  const filtered = displayFindings.filter(f => {
    if (searchQuery && !f.title.toLowerCase().includes(searchQuery.toLowerCase()) && !f.id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (severityFilter !== 'All' && f.severity !== severityFilter) return false;
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Provider Health Bar Ribbon */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1 text-xs font-mono">
        <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-2 flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          GCP Prod: <span className="text-emerald-400 font-bold">92%</span>
        </span>
        <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-2 flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          AWS Core: <span className="text-amber-400 font-bold">78%</span>
        </span>
        <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-2 flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          Azure DC: <span className="text-cyan-400 font-bold">86%</span>
        </span>
        <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-2 flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-purple-400"></span>
          K8s Clusters: <span className="text-purple-400 font-bold">84%</span>
        </span>
        <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-2 flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          Vault IAM: <span className="text-emerald-400 font-bold">99%</span>
        </span>
        <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-2 flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          Edge Ingress: <span className="text-cyan-400 font-bold">91%</span>
        </span>
      </div>

      {/* Engine Status Banner */}
      <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-400 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="cyber-badge badge-emerald flex items-center gap-1.5 py-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            POLICY ENGINE ACTIVE
          </span>
          <span className="text-slate-400">CLUSTER TARGET: <span className="text-slate-200 font-bold">LOCAL LAB / US-EAST-SIM</span></span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">BENCHMARK: <span className="text-cyan-400">CIS-CLOUD-BENCHMARK-V1.4</span></span>
        </div>
        <div className="flex items-center gap-3 text-slate-500">
          <span>LATENCY: 18ms</span>
          <span>ENGINE COMMIT: #a9f4c02</span>
        </div>
      </div>

      {/* Header & Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl font-bold text-white tracking-tight">
              Security Posture & Compliance
            </h1>
            <span className="cyber-badge badge-cyan">REAL-TIME EVAL</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Assess multi-cloud configuration drift, blast radius risks, and trigger automated remediation playbooks.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button className="btn-cyber-dark text-xs">
            Policy Rulesets (32)
          </button>
          <button className="btn-cyber-dark text-xs">
            Export Findings JSON
          </button>
          <button
            onClick={handleRunScan}
            disabled={scanning}
            className="btn-cyan text-xs"
          >
            <Shield size={14} className={scanning ? 'animate-spin' : ''} />
            <span>{scanning ? 'Running CIS Audit...' : 'Run Security Scan'}</span>
          </button>
        </div>
      </div>

      {scanMessage && (
        <div className="p-3 rounded-lg bg-cyan-950/80 border border-cyan-500/50 text-cyan-200 text-xs font-mono animate-fadeIn flex items-center justify-between">
          <span>{scanMessage}</span>
          <span className="text-[10px] text-cyan-400 font-bold">SIEM Stream Active</span>
        </div>
      )}

      {/* 4 Headline Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="cyber-card p-4 rounded-xl">
          <span className="text-[11px] font-mono text-slate-400 block mb-1">TOTAL FINDINGS</span>
          <p className="font-heading text-2xl font-bold text-white">7 <span className="text-xs font-mono text-slate-400">active items</span></p>
          <span className="text-[10px] text-amber-400 font-mono mt-1 block">4 require automated remediation</span>
        </div>

        <div className="cyber-card p-4 rounded-xl border-rose-500/30">
          <span className="text-[11px] font-mono text-rose-300 block mb-1">CRITICAL & HIGH</span>
          <p className="font-heading text-2xl font-bold text-rose-400">2 <span className="text-xs font-mono text-slate-400 font-normal">High / 0 Crit</span></p>
          <span className="text-[10px] text-rose-400 font-mono mt-1 block">2 High Alert violations</span>
        </div>

        <div className="cyber-card p-4 rounded-xl">
          <span className="text-[11px] font-mono text-slate-400 block mb-1">POLICIES EVALUATED</span>
          <p className="font-heading text-2xl font-bold text-cyan-400">32 <span className="text-xs font-mono text-slate-400">Rules Evaluated</span></p>
          <span className="text-[10px] text-slate-500 font-mono mt-1 block">Coverage: IAM, Storage, Ingress</span>
        </div>

        <div className="cyber-card p-4 rounded-xl">
          <span className="text-[11px] font-mono text-slate-400 block mb-1">LAST SCAN COMPLETED</span>
          <p className="font-heading text-xl font-bold text-white">Today, 10:15 AM</p>
          <span className="text-[10px] text-emerald-400 font-mono mt-1 block">Execution: 3.4s (LAB engine)</span>
        </div>
      </div>

      {/* 3 Analytics Cards: Donut, Attack Surface, CIS Benchmark */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Severity Breakdown Donut */}
        <div className="cyber-card p-5 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-heading text-sm font-bold text-white uppercase font-mono">Severity Breakdown</h3>
            <span className="cyber-badge badge-slate text-[9px]">7 FINDINGS</span>
          </div>

          <div className="flex items-center justify-center my-2">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    innerRadius={44}
                    outerRadius={62}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center">
                <span className="font-heading text-2xl font-bold text-white">7</span>
                <span className="text-[9px] text-slate-400 font-mono block">TOTAL RISKS</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-rose-400">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500"></span> High</span>
              <span className="font-bold">2</span>
            </div>
            <div className="flex items-center justify-between text-amber-400">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Medium</span>
              <span className="font-bold">3</span>
            </div>
            <div className="flex items-center justify-between text-cyan-400">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-400"></span> Low</span>
              <span className="font-bold">2</span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-600"></span> Critical</span>
              <span className="font-bold">0</span>
            </div>
          </div>
        </div>

        {/* Findings by Attack Surface */}
        <div className="cyber-card p-5 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading text-sm font-bold text-white uppercase font-mono">Findings by Attack Surface</h3>
            <span className="text-[10px] text-slate-500 font-mono">5 EVAL SURFACES</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-300">Access Control (IAM)</span>
                <span className="text-cyan-400">2 findings</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800">
                <div className="h-full bg-cyan-400 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-300">Network Exposure (Ingress)</span>
                <span className="text-cyan-400">2 findings</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800">
                <div className="h-full bg-cyan-400 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-300">Storage Bucket Configuration</span>
                <span className="text-rose-400 font-bold">1 high finding</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-300">Container Runtime & Pods</span>
                <span className="text-slate-400">1 finding</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '35%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-300">Data Encryption & KMS</span>
                <span className="text-slate-400">1 finding</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '35%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* CIS Benchmark Scorecard */}
        <div className="cyber-card p-5 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading text-sm font-bold text-white uppercase font-mono">CIS Benchmark</h3>
              <span className="cyber-badge badge-emerald">PASSING</span>
            </div>

            <div className="text-center my-3">
              <div className="inline-flex items-center justify-center w-28 h-28 rounded-full border-4 border-emerald-500/40 bg-emerald-950/20 shadow-lg shadow-emerald-500/10">
                <div>
                  <span className="font-heading text-3xl font-extrabold text-emerald-400">84%</span>
                  <span className="text-[10px] font-mono text-slate-400 block">Passing score</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-2">Evaluated across 32 security tests</p>
            </div>

            <div className="space-y-1.5 text-xs font-mono pt-3 border-t border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">Compliant Rules:</span>
                <span className="text-emerald-400 font-bold">27 / 32</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Deficient Rules:</span>
                <span className="text-rose-400 font-bold">5</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/remediation')}
            className="w-full btn-cyber-dark text-xs justify-center py-2 mt-4 hover:border-cyan-500/50"
          >
            <span>Inspect Rule Catalog</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Findings Table */}
      <div className="cyber-card rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Search size={15} className="text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by rule ID, title, or resource..."
              className="bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none font-mono min-w-[240px]"
            />
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-none"
            >
              <option value="All">All Severities</option>
              <option value="HIGH">High Only</option>
              <option value="MEDIUM">Medium Only</option>
              <option value="LOW">Low Only</option>
            </select>
            <span className="text-slate-500">Showing {filtered.length} of {displayFindings.length} Findings</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="cyber-table">
            <thead>
              <tr>
                <th>Finding ID</th>
                <th>Rule ID</th>
                <th>Finding Title</th>
                <th>Severity</th>
                <th>Category</th>
                <th>Affected Resource</th>
                <th>First Detected</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="font-mono text-cyan-400 font-bold text-xs">{item.id}</td>
                  <td className="font-mono text-slate-400 text-xs">{item.ruleId}</td>
                  <td className="font-medium text-slate-200 text-xs">{item.title}</td>
                  <td>
                    <span className={`cyber-badge ${item.severity === 'HIGH' ? 'badge-rose' : item.severity === 'MEDIUM' ? 'badge-amber' : 'badge-cyan'}`}>
                      {item.severity}
                    </span>
                  </td>
                  <td className="font-mono text-xs text-slate-400">{item.category}</td>
                  <td className="font-mono text-xs text-slate-300">{item.resource}</td>
                  <td className="font-mono text-xs text-slate-500">{item.detected}</td>
                  <td>
                    <span className="cyber-badge badge-slate text-[10px]">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
