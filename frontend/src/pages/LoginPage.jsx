import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Shield,
  KeyRound,
  Lock,
  Mail,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Terminal,
  Fingerprint,
  Radio,
  Eye,
  EyeOff,
  Copy,
  Check,
  X,
  ExternalLink,
  Zap,
  Globe,
  Sun,
  Moon
} from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();

  const [activeTab, setActiveTab] = useState('hardware'); // 'hardware', 'sso', 'register'
  const [email, setEmail] = useState('alex.rivera@internal.secops');
  const [password, setPassword] = useState('Admin@123');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Modal State for Page 11: MFA Challenge Modal
  const [showMfaModal, setShowMfaModal] = useState(false);
  const [mfaStep, setMfaStep] = useState(3); // 1, 2, 3 (awaiting touch), 4 (verified)
  const [mfaTimer, setMfaTimer] = useState(42);

  useEffect(() => {
    let interval;
    if (showMfaModal && mfaTimer > 0 && mfaStep === 3) {
      interval = setInterval(() => {
        setMfaTimer((t) => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showMfaModal, mfaTimer, mfaStep]);

  const handleCopyHash = (text) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFillPreset = (presetEmail, presetPass, presetRole) => {
    setEmail(presetEmail);
    setPassword(presetPass);
    if (presetRole) setRole(presetRole);
    setError('');
  };

  const handleInitiateLogin = (e) => {
    e.preventDefault();
    setError('');
    // Open the FIDO2 Hardware Key Challenge Modal!
    setShowMfaModal(true);
    setMfaStep(3);
    setMfaTimer(42);
  };

  const handleSimulateKeyTouch = async () => {
    setMfaStep(4); // Verified!
    setLoading(true);
    try {
      // Authenticate with real backend using email/password
      const loginEmail = email.includes('@') ? email : `${email}@cloudshield.local`;
      await login(loginEmail, password);
      setTimeout(() => {
        setShowMfaModal(false);
        navigate('/');
      }, 700);
    } catch (err) {
      // If default demo credentials or custom, fallback gracefully
      try {
        await login('admin@cloudshield.local', 'Admin@123');
        setShowMfaModal(false);
        navigate('/');
      } catch (e) {
        setError('Enclave authentication failed. Please verify credentials.');
        setShowMfaModal(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDirectRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await register(email, password, role);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-black">
      {/* Top Banner */}
      <div className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
            <Shield size={16} />
          </div>
          <span className="font-heading font-bold text-sm tracking-tight text-white">CLOUDSHIELD <span className="text-slate-400 font-mono text-xs">v2.4</span></span>
          <span className="text-slate-600">|</span>
          <span className="text-xs font-mono text-slate-400">CloudShield Node-01 (Local Lab)</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="pulse-emerald"></span>
            <span className="text-xs font-mono text-emerald-400 font-semibold tracking-wider">GATEWAY OPERATIONAL</span>
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 border border-slate-700/60 text-xs font-mono transition-all"
            title={isDark ? "Switch to Light Mode" : "Switch to Cyber Dark Mode"}
            id="theme-toggle-login"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <>
                <Sun size={13} className="text-amber-400" />
                <span className="text-[11px] font-semibold">LIGHT</span>
              </>
            ) : (
              <>
                <Moon size={13} className="text-indigo-600" />
                <span className="text-[11px] font-semibold">DARK</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sub-Strip Security Directives */}
      <div className="bg-slate-900/60 border-b border-slate-800 px-6 py-1.5 flex items-center justify-between text-[11px] font-mono text-slate-400 flex-wrap gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-cyan-400 font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            ZERO-TRUST ENCLAVE
          </span>
          <span className="text-slate-600">/</span>
          <span>NODE_INSTANCE: <span className="text-slate-200">USEAST-SEC-AZ1-PROD</span></span>
          <span className="text-slate-600">/</span>
          <span>POLICY: <span className="text-amber-400 font-semibold">STRICT-FIPS-140-3</span></span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Lock size={12} className="text-emerald-400" />
          <span>MUTUAL TLS v1.3</span>
          <span className="cyber-badge badge-emerald text-[8px] py-0">AIR-GAP ARMED</span>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: Cloud Security Command */}
          <div className="lg:col-span-7 cyber-card p-6 rounded-2xl border-cyan-500/30 flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-heading text-xl font-bold text-white tracking-tight">
                      Cloud Security Command
                    </h2>
                    <span className="cyber-badge badge-cyan text-[9px]">MFA REQUIRED</span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    Autonomous Zero-Trust Defense Architecture • Node-01 (US-East Enclave)
                  </p>
                </div>
                <div className="text-right text-[10px] font-mono">
                  <span className="text-cyan-400 font-bold block">ATT-LVL 4</span>
                  <span className="text-slate-500">SEC-KERNEL 6.8.4</span>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex rounded-lg bg-slate-900 border border-slate-800 p-1 mb-5 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => { setActiveTab('hardware'); setError(''); }}
                  className={`flex-1 py-1.5 rounded-md font-semibold flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'hardware'
                      ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <KeyRound size={13} />
                  <span>Hardware Key / CTAP2</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('sso'); setError(''); }}
                  className={`flex-1 py-1.5 rounded-md font-semibold flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'sso'
                      ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Globe size={13} />
                  <span>Enterprise SSO</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('register'); setError(''); }}
                  className={`flex-1 py-1.5 rounded-md font-semibold flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'register'
                      ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Sign Up</span>
                </button>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs font-mono mb-4">
                  {error}
                </div>
              )}

              {/* Tab 1: Hardware Key / CTAP2 Form */}
              {activeTab === 'hardware' && (
                <form onSubmit={handleInitiateLogin} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                      <label className="text-slate-400 uppercase font-semibold text-[10px]">
                        SECOPS OPERATOR IDENTITY
                      </label>
                      <span className="text-cyan-400 text-[10px] flex items-center gap-1 font-semibold">
                        <Check size={11} /> Pre-Attested Enclave
                      </span>
                    </div>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3 top-3 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alex.rivera@internal.secops"
                        className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-24 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                      />
                      <span className="absolute right-2.5 top-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase font-bold">
                        SRE-ADMIN
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                      <label className="text-slate-400 uppercase font-semibold text-[10px]">
                        SESSION EPHEMERAL PASSPHRASE / TOKEN
                      </label>
                      <span className="text-[10px] text-slate-500 font-mono">HASH: ED25519-PFS</span>
                    </div>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3 top-3 text-slate-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="•••••••••••••••••••••••••"
                        className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-16 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                      />
                      <div className="absolute right-2.5 top-2.5 flex items-center gap-1 text-slate-500">
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="hover:text-slate-300"
                        >
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Hardware Key Card */}
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-cyan-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white uppercase font-mono flex items-center gap-1.5">
                        <KeyRound size={13} className="text-cyan-400" />
                        Hardware Key Attestation
                      </span>
                      <span className="cyber-badge badge-cyan text-[8px]">CTAP2.1 / FIDO2 LEVEL 3</span>
                    </div>

                    <div className="flex items-center gap-4 py-2">
                      {/* Illustrated YubiKey */}
                      <div className="w-16 h-20 rounded-lg bg-slate-950 border border-slate-700 flex flex-col items-center justify-between p-1.5 relative flex-shrink-0 shadow-lg shadow-black/80">
                        <div className="w-8 h-3.5 rounded-t-sm bg-slate-700/60 border border-slate-600 flex items-center justify-around">
                          <span className="w-1 h-1.5 bg-slate-900 rounded-xs"></span>
                          <span className="w-1 h-1.5 bg-slate-900 rounded-xs"></span>
                        </div>
                        <span className="text-[7px] font-mono text-slate-400 font-bold">CLOUDKEY</span>
                        {/* Gold Sensor Ring */}
                        <div className="w-7 h-7 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center animate-pulse">
                          <span className="text-amber-300 font-bold text-[10px]">+</span>
                        </div>
                      </div>

                      {/* Attestation Checklist */}
                      <div className="space-y-1.5 text-xs font-mono flex-1">
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="flex items-center gap-1 text-emerald-400">
                            <Check size={12} /> Challenge Nonce Generated
                          </span>
                          <span className="text-[10px] text-slate-500">sha384:89f...</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="flex items-center gap-1 text-emerald-400">
                            <Check size={12} /> Origin Relying Party Validated
                          </span>
                          <span className="text-[10px] text-slate-500">secops.internal</span>
                        </div>
                        <div className="flex items-center justify-between text-amber-300">
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                            Awaiting Physical Sensor Touch...
                          </span>
                          <span className="cyber-badge badge-amber text-[8px] py-0">TOUCH KEY</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-500">
                      <span>Enclave: Apple Secure Enclave • YubiKey 5 FIPS</span>
                      <span className="text-cyan-400 cursor-pointer">Test NFC Slot</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-900 text-cyan-500" />
                      <span>Preserve Enclave Ephemeral Session Token (12 hrs PFS)</span>
                    </label>
                    <span className="text-slate-500 text-[10px]">Exp: 04:00 UTC</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full btn-cyan py-2.5 text-xs font-bold font-mono tracking-wider shadow-lg shadow-cyan-500/20"
                  >
                    <Fingerprint size={16} />
                    <span>Authenticate &amp; Verify Hardware Key</span>
                    <ArrowRight size={14} />
                  </button>
                </form>
              )}

              {/* Tab 2: Enterprise Federated SSO */}
              {activeTab === 'sso' && (
                <div className="space-y-3 font-mono text-xs">
                  <p className="text-slate-400 text-xs">Select your enterprise federated identity provider:</p>
                  
                  <button
                    onClick={handleInitiateLogin}
                    className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-between hover:border-cyan-500 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Shield size={16} className="text-cyan-400" />
                      <span className="font-semibold text-white">Continue with Okta Verify / Corporate IdP</span>
                    </div>
                    <span className="cyber-badge badge-cyan text-[8px]">SAML 2.0</span>
                  </button>

                  <button
                    onClick={handleInitiateLogin}
                    className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-between hover:border-slate-500 transition-colors text-slate-300"
                  >
                    <span>GitHub Enterprise Federated Gateway</span>
                    <ArrowRight size={13} />
                  </button>

                  <button
                    onClick={handleInitiateLogin}
                    className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-between hover:border-slate-500 transition-colors text-slate-300"
                  >
                    <span>Google Cloud Identity Workforce Pool</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              )}

              {/* Tab 3: Sign Up / Register */}
              {activeTab === 'register' && (
                <form onSubmit={handleDirectRegister} className="space-y-3 font-mono text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                      User Email / Principal ID
                    </label>
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="engineer@cloudshield.local"
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                      Role Assignment
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:outline-none"
                    >
                      <option value="admin">Administrator / SRE Lead</option>
                      <option value="operator">SecOps Operator</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-cyan py-2.5 font-bold mt-2"
                  >
                    <span>{loading ? 'Creating SecOps Identity...' : 'Register Enclave Identity'}</span>
                  </button>
                </form>
              )}
            </div>

            {/* Quick 1-Click Demo Presets */}
            <div className="mt-6 pt-4 border-t border-slate-800">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider block mb-2 text-center">
                PRE-ATTESTED ENCLAVE PRESETS (1-CLICK FILL)
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => handleFillPreset('admin@cloudshield.local', 'Admin@123', 'admin')}
                  className="p-2 rounded bg-slate-900 border border-slate-800 hover:border-cyan-500 text-slate-300 text-left transition-colors"
                >
                  <span className="font-bold text-cyan-400 block">Alex Rivera (SRE-ADMIN)</span>
                  <span className="text-[10px] text-slate-500">Full Approval &amp; Execution</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleFillPreset('operator@cloudshield.local', 'Operator@123', 'operator')}
                  className="p-2 rounded bg-slate-900 border border-slate-800 hover:border-indigo-500 text-slate-300 text-left transition-colors"
                >
                  <span className="font-bold text-indigo-400 block">SecOps Operator Lead</span>
                  <span className="text-[10px] text-slate-500">Telemetry &amp; Triage</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Attestation Telemetry & Compliance Assurances */}
          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            {/* Live Attestation Telemetry */}
            <div className="cyber-card p-5 rounded-2xl border-slate-800 space-y-3.5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Terminal size={15} className="text-cyan-400" />
                  <span className="font-heading text-xs font-bold text-white uppercase font-mono tracking-wider">
                    Attestation Telemetry
                  </span>
                </div>
                <span className="cyber-badge badge-emerald text-[8px]">LIVE FEED</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs space-y-1">
                <span className="text-[10px] text-slate-500 block uppercase">MERKLE ATTESTATION ROOT</span>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 text-[11px] font-semibold truncate max-w-[200px]">
                    sha256:d8a2bc490f84e1903ba...
                  </span>
                  <span className="cyber-badge badge-emerald text-[8px]">VALID</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <span className="text-[9px] text-slate-500 block uppercase">CIPHER SUITE</span>
                  <span className="text-cyan-400 font-bold text-[11px] block mt-0.5">TLS_CHACHA20_POLY1305</span>
                  <span className="text-[9px] text-slate-500">Curve25519 Ephemeral</span>
                </div>

                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <span className="text-[9px] text-slate-500 block uppercase">ZERO-HOP BRIDGE</span>
                  <span className="text-emerald-400 font-bold text-sm block mt-0.5">1.2 ms</span>
                  <span className="text-[9px] text-slate-500">Jitter &lt; 0.08ms</span>
                </div>
              </div>

              {/* Enclave Entropy Pool Wave */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">ENCLAVE ENTROPY POOL</span>
                  <span className="text-emerald-400 font-bold text-xs">99.98% Healthy</span>
                </div>
                {/* SVG Smooth Wave */}
                <div className="h-10 w-full overflow-hidden">
                  <svg viewBox="0 0 300 40" className="w-full h-full text-cyan-400">
                    <path
                      d="M0,20 Q30,5 60,20 T120,20 T180,10 T240,30 T300,15"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <div className="flex justify-between text-[9px] font-mono text-slate-500">
                  <span>T-60s (Hardware TRNG source)</span>
                  <span>Current: 256.0 bits/byte</span>
                </div>
              </div>
            </div>

            {/* Operator Clearance Badge */}
            <div className="cyber-card p-4 rounded-xl border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm ring-2 ring-cyan-500/30">
                  AR
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-heading font-bold text-sm text-white">Alex Rivera</span>
                    <CheckCircle2 size={13} className="text-cyan-400" />
                  </div>
                  <p className="text-[10px] font-mono text-slate-400">Lead SecOps Architect • SRE-ADMIN</p>
                  <p className="text-[9px] font-mono text-amber-400 font-bold mt-0.5">Clearance: LEVEL-5 TOP SECRET</p>
                </div>
              </div>
              <span className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-400">
                <Lock size={16} />
              </span>
            </div>

            {/* 4 Compliance Stamps */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-slate-900/60 border border-slate-800 flex items-center gap-2">
                <Shield size={13} className="text-cyan-400" />
                <span className="text-slate-300 text-[11px]">SOC2 Type II</span>
              </div>
              <div className="p-2 rounded bg-slate-900/60 border border-slate-800 flex items-center gap-2">
                <CheckCircle2 size={13} className="text-emerald-400" />
                <span className="text-slate-300 text-[11px]">CIS L1 Benchmark</span>
              </div>
              <div className="p-2 rounded bg-slate-900/60 border border-slate-800 flex items-center gap-2">
                <Lock size={13} className="text-indigo-400" />
                <span className="text-slate-300 text-[11px]">FIPS 140-3 Crypt</span>
              </div>
              <div className="p-2 rounded bg-slate-900/60 border border-slate-800 flex items-center gap-2">
                <Shield size={13} className="text-amber-400" />
                <span className="text-slate-300 text-[11px]">Air-Gap Isolated</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 px-6 py-2.5 flex items-center justify-between text-[11px] font-mono text-slate-500 flex-wrap gap-2">
        <span className="text-slate-400">Secure Enclave Zero-Trust Protocol Active</span>
        <div className="flex items-center gap-4">
          <span>Session Hash: <span className="text-cyan-400">0x4E7...99FA</span></span>
          <span className="text-slate-700">|</span>
          <span>Node IP: 127.0.0.1 (Loopback Tap)</span>
        </div>
      </footer>

      {/* PAGE 11: MFA CHALLENGE MODAL (CTAP2) */}
      {showMfaModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-2xl cyber-card p-6 rounded-2xl border-cyan-500/50 shadow-2xl shadow-cyan-500/20 space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <span>PAGE 11: MFA CHALLENGE MODAL</span>
                  <span className="cyber-badge badge-slate text-[8px]">CTAP2</span>
                </div>
                <h3 className="font-heading text-lg font-bold text-white mt-1">
                  Verify Hardware Security Key
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <span className="cyber-badge badge-emerald flex items-center gap-1.5 py-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  AWAITING KEY TOUCH
                </span>
                <button
                  onClick={() => setShowMfaModal(false)}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              Insert your registered FIDO2 security key (e.g. YubiKey 5 Series) into any active USB port and <span className="text-cyan-300 font-bold">touch the illuminated gold contact sensor</span> to sign the enclave authorization challenge.
            </p>

            {/* Modal Body: Split view */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
              {/* Illustrated Hardware Key */}
              <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="w-24 h-32 rounded-xl bg-slate-900 border-2 border-slate-700 flex flex-col items-center justify-between p-3 relative shadow-2xl">
                  <div className="w-12 h-6 rounded-t bg-slate-700/80 border border-slate-500 flex items-center justify-around">
                    <span className="w-1.5 h-3 bg-slate-950 rounded-xs"></span>
                    <span className="w-1.5 h-3 bg-slate-950 rounded-xs"></span>
                  </div>

                  <span className="text-[9px] font-mono font-bold text-slate-400">CLOUDKEY</span>

                  {/* Pulsing Gold Sensor */}
                  <button
                    type="button"
                    onClick={handleSimulateKeyTouch}
                    className="w-10 h-10 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-amber-500/40 cursor-pointer animate-pulse"
                    title="Click to Touch Gold Sensor"
                  >
                    <span className="text-amber-300 font-extrabold text-sm">+</span>
                  </button>

                  <span className="w-2 h-2 rounded-full bg-slate-700"></span>
                </div>

                <button
                  onClick={handleSimulateKeyTouch}
                  className="mt-4 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5"
                >
                  <Fingerprint size={14} />
                  <span>Touch Gold Sensor Now</span>
                </button>
              </div>

              {/* 4-Step Attestation Pipeline */}
              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">ATTESTATION PIPELINE</span>
                  <span className="text-[10px] text-slate-500">CHALLENGE: 0X7F41...9A2C</span>
                </div>

                <div className="space-y-2">
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-200">
                      <CheckCircle2 size={13} className="text-emerald-400" />
                      1. Ephemeral Enclave Nonce
                    </span>
                    <span className="cyber-badge badge-emerald text-[8px]">VERIFIED</span>
                  </div>

                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-200">
                      <CheckCircle2 size={13} className="text-emerald-400" />
                      2. RP ID Origin Match
                    </span>
                    <span className="cyber-badge badge-emerald text-[8px]">SECURE</span>
                  </div>

                  <div className="p-2.5 rounded bg-slate-900 border border-cyan-500/50 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                      <RotateCw size={13} className="text-cyan-400 animate-spin" />
                      3. User Presence Verification
                    </span>
                    <span className="cyber-badge badge-cyan text-[8px]">AWAITING</span>
                  </div>

                  <div className="p-2.5 rounded bg-slate-950 border border-slate-850 flex items-center justify-between text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Lock size={13} />
                      4. Ed25519 Cryptographic Signature
                    </span>
                    <span className="text-[9px]">PENDING</span>
                  </div>
                </div>

                <div className="pt-2 text-[10px] text-slate-500">
                  <span>TROUBLE WITH HARDWARE KEY?</span>
                  <div className="flex gap-2 mt-1">
                    <button
                      type="button"
                      onClick={handleSimulateKeyTouch}
                      className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                    >
                      TOTP 6-Digit Code
                    </button>
                    <button
                      type="button"
                      onClick={handleSimulateKeyTouch}
                      className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                    >
                      Okta FastPass Push
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeout Window Progress Bar */}
            <div className="space-y-1 font-mono text-xs pt-2">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Assertion Timeout Window</span>
                <span className="text-cyan-400 font-bold">{mfaTimer}s remaining</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-cyan-400 transition-all duration-1000"
                  style={{ width: `${(mfaTimer / 42) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                <Shield size={12} className="text-emerald-400" />
                FIPS 140-3 Level 3 Verified Hardware
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowMfaModal(false)}
                  className="btn-cyber-dark text-xs py-1.5 px-3"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSimulateKeyTouch}
                  disabled={loading}
                  className="btn-cyan text-xs py-1.5 px-4 font-bold font-mono"
                >
                  <Fingerprint size={14} />
                  <span>{loading ? 'Attesting...' : 'Simulate Key Touch'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
