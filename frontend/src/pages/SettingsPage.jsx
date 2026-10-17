import React, { useState } from 'react';
import {
  Settings,
  Sliders,
  Shield,
  Save,
  RotateCcw,
  CheckCircle2,
  Lock,
  Cpu,
  Server,
  AlertTriangle,
  Zap,
  Layers,
  Radio,
  ExternalLink
} from 'lucide-react';

export const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('monitoring');
  const [cpuThreshold, setCpuThreshold] = useState(80);
  const [memThreshold, setMemThreshold] = useState(85);
  const [probeTimeout, setProbeTimeout] = useState(1500);
  const [err5xxThreshold, setErr5xxThreshold] = useState(5.0);
  const [saveMessage, setSaveMessage] = useState('');

  const handleSave = () => {
    setSaveMessage('Synchronizing new thresholds to Prometheus operator configmap...');
    setTimeout(() => {
      setSaveMessage('✓ Configurations saved & applied live to telemetry pipeline.');
      setTimeout(() => setSaveMessage(''), 4000);
    }, 1000);
  };

  const handleDiscard = () => {
    setCpuThreshold(80);
    setMemThreshold(85);
    setProbeTimeout(1500);
    setErr5xxThreshold(5.0);
    setSaveMessage('Reverted to active cluster defaults.');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-mono font-bold tracking-wider text-emerald-400 uppercase">
              ENGINE ACTIVE
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-xs font-mono text-slate-400">Last Synced 42s ago</span>
          </div>
          <h1 className="font-heading text-2xl font-bold text-white tracking-tight mt-1">
            System Configuration &amp; Telemetry
          </h1>
          <p className="text-xs text-slate-400">
            Manage Prometheus telemetry thresholds, CIS rule engines, multi-cloud connector credentials, and operator access controls.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleDiscard}
            className="btn-cyber-dark text-xs"
          >
            <RotateCcw size={14} />
            <span>Discard Changes</span>
          </button>
          <button
            onClick={handleSave}
            className="btn-cyan text-xs font-bold"
          >
            <Save size={14} />
            <span>Save Configurations</span>
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs font-mono flex items-center justify-between animate-fadeIn">
          <span>{saveMessage}</span>
          <span className="text-[10px] text-emerald-400 font-bold uppercase">ConfigMap Synced</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 text-xs font-mono overflow-x-auto pb-1">
        {[
          { key: 'general', label: 'General' },
          { key: 'monitoring', label: 'Monitoring & Thresholds (ACTIVE)', badge: '5 Rules' },
          { key: 'policies', label: 'Security Policies & CIS', badge: '32 Active' },
          { key: 'rbac', label: 'Users & RBAC', badge: '4' },
          { key: 'connectors', label: 'Cloud Connectors & Probes', badge: '6' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`py-2 px-3 rounded-t-lg font-semibold flex items-center gap-2 transition-colors flex-shrink-0 ${
              activeTab === t.key
                ? 'bg-slate-900 text-cyan-400 border-t border-x border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>{t.label}</span>
            {t.badge && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-normal">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Two Column Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Card: Telemetry Ingest & Prometheus Thresholds */}
        <div className="lg:col-span-7 cyber-card p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-heading text-sm font-bold text-white uppercase font-mono">
                Telemetry Ingest &amp; Prometheus Thresholds
              </h3>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                PromQL evaluated every evaluation loop against running Pods &amp; Edge nodes.
              </p>
            </div>
            <span className="cyber-badge badge-cyan text-[10px]">LOOP: 15.0s | BURST: 4.2x MAX</span>
          </div>

          {/* Ingest Telemetry Ribbon */}
          <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">LIVE INGEST RATE</span>
              <span className="text-sm font-bold text-white">1,482 <span className="text-slate-400 text-xs">samples/s</span></span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">RULE EVAL PERIOD</span>
              <span className="text-sm font-bold text-cyan-400">15.0 <span className="text-slate-400 text-xs">sec nominal</span></span>
              <span className="text-[9px] text-slate-500 block">Next: 3.8s</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">TELEMETRY JITTER</span>
              <span className="text-sm font-bold text-emerald-400">~1.4 ms <span className="text-slate-400 text-xs">delta</span></span>
              <span className="text-[9px] text-emerald-500 block">Zero-loss guaranteed</span>
            </div>
          </div>

          {/* Configured Threshold Triggers (Sliders) */}
          <div className="space-y-4 pt-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider block">
              CONFIGURED THRESHOLD TRIGGERS (PROMQL ALERTING)
            </span>

            {/* Slider 1: CPU */}
            <div className="p-3.5 rounded-lg bg-slate-900/50 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <Cpu size={14} className="text-cyan-400" />
                  <span className="font-semibold text-slate-200">CPU Sustained Saturation</span>
                  <span className="cyber-badge badge-rose text-[8px]">HIGHSEV</span>
                </div>
                <span className="font-bold text-cyan-400 text-sm">{cpuThreshold}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                value={cpuThreshold}
                onChange={(e) => setCpuThreshold(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-[10px] text-slate-500 font-mono">
                Condition: &gt; {cpuThreshold}% • Sustained Duration: 5m • Aggregation: <code className="text-slate-400">container_cpu_usage_seconds_total[5m]</code>
              </p>
            </div>

            {/* Slider 2: Memory */}
            <div className="p-3.5 rounded-lg bg-slate-900/50 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <Server size={14} className="text-emerald-400" />
                  <span className="font-semibold text-slate-200">Memory Cgroup Saturation</span>
                  <span className="cyber-badge badge-purple text-[8px]">AUTO-REMEDIATE</span>
                </div>
                <span className="font-bold text-cyan-400 text-sm">{memThreshold}%</span>
              </div>
              <input
                type="range"
                min="60"
                max="98"
                value={memThreshold}
                onChange={(e) => setMemThreshold(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-[10px] text-slate-500 font-mono">
                Condition: &gt; {memThreshold}% • Sustained Duration: 5m • Triggers HPA &amp; eviction prophylaxis
              </p>
            </div>

            {/* Slider 3: Health Probe Timeout */}
            <div className="p-3.5 rounded-lg bg-slate-900/50 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <Zap size={14} className="text-amber-400" />
                  <span className="font-semibold text-slate-200">Health Probe Failure</span>
                  <span className="cyber-badge badge-rose text-[8px]">CRITICAL SEV</span>
                </div>
                <span className="font-bold text-cyan-400 text-sm">{probeTimeout} ms</span>
              </div>
              <input
                type="range"
                min="500"
                max="5000"
                step="100"
                value={probeTimeout}
                onChange={(e) => setProbeTimeout(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-[10px] text-slate-500 font-mono">
                Condition: 3x consecutive fails • Liveness Timeout: {probeTimeout}ms • Immediate Page
              </p>
            </div>

            {/* Slider 4: HTTP 5xx */}
            <div className="p-3.5 rounded-lg bg-slate-900/50 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-rose-400" />
                  <span className="font-semibold text-slate-200">HTTP 5xx Error Spike</span>
                  <span className="cyber-badge badge-slate text-[8px]">GATEWAY</span>
                </div>
                <span className="font-bold text-rose-400 text-sm">{err5xxThreshold}%</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="15.0"
                step="0.5"
                value={err5xxThreshold}
                onChange={(e) => setErr5xxThreshold(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-[10px] text-slate-500 font-mono">
                Condition: &gt; {err5xxThreshold}% error ratio over 2m rolling window
              </p>
            </div>
          </div>
        </div>

        {/* Right Card: Cloud Connectors & Enclave Guard */}
        <div className="lg:col-span-5 space-y-4">
          <div className="cyber-card p-5 rounded-xl space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-heading text-sm font-bold text-white uppercase font-mono">
                  Cloud Connectors &amp; Enclave Guard
                </h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Multi-cloud identity trusts and zero-trust broker status.
                </p>
              </div>
              <Shield size={16} className="text-cyan-400" />
            </div>

            {/* Connector 1: AWS */}
            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-200 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  AWS IAM Role Trust
                </span>
                <span className="cyber-badge badge-emerald text-[8px]">ACTIVE</span>
              </div>
              <p className="text-slate-400 text-[10px] break-all">
                arn:aws:iam::492109841120:role/CloudShieldCrossAccountAuditor
              </p>
              <div className="flex justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
                <span>Ping: 14ms</span>
                <span className="text-emerald-400">Zero-Trust mTLS OK</span>
              </div>
            </div>

            {/* Connector 2: GCP */}
            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-200 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  GCP Service Account
                </span>
                <span className="cyber-badge badge-emerald text-[8px]">ACTIVE</span>
              </div>
              <p className="text-slate-400 text-[10px] break-all">
                sa-cloudshield-secops@gcp-prod-infra.iam.gserviceaccount.com
              </p>
              <div className="flex justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
                <span>Ping: 22ms</span>
                <span className="text-cyan-400">OIDC Federated</span>
              </div>
            </div>

            {/* Connector 3: Azure */}
            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-200 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  Azure KeyVault Bridge
                </span>
                <span className="cyber-badge badge-cyan text-[8px]">ENCLAVE SECURE</span>
              </div>
              <p className="text-slate-400 text-[10px] break-all">
                https://kv-cloudshield-hub.vault.azure.net/
              </p>
              <div className="flex justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
                <span>Ping: 18ms</span>
                <span className="text-purple-400">HSM-Backed</span>
              </div>
            </div>

            {/* Enclave Integrity Hash */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">
                ENCLAVE INTEGRITY HASH (SHA-512)
              </span>
              <p className="text-[10px] text-slate-400 break-all leading-tight">
                e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
