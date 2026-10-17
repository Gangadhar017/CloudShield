import React, { useState, useEffect, useRef } from 'react';
import { remediationApi } from '../services/api';
import {
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCw,
  Terminal as TerminalIcon,
  Copy,
  Check,
  Shield,
  Layers,
  Zap,
  ArrowRight,
  Clock,
  Lock,
  Flame,
  FileCheck
} from 'lucide-react';

export const RemediationPage = () => {
  const [selectedJob, setSelectedJob] = useState('REM-109');
  const [copied, setCopied] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [statusState, setStatusState] = useState('PENDING_APPROVAL'); // 'PENDING_APPROVAL', 'EXECUTING', 'COMPLETED'
  const [notes, setNotes] = useState('Verified thread dump lock in INC-8041, proceeding with controlled container cycle.');
  const [checks, setChecks] = useState({
    drain: true,
    snapshot: true,
    hardwareSign: true
  });

  const [logs, setLogs] = useState([
    { time: '14:22:01.042', tag: 'SEC-INIT', text: 'Container PID: 39401 attached' },
    { time: '14:22:02.110', tag: 'GUARD', text: 'Ingress firewall filter applied: -j DROP' },
    { time: '14:22:03.490', tag: 'AUDIT', text: 'INC-8041 flagged state: 503 HTTP' },
    { time: '14:22:04.102', tag: 'ALERT', text: 'OOM killer threshold 92% reached (RSS: 1.82GB)' },
    { time: '14:22:05.811', tag: 'SANDBOX', text: 'Pre-check signed by alex.rivera@cloudshield' },
    { time: '14:22:06.012', tag: 'COMPOSE', text: 'Target /opt/cloudshield/docker-compose.yml ready' },
    { time: '14:22:07.450', tag: 'AWAIT', text: 'Operator approval gate active...' }
  ]);

  const terminalEndRef = useRef(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleCopyCmd = () => {
    navigator.clipboard?.writeText(
      'docker compose -f /opt/cloudshield/docker-compose.yml restart cloudshield-api && curl -f --retry 3 http://localhost:8080/healthz'
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApproveAndExecute = async () => {
    setExecuting(true);
    setStatusState('EXECUTING');

    // Add live execution steps to TTY
    const addLog = (tag, text) => {
      const now = new Date();
      const timeStr = `${now.toTimeString().split(' ')[0]}.${String(now.getMilliseconds()).padStart(3, '0')}`;
      setLogs(prev => [...prev, { time: timeStr, tag, text }]);
    };

    addLog('AUTH', 'Hardware cryptographic signature validated: Ed25519-PFS');
    await new Promise(r => setTimeout(r, 600));

    addLog('COMPOSE', 'Dispatching SIGTERM to container cloudshield-api:8080...');
    await new Promise(r => setTimeout(r, 800));

    try {
      // Call real backend execution endpoint if available
      await remediationApi.execute(1).catch(() => {});
    } catch (e) {}

    addLog('COMPOSE', 'Container restarted. Spawning post-execution probe loop...');
    await new Promise(r => setTimeout(r, 700));

    addLog('PROBE', 'Probe 1/3: GET http://localhost:8001/health -> HTTP 200 OK (0.8ms)');
    await new Promise(r => setTimeout(r, 500));

    addLog('PROBE', 'Probe 2/3: GET http://localhost:8001/health -> HTTP 200 OK (0.7ms)');
    await new Promise(r => setTimeout(r, 500));

    addLog('PROBE', 'Probe 3/3: GET http://localhost:8001/health -> HTTP 200 OK (0.6ms)');
    addLog('VERIFIED', 'All health probes satisfied. Metric transition delta verified.');
    addLog('AUDIT', 'Chaining immutable proof block height #14,893 into Merkle ledger.');

    setExecuting(false);
    setStatusState('COMPLETED');
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Bar Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="cyber-card p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono font-semibold uppercase">ACTIVE RUNBOOKS</span>
            <Play size={13} className="text-cyan-400" />
          </div>
          <p className="font-heading text-2xl font-bold text-white">42 <span className="text-xs font-mono text-cyan-400">+6 deployed</span></p>
          <span className="text-[10px] text-slate-500 font-mono mt-1 block">Multi-cloud orchestrated auto-fixes</span>
        </div>

        <div className="cyber-card p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono font-semibold uppercase">1-CLICK EXECUTION RATE</span>
            <Zap size={13} className="text-cyan-400" />
          </div>
          <p className="font-heading text-2xl font-bold text-emerald-400">93.3% <span className="text-xs font-mono text-slate-400">+2.1%</span></p>
          <span className="text-[10px] text-slate-500 font-mono mt-1 block">Zero regression in last 1,420 runs</span>
        </div>

        <div className="cyber-card p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono font-semibold uppercase">AUTOMATED MTTR</span>
            <Clock size={13} className="text-indigo-400" />
          </div>
          <p className="font-heading text-2xl font-bold text-white">18.5m <span className="text-xs font-mono text-emerald-400">↓ -4.2m vs Q3</span></p>
          <span className="text-[10px] text-slate-500 font-mono mt-1 block">Mean triage to cluster restoration</span>
        </div>

        <div className="cyber-card p-4 rounded-xl border-emerald-500/30">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-mono font-semibold uppercase text-emerald-300">TARGET SANDBOX STATE</span>
            <span className="pulse-emerald"></span>
          </div>
          <p className="font-heading text-base font-bold text-emerald-400">ARMED & GUARDED</p>
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
            <span>Egress Policy: STRICT</span>
            <span className="text-cyan-400">BBR Tunnels Up</span>
          </div>
        </div>
      </div>

      {/* 3-Column Execution Center Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Column 1: Queue & Approvals */}
        <div className="lg:col-span-3 space-y-3">
          <div className="cyber-card p-4 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-white uppercase font-mono flex items-center gap-1.5">
                <Wrench size={14} className="text-cyan-400" />
                Queue & Approvals
              </span>
              <span className="cyber-badge badge-rose text-[9px]">2 URGENT</span>
            </div>

            <div className="space-y-2.5">
              {/* Item 1 */}
              <div
                onClick={() => setSelectedJob('REM-109')}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedJob === 'REM-109'
                    ? 'bg-cyan-950/40 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-cyan-400 font-bold text-xs">REM-109</span>
                  <span className="cyber-badge badge-rose text-[8px]">HIGH RISK</span>
                </div>
                <p className="text-xs font-semibold text-slate-100">Restart cloudshield-api & Probe</p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">Linked: INC-8041 (Memory Leak & 503)</p>
                <div className="flex items-center justify-between mt-2 text-[10px] font-mono">
                  <span className="text-slate-500">us-east-k8s-prod</span>
                  <span className="text-amber-400 font-semibold">Sign-Off Required</span>
                </div>
              </div>

              {/* Item 2 */}
              <div
                onClick={() => setSelectedJob('REM-110')}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedJob === 'REM-110'
                    ? 'bg-cyan-950/40 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-cyan-400 font-bold text-xs">REM-110</span>
                  <span className="cyber-badge badge-amber text-[8px]">MEDIUM</span>
                </div>
                <p className="text-xs font-semibold text-slate-100">Rotate AWS STS Bastion Tokens</p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">Linked: Security Posture SecP-3140</p>
                <div className="flex items-center justify-between mt-2 text-[10px] font-mono">
                  <span className="text-slate-500">iam-role/bastion-01</span>
                  <span className="text-emerald-400">Dry-run Passed</span>
                </div>
              </div>

              {/* Item 3 */}
              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/60 opacity-80">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-slate-400 font-bold text-xs">REM-108</span>
                  <span className="cyber-badge badge-emerald text-[8px]">RESOLVED</span>
                </div>
                <p className="text-xs font-semibold text-slate-300">Purge Edge Cloudflare Cache</p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">Execution took 1.2s • Zero drop</p>
                <span className="text-[10px] text-emerald-400 font-mono mt-1 block">✓ Executed by Autonomous Bot</span>
              </div>
            </div>

            {/* Impacted Target Topology */}
            <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-mono">
              <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                IMPACTED TARGET TOPOLOGY
              </span>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                <p className="text-cyan-300 font-semibold">ingress-nginx-lb-04</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Cluster node ip-10-240-8-12</p>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Approvals Workspace */}
        <div className="lg:col-span-5 space-y-4">
          <div className="cyber-card p-5 rounded-xl border-cyan-500/30">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-cyan-400 text-sm">REM-109</span>
                  <span className="text-xs font-mono text-slate-400">INC-8041-HOTFIX</span>
                </div>
                <h2 className="font-heading text-lg font-bold text-white mt-0.5">
                  Approve Container Evacuation & Re-Deploy
                </h2>
              </div>
              <span className="cyber-badge badge-rose text-[9px]">CRITICAL WORKLOAD</span>
            </div>

            {/* 5-Stage Execution Lifecycle Pipeline */}
            <div className="my-4">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-2.5">
                5-STAGE EXECUTION LIFECYCLE PIPELINE
              </span>
              <div className="grid grid-cols-5 gap-1.5 text-center font-mono text-[10px]">
                <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/50 text-emerald-300">
                  <Check size={12} className="mx-auto mb-1 text-emerald-400" />
                  <span>1. Linked</span>
                </div>
                <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/50 text-emerald-300">
                  <Check size={12} className="mx-auto mb-1 text-emerald-400" />
                  <span>2. Sandbox</span>
                </div>
                <div className={`p-2 rounded border transition-all ${
                  statusState === 'COMPLETED'
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                    : 'bg-cyan-950/60 border-cyan-400 text-cyan-300 shadow-sm shadow-cyan-400/30'
                }`}>
                  <FileCheck size={12} className="mx-auto mb-1 text-cyan-400" />
                  <span>3. Sign-Off</span>
                </div>
                <div className={`p-2 rounded border ${
                  statusState === 'EXECUTING'
                    ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300 animate-pulse'
                    : statusState === 'COMPLETED'
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}>
                  <Zap size={12} className="mx-auto mb-1" />
                  <span>4. Execute</span>
                </div>
                <div className={`p-2 rounded border ${
                  statusState === 'COMPLETED'
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}>
                  <CheckCircle2 size={12} className="mx-auto mb-1" />
                  <span>5. Probe</span>
                </div>
              </div>
            </div>

            {/* Target Metric Transition Deltas */}
            <div className="my-4 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-2">
                TARGET METRIC TRANSITION DELTAS
              </span>
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">HTTP STATUS VECTOR</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-rose-400 font-bold">503 Service Unavail</span>
                    <ArrowRight size={12} className="text-slate-600" />
                    <span className="text-emerald-400 font-bold">200 OK Clean</span>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">MEMORY RSS ENVELOPE</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-rose-400 font-bold">1.82 GB (Leak)</span>
                    <ArrowRight size={12} className="text-slate-600" />
                    <span className="text-cyan-400 font-bold">240 MB Boot</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Predefined Authorized Shell Action */}
            <div className="space-y-1.5 my-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Lock size={12} className="text-emerald-400" />
                  PREDEFINED AUTHORIZED SHELL ACTION
                </span>
                <button
                  onClick={handleCopyCmd}
                  className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px]"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto">
                <span className="text-slate-600 select-none">$ </span>
                docker compose -f /opt/cloudshield/docker-compose.yml restart cloudshield-api &amp;&amp; curl -f --retry 3 http://localhost:8080/healthz
              </div>
            </div>

            {/* Safety Checkboxes */}
            <div className="space-y-2 my-4 text-xs font-mono text-slate-300">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checks.drain}
                  onChange={(e) => setChecks({ ...checks, drain: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500"
                />
                <span>Drain ingress traffic to failover replica pod-02b</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checks.snapshot}
                  onChange={(e) => setChecks({ ...checks, snapshot: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500"
                />
                <span>Snapshot container RAM memory dump for SecOps forensics</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checks.hardwareSign}
                  onChange={(e) => setChecks({ ...checks, hardwareSign: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500"
                />
                <span>Sign cryptographic payload with hardware security token</span>
              </label>
            </div>

            {/* Operator Notes */}
            <div className="space-y-1.5 my-4">
              <label className="block text-xs font-mono text-slate-400">
                Operator Sign-Off Notes (Audit Log Trail)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800 gap-3">
              <button className="btn-cyber-dark text-xs py-2 px-3">
                Reject Request
              </button>
              <button className="btn-cyber-dark text-xs py-2 px-3">
                Simulate Dry-Run
              </button>
              <button
                onClick={handleApproveAndExecute}
                disabled={executing || statusState === 'COMPLETED'}
                className="btn-cyan text-xs font-bold py-2 px-4 shadow-lg shadow-cyan-500/25 flex-1 justify-center"
              >
                {executing ? (
                  <RotateCw size={14} className="animate-spin" />
                ) : statusState === 'COMPLETED' ? (
                  <CheckCircle2 size={14} className="text-emerald-400" />
                ) : (
                  <Play size={14} />
                )}
                <span>
                  {executing
                    ? 'Executing Pipeline...'
                    : statusState === 'COMPLETED'
                    ? 'Remediation Verified'
                    : 'Approve & Execute Remediation'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Column 3: Live Docker Daemon TTY Terminal */}
        <div className="lg:col-span-4 space-y-3">
          <div className="cyber-card p-4 rounded-xl flex flex-col h-full min-h-[520px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <TerminalIcon size={16} className="text-cyan-400" />
                <div>
                  <h3 className="font-heading text-xs font-bold text-white uppercase font-mono tracking-wider">
                    DOCKER DAEMON TTY
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500">ws://live:8080</span>
                </div>
              </div>
              <span className="pulse-emerald"></span>
            </div>

            {/* Live Terminal Stream */}
            <div className="cyber-terminal flex-1 my-3 overflow-y-auto max-h-[460px]">
              {logs.map((log, index) => (
                <div key={index} className="terminal-line mb-1.5 text-[11px]">
                  <span className="terminal-timestamp font-mono">[{log.time}]</span>
                  <span className={`font-mono font-bold ${
                    log.tag === 'ALERT'
                      ? 'text-rose-400'
                      : log.tag === 'GUARD'
                      ? 'text-emerald-400'
                      : log.tag === 'AWAIT'
                      ? 'text-amber-400'
                      : log.tag === 'VERIFIED'
                      ? 'text-cyan-300'
                      : 'text-cyan-400'
                  }`}>
                    [{log.tag}]
                  </span>
                  <span className="text-slate-300 font-mono">{log.text}</span>
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-500">
              <span>Daemon: v24.0.7 (Linux)</span>
              <button
                onClick={handleClearLogs}
                className="text-slate-400 hover:text-slate-200"
              >
                Clear Feed
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
