import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Attach JWT token to requests if present
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cloudshield_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token on authentication failure
      localStorage.removeItem('cloudshield_token');
      localStorage.removeItem('cloudshield_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Service API Modules
export const authApi = {
  login: async (email, password) => {
    const res = await apiClient.post('/api/auth/login', { email, password });
    return res.data;
  },
  register: async (email, password, role = 'operator') => {
    const res = await apiClient.post('/api/auth/register', { email, password, role });
    return res.data;
  },
  getMe: async () => {
    const res = await apiClient.get('/api/auth/me');
    return res.data;
  },
};

export const monitoringApi = {
  getSummary: async () => {
    const res = await apiClient.get('/api/monitoring/summary');
    return res.data;
  },
  collect: async () => {
    const res = await apiClient.post('/api/monitoring/collect');
    return res.data;
  },
  simulate: async (mode) => {
    const res = await apiClient.post('/api/monitoring/simulate', { mode });
    return res.data;
  },
};

export const resourcesApi = {
  list: async (status) => {
    const params = status ? { status } : {};
    const res = await apiClient.get('/api/resources', { params });
    return res.data;
  },
};

export const findingsApi = {
  list: async (status, severity) => {
    const params = {};
    if (status) params.status = status;
    if (severity) params.severity = severity;
    const res = await apiClient.get('/api/findings', { params });
    return res.data;
  },
  scan: async (targetFile) => {
    const res = await apiClient.post('/api/findings/scan', targetFile ? { target_file: targetFile } : {});
    return res.data;
  },
  resetSample: async () => {
    const res = await apiClient.post('/api/findings/reset-sample');
    return res.data;
  },
  requestRemediation: async (findingId, actionType, notes) => {
    const res = await apiClient.post(`/api/findings/${findingId}/remediation-requests`, {
      action_type: actionType,
      notes,
    });
    return res.data;
  },
};

export const scannerApi = {
  triggerScan: (targetFile) => findingsApi.scan(targetFile),
  getFindings: (status, severity) => findingsApi.list(status, severity),
};


export const incidentsApi = {
  list: async (status, severity) => {
    const params = {};
    if (status) params.status = status;
    if (severity) params.severity = severity;
    const res = await apiClient.get('/api/incidents', { params });
    return res.data;
  },
  acknowledge: async (incidentId) => {
    const res = await apiClient.post(`/api/incidents/${incidentId}/acknowledge`, { status: 'acknowledged' });
    return res.data;
  },
  requestRemediation: async (incidentId, actionType, notes) => {
    const res = await apiClient.post(`/api/incidents/${incidentId}/remediation-requests`, {
      action_type: actionType,
      notes,
    });
    return res.data;
  },
};

export const remediationApi = {
  list: async (status) => {
    const params = status ? { status } : {};
    const res = await apiClient.get('/api/remediation', { params });
    return res.data;
  },
  approve: async (jobId, approved = true, comment = '') => {
    const res = await apiClient.post(`/api/remediation/${jobId}/approve`, { approved, comment });
    return res.data;
  },
  execute: async (jobId) => {
    const res = await apiClient.post(`/api/remediation/${jobId}/execute`);
    return res.data;
  },
};

export const auditApi = {
  list: async (action, result) => {
    const params = {};
    if (action) params.action = action;
    if (result) params.result = result;
    const res = await apiClient.get('/api/audit-logs', { params });
    return res.data;
  },
};
