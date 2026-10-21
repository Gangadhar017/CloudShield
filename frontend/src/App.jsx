import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { MonitoringPage } from './pages/MonitoringPage';
import { SecurityPosturePage } from './pages/SecurityPosturePage';
import { IncidentsPage } from './pages/IncidentsPage';
import { RemediationPage } from './pages/RemediationPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

const ProtectedLayout = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div className="text-center font-mono space-y-2">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin mx-auto"></div>
          <p className="text-cyan-400 text-xs">Attesting Secure Enclave Session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, overflowY: 'auto', background: 'transparent' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ProtectedLayout><DashboardPage /></ProtectedLayout>} />
            <Route path="/resources" element={<ProtectedLayout><ResourcesPage /></ProtectedLayout>} />
            <Route path="/monitoring" element={<ProtectedLayout><MonitoringPage /></ProtectedLayout>} />
            <Route path="/security" element={<ProtectedLayout><SecurityPosturePage /></ProtectedLayout>} />
            <Route path="/findings" element={<ProtectedLayout><SecurityPosturePage /></ProtectedLayout>} />
            <Route path="/incidents" element={<ProtectedLayout><IncidentsPage /></ProtectedLayout>} />
            <Route path="/remediation" element={<ProtectedLayout><RemediationPage /></ProtectedLayout>} />
            <Route path="/audit" element={<ProtectedLayout><AuditLogsPage /></ProtectedLayout>} />
            <Route path="/audit-logs" element={<ProtectedLayout><AuditLogsPage /></ProtectedLayout>} />
            <Route path="/reports" element={<ProtectedLayout><ReportsPage /></ProtectedLayout>} />
            <Route path="/settings" element={<ProtectedLayout><SettingsPage /></ProtectedLayout>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};


export default App;
