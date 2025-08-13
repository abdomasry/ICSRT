// Centralized API helper with base URL and id normalization
export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (typeof window !== 'undefined' && window.__API_BASE_URL__) ||
  'http://localhost:3000';

export const normalizeId = (x) => (x ? { ...x, id: x.id ?? x._id } : x);

function buildDefaultHeaders(extra = {}) {
  const headers = { 'Content-Type': 'application/json', ...extra };
  try {
    // Auto-attach admin token if present (dashboard)
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('adminToken') : null;
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
    throw new Error(`${res.status} ${res.statusText} ${details}`.trim());
  }
  const data = await res.json().catch(() => null);
  if (Array.isArray(data)) return data.map(normalizeId);
  // also support { success, data } shape
  if (data && Array.isArray(data.data)) return data.data.map(normalizeId);
  return normalizeId(data);
}

// Raw JSON request that preserves the original response shape (useful for pagination metadata)
async function requestJson(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: buildDefaultHeaders(options.headers || {}),
    ...options,
  });
  if (!res.ok) {
    let details = '';
    try { details = await res.text(); } catch {}
    throw new Error(`${res.status} ${res.statusText} ${details}`.trim());
  }
  return res.json();
}

export const api = {
  get: (p) => request(p),
  post: (p, body) => request(p, { method: 'POST', body: JSON.stringify(body) }),
  put: (p, body) => request(p, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (p, body) => request(p, { method: 'PATCH', body: JSON.stringify(body) }),
  del: (p) => request(p, { method: 'DELETE' }),
  // Use getJson/postJson/etc. when you need the raw response (e.g., pagination metadata)
  getJson: (p) => requestJson(p),
  postJson: (p, body) => requestJson(p, { method: 'POST', body: JSON.stringify(body) }),
  putJson: (p, body) => requestJson(p, { method: 'PUT', body: JSON.stringify(body) }),
  patchJson: (p, body) => requestJson(p, { method: 'PATCH', body: JSON.stringify(body) }),
  delJson: (p) => requestJson(p, { method: 'DELETE' }),
};
