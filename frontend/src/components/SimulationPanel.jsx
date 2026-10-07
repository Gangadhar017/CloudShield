import React, { useState } from 'react';
import { monitoringApi, findingsApi } from '../services/api';
import { Play, RotateCcw, Zap, AlertOctagon, Cpu, Clock, CheckCircle } from 'lucide-react';

export const SimulationPanel = ({ onSimulationChange }) => {
  const [loading, setLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState('healthy');
  const [feedback, setFeedback] = useState(null);

  const handleSimulate = async (mode) => {
    setLoading(true);
    setFeedback(null);
    try {
      await monitoringApi.simulate(mode);
      setCurrentMode(mode);
      setFeedback({ type: 'success', message: `Simulation mode switched to: ${mode.toUpperCase()}` });
      if (onSimulationChange) onSimulationChange();
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to update simulation state' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetConfig = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      await findingsApi.resetSample();
      setFeedback({ type: 'success', message: 'Sample config reset to vulnerable baseline (all 5 violations restored)' });
      if (onSimulationChange) onSimulationChange();
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to reset sample configuration' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="glass-panel"
      style={{
        padding: '16px 20px',
        marginBottom: '24px',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        background: 'linear-gradient(90deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 27, 75, 0.4) 100%)',
      }}
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Title */}
        <div className="flex items-center gap-3">
          <div
            style={{
              padding: '8px',
              borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.2)',
              color: '#818cf8',
            }}
          >
            <Zap size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Live Academic Demo Simulation Control Panel</h3>
            <p className="text-xs text-slate-400">
              One-click failure and vulnerability injection for live examiner demonstrations
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleSimulate('healthy')}
            disabled={loading}
            className={`btn-secondary text-xs ${currentMode === 'healthy' ? 'border-emerald-500/50 text-emerald-300' : ''}`}
            title="Restore service to healthy state"
          >
            <CheckCircle size={14} className="text-emerald-400" />
            Normal (Healthy)
          </button>

          <button
            onClick={() => handleSimulate('unhealthy')}
            disabled={loading}
            className={`btn-secondary text-xs ${currentMode === 'unhealthy' ? 'border-rose-500/50 text-rose-300' : ''}`}
            title="Inject simulated HTTP 500 health failure (Scenario A)"
          >
            <AlertOctagon size={14} className="text-rose-400" />
            Simulate Outage (HTTP 500)
          </button>

          <button
            onClick={() => handleSimulate('high_cpu')}
            disabled={loading}
            className={`btn-secondary text-xs ${currentMode === 'high_cpu' ? 'border-orange-500/50 text-orange-300' : ''}`}
            title="Simulate sustained CPU utilization above 85%"
          >
            <Cpu size={14} className="text-orange-400" />
            <span>High CPU (&gt;85%)</span>
          </button>

          <button
            onClick={() => handleSimulate('high_latency')}
            disabled={loading}
            className={`btn-secondary text-xs ${currentMode === 'high_latency' ? 'border-amber-500/50 text-amber-300' : ''}`}
            title="Simulate elevated service latency (>1000ms)"
          >
            <Clock size={14} className="text-amber-400" />
            <span>High Latency (&gt;1000ms)</span>
          </button>

          <button
            onClick={handleResetConfig}
            disabled={loading}
            className="btn-secondary text-xs border-indigo-500/40 text-indigo-300"
            title="Reset target_infrastructure.yaml for Scenario B Demo"
          >
            <RotateCcw size={14} className="text-indigo-400" />
            Reset Insecure Config
          </button>
        </div>
      </div>

      {feedback && (
        <div
          style={{
            marginTop: '12px',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '0.78rem',
            background: feedback.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${feedback.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            color: feedback.type === 'success' ? '#6ee7b7' : '#fca5a5',
          }}
        >
          {feedback.message}
        </div>
      )}
    </div>
  );
};
