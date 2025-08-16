// Centralized API helper for userpage
export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (typeof window !== 'undefined' && window.__API_BASE_URL__) ||
  'http://localhost:3000';

export const normalizeId = (x) => (x ? { ...x, id: x.id ?? x._id } : x);

function buildDefaultHeaders(extra = {}) {
  const headers = { 'Content-Type': 'application/json', ...extra };
  try {
    // Auto-attach user token if present
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('icsrtToken') : null;
    if (token && !headers.Authorization) headers.Authorization = `Bearer ${token}`;
  } catch {}
  return headers;
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: buildDefaultHeaders(options.headers || {}),
    ...options,
  });
  if (!res.ok) {
    let details = '';
    try { details = await res.text(); } catch {}
    const err = new Error(`${res.status} ${res.statusText} ${details}`.trim());
    err.status = res.status;
    err.body = details;
    throw err;
  }
  const data = await res.json().catch(() => null);
  if (Array.isArray(data)) return data.map(normalizeId);
  if (data && Array.isArray(data.data)) return data.data.map(normalizeId);
  return normalizeId(data);
}

// Safe request that never throws; returns { ok, status, data }
async function requestSafe(path, options = {}) {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      headers: buildDefaultHeaders(options.headers || {}),
      ...options,
    });
    const contentType = res.headers.get('content-type') || '';
    const parseJson = async () => {
      if (contentType.includes('application/json')) {
        return res.json().catch(() => null);
      }
      const text = await res.text().catch(() => '');
      try { return JSON.parse(text); } catch { return { message: text }; }
    };
    const data = await parseJson();
    return { ok: res.ok, status: res.status, data };
  } catch (e) {
    return { ok: false, status: 0, data: { error: 'Network error', message: e?.message || 'Network error' } };
  }
}

export const api = {
  get: (p) => request(p),
  post: (p, body) => request(p, { method: 'POST', body: JSON.stringify(body) }),
  put: (p, body) => request(p, { method: 'PUT', body: JSON.stringify(body) }),
  del: (p) => request(p, { method: 'DELETE' }),
  // Safe variants for auth screens
  getSafe: (p) => requestSafe(p),
  postSafe: (p, body) => requestSafe(p, { method: 'POST', body: JSON.stringify(body) }),
  putSafe: (p, body) => requestSafe(p, { method: 'PUT', body: JSON.stringify(body) }),
  // File upload helpers (multipart/form-data)
  uploadFile: async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    const headers = {};
    try {
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('icsrtToken') : null;
      if (token) headers.Authorization = `Bearer ${token}`;
    } catch {}
    const res = await fetch(`${API_BASE_URL}/api/upload`, { method: 'POST', body: fd, headers });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(txt || 'Upload failed');
    }
    return res.json();
  },
  uploadFileSafe: async (file) => {
    try {
      const data = await api.uploadFile(file);
      return { ok: true, data };
    } catch (e) {
      return { ok: false, data: { error: e?.message || 'Upload failed' } };
    }
  },
};
