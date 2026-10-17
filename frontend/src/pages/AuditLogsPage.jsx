import React, { useState, useEffect } from 'react';
import { auditApi } from '../services/api';
import {
  FileText,
  Shield,
  CheckCircle2,
  Lock,
  Copy,
  Check,
  Search,
  ExternalLink,
  Download,
  AlertTriangle,
  RotateCw,
  Hash,
  Layers,
  Terminal,
  Clock
} from 'lucide-react';

export const AuditLogsPage = () => {
  const [selectedEventId, setSelectedEventId] = useState('EVT-9042');
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickFilter, setQuickFilter] = useState('all');

  const handleVerifyMerkle = () => {
    setVerifying(true);
    setVerifyMessage('Recalculating SHA-256 Merkle root hashes across 4,829 ledger blocks...');
    setTimeout(() => {
      setVerifying(false);
      setVerifyMessage('✓ Merkle Tree Root Cryptographically Valid (Seal: sha256:d8a2...3f11). Zero tamper detected.');
      setTimeout(() => setVerifyMessage(''), 5000);
    }, 1200);
  };

  const handleCopyCommand = (cmd) => {
    navigator.clipboard?.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const events = [
    {
      id: 'EVT-9042',
      time: '14:32:08 UTC',
      ago: '8s ago',
      actor: 'Alex Rivera',
      role: 'Administrator',
      action: 'REMEDIATION_APPROVED',
      detail: 'PB-RESTART-04 container cycle approved for INC-8041',
      status: 'COMMITTED',
      statusType: 'emerald',
      origin: '10.240.12.89 [VPN-02]',
      mfa: 'YubiKey Hardware FIDO2',
      command: 'cloudshield-cli isolate-node --cluster=k8s-prod-us-east --node=ip-10-0-128-44.ec2.internal --reason="INC-8041 memory leak mitigation"',
      blockHeight: '#14,892',
      prevHash: '0x7b1c4e9f...89a2',
      currentHash: '0x9e08d2f1...3c4b',
      target: 'cloudshield-api:8080'
    },
    {
      id: 'EVT-9041',
      time: '14:31:44 UTC',
      ago: '32s ago',
      actor: 'Unknown Remote',
      role: '198.51.100.24',
      action: 'UNAUTHORIZED_SHELL_ATTEMPT',
      detail: '/bin/sh invocation blocked on pod/payment-api-9',
      status: 'INTERCEPTED',
      statusType: 'rose',
      origin: '198.51.100.24 [EXTERNAL]',
      mfa: 'NONE (BLOCKED)',
      command: 'iptables -A INPUT -s 198.51.100.24 -j DROP && echo "Egress blocked"',
      blockHeight: '#14,891',
      prevHash: '0x6a0b3e8e...12c4',
      currentHash: '0x7b1c4e9f...89a2',
      target: 'payment-api-9'
    },
    {
      id: 'EVT-9040',
      time: '14:29:12 UTC',
      ago: '3m ago',
      actor: 'Prometheus Sentinel',
      role: 'Telemetry Daemon',
      action: 'METRIC_THRESHOLD_BREACH',
      detail: 'HTTP 503 error rate exceeded 5.0% threshold (Current: 6.2%)',
      status: 'AUTO-LOGGED',
      statusType: 'amber',
      origin: '127.0.0.1 [INTERNAL BUS]',
      mfa: 'SYSTEM DAEMON TOKEN',
      command: 'curl -s http://localhost:9090/api/v1/alerts | jq .data.alerts',
      blockHeight: '#14,890',
      prevHash: '0x5f9a2d7d...90b3',
      currentHash: '0x6a0b3e8e...12c4',
      target: 'edge-gateway'
    },
    {
      id: 'EVT-9039',
      time: '14:15:00 UTC',
      ago: '17m ago',
      actor: 'System Policy Engine',
      role: 'Automated Worker',
      action: 'COMPLIANCE_SCAN_COMPLETED',
      detail: '32 controls evaluated against CIS Cloud Benchmark v1.4',
      status: 'VERIFIED',
      statusType: 'cyan',
      origin: '127.0.0.1 [OIDC]',
      mfa: 'ENCLAVE KEYPAIR',
      command: 'cloudshield-scanner run --benchmark=cis-v1.4 --target=local-lab',
      blockHeight: '#14,889',
      prevHash: '0x4e8a1c6c...78a1',
      currentHash: '0x5f9a2d7d...90b3',
      target: 'all-cluster-nodes'
    },
    {
      id: 'EVT-9038',
      time: '14:02:05 UTC',
      ago: '40m ago',
      actor: 'Alex Rivera',
      role: 'Administrator',
      action: 'REMEDIATION_EXECUTED',
      detail: 'PB-CACHE-PURGE edge cache evicted (Duration: 1.2s)',
      status: 'SUCCESS',
      statusType: 'emerald',
      origin: '10.240.12.89 [VPN-02]',
      mfa: 'YubiKey Hardware FIDO2',
      command: 'cloudflare-cli purge-cache --zone=cloudshield.local',
      blockHeight: '#14,888',
      prevHash: '0x3d7a0b5b...67a0',
      currentHash: '0x4e8a1c6c...78a1',
      target: 'cloudshield-frontend'
    }
  ];

  const activeEvt = events.find(e => e.id === selectedEventId) || events[0];

  const filteredEvents = events.filter(e => {
    if (searchQuery && !e.id.toLowerCase().includes(searchQuery.toLowerCase()) && !e.action.toLowerCase().includes(searchQuery.toLowerCase()) && !e.detail.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (quickFilter === 'remediation' && !e.action.includes('REMEDIATION')) return false;
    if (quickFilter === 'critical' && e.statusType !== 'rose' && e.statusType !== 'amber') return false;
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-heading text-2xl font-bold text-white tracking-tight">
              Audit Logs & Security History
            </h1>
            <span className="cyber-badge badge-emerald">TAMPER-EVIDENT APPEND-ONLY</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Immutable audit ledger tracking security findings, policy evaluations, operator access, and automated remediation executions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleVerifyMerkle}
            disabled={verifying}
            className="btn-cyber-dark text-xs"
          >
            <Shield size={14} className={verifying ? 'animate-spin text-cyan-400' : 'text-emerald-400'} />
            <span>Verify Cryptographic Hashes</span>
          </button>
          <button className="btn-cyan text-xs">
            <Download size={14} />
            <span>Export Audit Ledger (JSON/CSV)</span>
          </button>
        </div>
      </div>

      {verifyMessage && (
        <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs font-mono animate-fadeIn flex items-center justify-between">
          <span>{verifyMessage}</span>
          <span className="text-[10px] text-emerald-400 font-bold uppercase">Merkle Proof v4.2 Verified</span>
        </div>
      )}

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="cyber-card p-4 rounded-xl">
          <span className="text-[11px] font-mono text-slate-400 block mb-1">TOTAL RECORDED EVENTS</span>
          <p className="font-heading text-2xl font-bold text-white">4,829</p>
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
            <span className="text-cyan-400">+142 today</span>
            <span>99.999% Ingestion</span>
          </div>
        </div>

        <div className="cyber-card p-4 rounded-xl border-amber-500/30">
          <span className="text-[11px] font-mono text-amber-300 block mb-1">POLICY & SEC TRIGGERS</span>
          <p className="font-heading text-2xl font-bold text-amber-400">68 <span className="text-xs font-mono text-slate-400">! Flagged Active</span></p>
          <span className="text-[10px] text-slate-400 font-mono mt-1 block">14 High • 3 Critical, 4 Unresolved</span>
        </div>

        <div className="cyber-card p-4 rounded-xl">
          <span className="text-[11px] font-mono text-slate-400 block mb-1">REMEDIATION EXECUTIONS</span>
          <p className="font-heading text-2xl font-bold text-cyan-400">32</p>
          <span className="text-[10px] text-emerald-400 font-mono mt-1 block">28 OK • 2 appvd • 2 rolled back (93.8%)</span>
        </div>

        <div className="cyber-card p-4 rounded-xl border-emerald-500/30">
          <span className="text-[11px] font-mono text-emerald-300 block mb-1">INTEGRITY VERIFICATION</span>
          <p className="font-heading text-2xl font-bold text-emerald-400">100% Valid</p>
          <span className="text-[10px] text-slate-400 font-mono mt-1 block">Merkle SHA-256 seal #0x9f1a intact</span>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search size={15} className="text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Event ID, Actor, Resource (e.g. EVT-9042)..."
            className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none font-mono"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setQuickFilter('all')}
            className={`px-2.5 py-1 rounded ${quickFilter === 'all' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'}`}
          >
            All Events
          </button>
          <button
            onClick={() => setQuickFilter('remediation')}
            className={`px-2.5 py-1 rounded ${quickFilter === 'remediation' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'}`}
          >
            Only Remediation
          </button>
          <button
            onClick={() => setQuickFilter('critical')}
            className={`px-2.5 py-1 rounded ${quickFilter === 'critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'text-slate-400 hover:text-white'}`}
          >
            High/Critical
          </button>
        </div>
      </div>

      {/* Split View: Event Stream Table + Sealed Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Table */}
        <div className="lg:col-span-7 cyber-card rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <span className="font-heading text-xs font-bold text-white uppercase font-mono tracking-wider">
              LEDGER STREAM (SHOWING {filteredEvents.length} OF 4,829)
            </span>
            <span className="text-[10px] font-mono text-emerald-400">Live Stream: ON (Auto-sync 5s)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="cyber-table">
              <thead>
                <tr>
                  <th>Timestamp (UTC)</th>
                  <th>Event ID</th>
                  <th>Actor & Role</th>
                  <th>Action / Event Name</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((evt) => {
                  const isSelected = selectedEventId === evt.id;
                  return (
                    <tr
                      key={evt.id}
                      onClick={() => setSelectedEventId(evt.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-cyan-950/40 border-l-2 border-l-cyan-400' : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td>
                        <p className="font-mono text-slate-300 text-xs">{evt.time}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{evt.ago}</p>
                      </td>
                      <td className="font-mono text-cyan-400 font-bold text-xs">{evt.id}</td>
                      <td>
                        <p className="font-medium text-slate-200 text-xs">{evt.actor}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{evt.role}</p>
                      </td>
                      <td>
                        <p className="font-mono font-bold text-xs text-slate-200">{evt.action}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-xs">{evt.detail}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Sealed in Merkle Tree Inspector */}
        <div className="lg:col-span-5 space-y-3">
          <div className="cyber-card p-5 rounded-xl border-cyan-500/30">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold tracking-widest">
                  SEALED IN MERKLE TREE • IMMUTABLE
                </span>
                <h3 className="font-heading text-base font-bold text-white mt-0.5">
                  Inspect: {activeEvt.id}
                </h3>
                <span className="text-[10px] font-mono text-slate-500">
                  corr_8f7b2a9e22cf081b
                </span>
              </div>
              <span className="cyber-badge badge-cyan">SHA-256 SEAL</span>
            </div>

            {/* Operator Execution Context */}
            <div className="my-3 space-y-2 text-xs font-mono">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">
                OPERATOR EXECUTION CONTEXT
              </span>
              <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 block">PRINCIPAL ACTOR</span>
                  <span className="text-slate-200 font-semibold">{activeEvt.actor}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">SESSION ORIGIN</span>
                  <span className="text-slate-300">{activeEvt.origin}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">ACTION PROTOCOL</span>
                  <span className="text-cyan-400 font-bold">{activeEvt.action}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">MFA AUTHORIZATION</span>
                  <span className="text-emerald-400">{activeEvt.mfa}</span>
                </div>
              </div>
            </div>

            {/* Executed CLI Command */}
            <div className="space-y-1.5 my-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1">
                  <Terminal size={12} className="text-cyan-400" />
                  EXECUTED CLI PROBE COMMAND
                </span>
                <button
                  onClick={() => handleCopyCommand(activeEvt.command)}
                  className="text-cyan-400 hover:text-cyan-300 text-[11px] flex items-center gap-1"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
                <span className="text-slate-600 select-none">$ </span>
                {activeEvt.command}
              </div>
            </div>

            {/* Cryptographic Ledger Proof */}
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs font-mono space-y-1.5 my-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Ed25519 Cryptographic Proof:</span>
                <span className="text-emerald-400 font-bold">VERIFIED</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Block Height:</span>
                <span className="text-cyan-400">{activeEvt.blockHeight}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Prev Block Hash:</span>
                <span className="text-slate-500">{activeEvt.prevHash}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Block Hash:</span>
                <span className="text-slate-300">{activeEvt.currentHash}</span>
              </div>
            </div>

            {/* Structured JSON-LD Event Snippet */}
            <div className="space-y-1 my-3">
              <span className="text-[10px] text-slate-500 uppercase font-bold font-mono block">
                STRUCTURED LEDGER EVENT (JSON-LD)
              </span>
              <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-mono text-cyan-300 overflow-x-auto max-h-36">
{`{
  "@context": "https://w3id.org/security/v2",
  "eventId": "${activeEvt.id}",
  "timestamp": "${activeEvt.time}",
  "actor": "${activeEvt.actor}",
  "action": "${activeEvt.action}",
  "merkleRoot": "sha256:d8a2bc490f84e1903ba88e04017d77b81920ac4b",
  "proof": {
    "type": "Ed25519Signature2020",
    "verificationMethod": "did:key:z6Mku...#key-1"
  }
}`}
              </pre>
            </div>

            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(activeEvt, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${activeEvt.id}-audit-proof.json`;
                a.click();
              }}
              className="w-full btn-cyan text-xs justify-center py-2"
            >
              <Download size={13} />
              <span>Download Verifiable Audit Proof (JSON-LD)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
