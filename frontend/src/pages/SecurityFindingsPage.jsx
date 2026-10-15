import React, { useState, useEffect } from 'react';
import { findingsApi } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
  Play,
  RotateCcw,
  Wrench,
  CheckCircle,
  FileCode,
  AlertCircle
} from 'lucide-react';

export const SecurityFindingsPage = () => {
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [feedback, setFeedback] = useState(null);
  const { user } = useAuth();

  const fetchFindings = async () => {
    setLoading(true);
    try {
      const data = await findingsApi.list(statusFilter || null);
      setFindings(data);
    } catch (err) {
      console.error('Failed to load findings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFindings();
  }, [statusFilter]);

  const handleRunScan = async () => {
    setScanning(true);
    setFeedback(null);
    try {
      const result = await findingsApi.scan();
      setFeedback({
        type: 'success',
        message: `Scan complete: ${result.total_findings} active findings detected (${result.resolved_findings} resolved).`
      });
      fetchFindings();
    } catch (err) {
      setFeedback({ type: 'error', message: 'Security scan failed to complete.' });
    } finally {
      setScanning(false);
    }
  };

  const handleResetConfig = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      await findingsApi.resetSample();
      setFeedback({
        type: 'success',
        message: 'Sample configuration reset to vulnerable baseline. Run scan to re-detect all 5 findings.'
      });
      fetchFindings();
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to reset configuration.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestFix = async (finding) => {
    const actionMap = {
      'SEC-001': 'FIX_SEC_001',
      'SEC-002': 'FIX_SEC_002',
      'SEC-003': 'FIX_SEC_003',
      'SEC-004': 'FIX_SEC_004',
      'SEC-005': 'FIX_SEC_005',
    };
    const action = actionMap[finding.rule_id];
    if (!action) return;

    try {
      await findingsApi.requestRemediation(finding.id, action, `Requested automated key patch for ${finding.rule_id}`);
      setFeedback({
        type: 'success',
        message: `Remediation request submitted for ${finding.rule_id}. Admin approval required in Remediation tab.`
      });
      fetchFindings();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.detail || 'Failed to submit remediation request.'
      });
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Title & Trigger Scan */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white tracking-tight">
            Static Cloud Security Assessment Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated OWASP-aligned policy enforcement against cloud infrastructure-as-code manifests
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetConfig}
            className="btn-secondary text-xs"
            title="Restore vulnerable sample config for testing"
          >
            <RotateCcw size={14} className="text-indigo-400" />
            <span>Reset Vulnerable Config</span>
          </button>

          <button
            onClick={handleRunScan}
            disabled={scanning}
            className="btn-primary text-xs"
          >
            <Play size={14} className={scanning ? 'animate-spin' : ''} />
            <span>{scanning ? 'Scanning Manifests...' : 'Run Security Scan'}</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          style={{
            marginBottom: '20px',
            padding: '10px 16px',
            borderRadius: '8px',
            fontSize: '0.82rem',
            background: feedback.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${feedback.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            color: feedback.type === 'success' ? '#6ee7b7' : '#fca5a5',
          }}
        >
          {feedback.message}
        </div>
      )}

      {/* Findings Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: 'rgba(30, 41, 59, 0.4)', borderBottom: '1px solid rgba(51, 65, 85, 0.6)' }}>
              <th style={{ padding: '14px 18px', color: '#94a3b8', fontWeight: 600 }}>Rule ID</th>
              <th style={{ padding: '14px 18px', color: '#94a3b8', fontWeight: 600 }}>Policy Check Name</th>
              <th style={{ padding: '14px 18px', color: '#94a3b8', fontWeight: 600 }}>Severity</th>
              <th style={{ padding: '14px 18px', color: '#94a3b8', fontWeight: 600 }}>Forensic Evidence</th>
              <th style={{ padding: '14px 18px', color: '#94a3b8', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '14px 18px', color: '#94a3b8', fontWeight: 600 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                  Loading security policy assessment findings...
                </td>
              </tr>
            ) : findings.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                  No security findings recorded. Click "Run Security Scan" to evaluate manifests.
                </td>
              </tr>
            ) : (
              findings.map((f) => (
                <tr
                  key={f.id}
                  style={{ borderBottom: '1px solid rgba(51, 65, 85, 0.3)' }}
                  className="hover:bg-slate-800/30"
                >
                  <td style={{ padding: '14px 18px', fontWeight: 700, color: '#818cf8', fontFamily: 'monospace' }}>
                    {f.rule_id}
                  </td>
                  <td style={{ padding: '14px 18px', color: '#f8fafc', fontWeight: 500 }}>
                    <div>{f.rule_name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                      {f.recommendation}
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <StatusBadge status={f.severity} />
                  </td>
                  <td style={{ padding: '14px 18px', maxWidth: '320px' }}>
                    <div
                      style={{
                        background: 'rgba(15, 23, 42, 0.7)',
                        border: '1px solid rgba(51, 65, 85, 0.6)',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        fontFamily: 'monospace',
                        fontSize: '0.74rem',
                        color: '#cbd5e1',
                        wordBreak: 'break-all',
                      }}
                    >
                      {f.evidence}
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <StatusBadge status={f.status} />
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    {f.status === 'open' ? (
                      <button
                        onClick={() => handleRequestFix(f)}
                        className="btn-secondary text-xs border-indigo-500/40 text-indigo-300"
                        title="Submit automated configuration remediation request"
                      >
                        <Wrench size={13} />
                        <span>Request Auto-Fix</span>
                      </button>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                        <CheckCircle size={14} /> Verified Resolved
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
