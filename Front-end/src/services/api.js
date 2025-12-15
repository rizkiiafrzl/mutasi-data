const DEFAULT_BASE_URL = 'http://localhost:5000';

const API_BASE_URL = normalizeBaseUrl(import.meta.env?.VITE_API_BASE_URL || DEFAULT_BASE_URL);

function normalizeBaseUrl(baseUrl) {
  if (!baseUrl) return DEFAULT_BASE_URL;
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}

async function httpRequest(path, { method = 'GET', body, headers = {} } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const responseText = await response.text();
  const payload = responseText ? safeJsonParse(responseText) : null;

  if (!response.ok) {
    const message = payload?.error || payload?.message || `Request gagal (${response.status})`;
    throw new Error(message);
  }

  return payload;
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function buildQuery(params = {}) {
  const definedEntries = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '');
  if (!definedEntries.length) return '';
  const query = new URLSearchParams(definedEntries);
  return `?${query.toString()}`;
}

function convertPeriodeToKey(periode) {
  if (!periode) return '';
  if (periode.includes('/')) {
    const [month, year] = periode.split('/');
    return `${year}-${month.padStart(2, '0')}`;
  }
  return periode;
}

export const api = {
  getDashboardSummary() {
    return httpRequest('/api/dashboard/summary');
  },

  getDashboardHistory(page = 1, perPage = 10, status = 'all', forceReload = false) {
    const query = buildQuery({ page, perPage, status, forceReload });
    return httpRequest(`/api/dashboard/history${query}`);
  },

  createNewReport() {
    return httpRequest('/api/reports', { method: 'POST' });
  },

  deleteReport(periode) {
    if (!periode) throw new Error('Periode laporan wajib diisi');
    const periodeKey = convertPeriodeToKey(periode);
    return httpRequest(`/api/reports/${encodeURIComponent(periodeKey)}`, { method: 'DELETE' });
  },

  getReportByPeriode(periode, _forceReload = false) {
    if (!periode) throw new Error('Periode laporan wajib diisi');
    const periodeKey = convertPeriodeToKey(periode);
    return httpRequest(`/api/reports/${encodeURIComponent(periodeKey)}`);
  },

  getReportWorkers(periode, page = 1, perPage = 10, search = '', status = 'all') {
    if (!periode) throw new Error('Periode laporan wajib diisi');
    const periodeKey = convertPeriodeToKey(periode);
    const query = buildQuery({ page, perPage, search, status });
    return httpRequest(`/api/reports/${encodeURIComponent(periodeKey)}/workers${query}`);
  },

  finalizeReport(periode, checklist = {}) {
    if (!periode) throw new Error('Periode laporan wajib diisi');
    const periodeKey = convertPeriodeToKey(periode);
    return httpRequest(`/api/reports/${encodeURIComponent(periodeKey)}/finalize`, {
      method: 'POST',
      body: { checklist },
    });
  },

  getCurrentPeriod() {
    return httpRequest('/api/reports/current').then((res) => res?.currentPeriod || null);
  },

  addWorkerToReport(periode, payload) {
    if (!periode) throw new Error('Periode laporan wajib diisi');
    const periodeKey = convertPeriodeToKey(periode);
    return httpRequest(`/api/reports/${encodeURIComponent(periodeKey)}/workers`, {
      method: 'POST',
      body: payload,
    });
  },

  getWorkerOptions() {
    return httpRequest('/api/workers/options');
  },

  getWorkers(filters = {}) {
    const query = buildQuery(filters);
    return httpRequest(`/api/workers${query}`);
  },

  getUploadOptions() {
    return httpRequest('/api/uploads/options');
  },

  getUploadHistory(page = 1, perPage = 10) {
    const query = buildQuery({ page, perPage });
    return httpRequest(`/api/uploads/history${query}`);
  },

  integrateUploadData(payload, periode) {
    if (!payload?.uploadType) {
      throw new Error('uploadType wajib diisi');
    }
    const body = {
      ...payload,
      periode: periode ? convertPeriodeToKey(periode) : payload.periode,
    };
    return httpRequest('/api/uploads', {
      method: 'POST',
      body,
    });
  },
};

