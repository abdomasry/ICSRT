// Centralized API helper for userpage
const getApiUrl = () => {
  // 1. Check for environment variable first (highest priority)
  if (process.env.REACT_APP_API_BASE_URL) {
    console.log('📡 Using API URL from env:', process.env.REACT_APP_API_BASE_URL);
    return process.env.REACT_APP_API_BASE_URL;
  }
  
  // 2. Check for window variable (for runtime config)
  if (typeof window !== 'undefined' && window.__API_BASE_URL__) {
    console.log('📡 Using API URL from window:', window.__API_BASE_URL__);
    return window.__API_BASE_URL__;
  }
  
  // 3. Auto-detect based on hostname
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    console.log('📡 Detecting API URL for hostname:', hostname);
    
    // Localhost variations
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      console.log('📡 Localhost detected, using http://localhost:3000');
      return 'http://localhost:3000';
    }

    // IP address (development)
    if (/^192\.168\.\d+\.\d+$/.test(hostname) || /^10\.\d+\.\d+\.\d+$/.test(hostname)) {
      console.log('📡 Local IP detected, using same host with port 3000');
      return `${protocol}//${hostname}:3000`;
    }
    
    // Production: Use same domain (backend on same server with reverse proxy)
    // Backend will be accessible at domain.com/api/* via nginx/apache
    const domainParts = hostname.split('.');
    if (domainParts.length >= 2) {
      const apiUrl = `${protocol}//${hostname}`;
      console.log('📡 Production detected, using same domain:', apiUrl);
      return apiUrl;
    }
  }
  
  // 4. Fallback to localhost
  console.log('📡 Using fallback API URL: http://localhost:3000');
  return 'http://localhost:3000';
};

export const API_BASE_URL = getApiUrl();

export const normalizeId = (x) => (x ? { ...x, id: x.id ?? x._id } : x);

// Build URL with proper path handling
const buildUrl = (path) => {
  let base = API_BASE_URL.replace(/\/+$/, "");      // remove trailing slash
  let p = String(path || "").trim().replace(/^\/+/, ""); // remove leading slash

  // If API_BASE_URL already ends with /api → DO NOT add /api again
  if (base.endsWith("/api"))
    return `${base}/${p}`;

  // If path already starts with api/ → DON'T double prefix
  if (p.startsWith("api/"))
    return `${base}/${p}`;

  // Default: add /api prefix
  return `${base}/api/${p}`;
};


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
  const url = buildUrl(path);
  console.log(`🌐 Request: ${options.method || 'GET'} ${url}`);
  
  const res = await fetch(url, {
    headers: buildDefaultHeaders(options.headers || {}),
    credentials: 'include', // Always include credentials for CORS
    ...options,
  });
  
  if (!res.ok) {
    let details = '';
    try { details = await res.text(); } catch {}
    console.error(`❌ Request failed: ${res.status} ${res.statusText}`, details);
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
    const url = buildUrl(path);
    console.log(`🌐 Safe request: ${options.method || 'GET'} ${url}`);
    
    const res = await fetch(url, {
      headers: buildDefaultHeaders(options.headers || {}),
      credentials: 'include',  // Include credentials for CORS
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
    
    if (!res.ok) {
      console.error(`❌ Safe request failed: ${res.status}`, data);
    }
    
    return { ok: res.ok, status: res.status, data };
  } catch (e) {
    console.error('❌ Network error in requestSafe:', e);
    return { ok: false, status: 0, data: { error: 'Network error', message: e?.message || 'Network error' } };
  }
}

export const api = {
  // Standard methods - auto-add /api prefix
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  del: (path) => request(path, { method: 'DELETE' }),
  
  // Safe variants - never throw errors
  getSafe: (path) => requestSafe(path),
  postSafe: (path, body) => requestSafe(path, { method: 'POST', body: JSON.stringify(body) }),
  putSafe: (path, body) => requestSafe(path, { method: 'PUT', body: JSON.stringify(body) }),
  patchSafe: (path, body) => requestSafe(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delSafe: (path) => requestSafe(path, { method: 'DELETE' }),
  
  // FormData POST (for file uploads)
  postFormData: async (path, formData) => {
    const url = buildUrl(path);
    const headers = {};
    
    try {
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('icsrtToken') : null;
      if (token) headers.Authorization = `Bearer ${token}`;
    } catch {}
    
    console.log(`🌐 FormData POST: ${url}`);
    
    // Don't set Content-Type for FormData - browser sets it with boundary
    const res = await fetch(url, { 
      method: 'POST', 
      body: formData, 
      headers,
      credentials: 'include'
    });
    
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      console.error(`❌ FormData POST failed: ${res.status}`, txt);
      throw new Error(txt || 'Request failed');
    }
    
    return res.json();
  },
  
  // File upload helper
  uploadFile: async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.postFormData('/upload', fd);
  },
  
  uploadFileSafe: async (file) => {
    try {
      const data = await api.uploadFile(file);
      return { ok: true, data };
    } catch (e) {
      console.error('❌ File upload error:', e);
      return { ok: false, data: { error: e?.message || 'Upload failed' } };
    }
  },
};
