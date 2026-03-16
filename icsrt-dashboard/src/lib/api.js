// Centralized API helper with base URL and id normalization
const getApiUrl = () => {
  // Check for environment variable first
  if (process.env.REACT_APP_API_BASE_URL) {
    console.log('📡 Dashboard using API URL from env:', process.env.REACT_APP_API_BASE_URL);
    return process.env.REACT_APP_API_BASE_URL;
  }
  
  // Check for window variable
  if (typeof window !== 'undefined' && window.__API_BASE_URL__) {
    console.log('📡 Dashboard using API URL from window:', window.__API_BASE_URL__);
    return window.__API_BASE_URL__;
  }
  
  // Auto-detect based on hostname
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    console.log('📡 Dashboard detecting API URL for:', hostname);
    
    // Localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      console.log('📡 Localhost detected, using http://localhost:3000');
      return 'http://localhost:3000';
    }

    // IP address (development)
    if (/^192\.168\.\d+\.\d+$/.test(hostname) || /^10\.\d+\.\d+\.\d+$/.test(hostname)) {
      const apiUrl = `${protocol}//${hostname}:3000`;
      console.log('📡 Local IP detected, using:', apiUrl);
      return apiUrl;
    }
    
    // Production: Use same domain (backend on same server with reverse proxy)
    const domainParts = hostname.split('.');
    if (domainParts.length >= 2) {
      const apiUrl = `${protocol}//${hostname}`;
      console.log('📡 Production detected, using same domain:', apiUrl);
      return apiUrl;
    }
  }
  
  // Fallback to localhost
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
    // Auto-attach admin token if present (dashboard)
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('adminToken') : null;
    if (token && !headers.Authorization) headers.Authorization = `Bearer ${token}`;
  } catch {}
  return headers;
}

async function request(path, options = {}) {
  const url = buildUrl(path);
  console.log(`🌐 Dashboard request: ${options.method || 'GET'} ${url}`);
  
  const res = await fetch(url, {
    headers: buildDefaultHeaders(options.headers || {}),
    credentials: 'include', // Always include credentials for CORS
    ...options,
  });
  
  if (!res.ok) {
    let details = '';
    try { details = await res.text(); } catch {}
    console.error(`❌ Dashboard request failed: ${res.status} ${res.statusText}`, details);
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
  const url = buildUrl(path);
  console.log(`🌐 Dashboard JSON request: ${options.method || 'GET'} ${url}`);
  
  const res = await fetch(url, {
    headers: buildDefaultHeaders(options.headers || {}),
    credentials: 'include',
    ...options,
  });
  
  if (!res.ok) {
    let details = '';
    try { details = await res.text(); } catch {}
    console.error(`❌ Dashboard JSON request failed: ${res.status}`, details);
    throw new Error(`${res.status} ${res.statusText} ${details}`.trim());
  }
  
  return res.json();
}

export const api = {
  // Standard methods - auto-add /api prefix
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  del: (path) => request(path, { method: 'DELETE' }),
  
  // Raw JSON variants - preserve full response (e.g., pagination metadata)
  getJson: (path) => requestJson(path),
  postJson: (path, body) => requestJson(path, { method: 'POST', body: JSON.stringify(body) }),
  putJson: (path, body) => requestJson(path, { method: 'PUT', body: JSON.stringify(body) }),
  patchJson: (path, body) => requestJson(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delJson: (path) => requestJson(path, { method: 'DELETE' }),
  
  // FormData POST (for file uploads in dashboard)
  postFormData: async (path, formData) => {
    const url = buildUrl(path);
    const headers = {};
    
    try {
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('adminToken') : null;
      if (token) headers.Authorization = `Bearer ${token}`;
    } catch {}
    
    console.log(`🌐 Dashboard FormData POST: ${url}`);
    
    const res = await fetch(url, { 
      method: 'POST', 
      body: formData, 
      headers,
      credentials: 'include'
    });
    
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      console.error(`❌ Dashboard FormData POST failed: ${res.status}`, txt);
      throw new Error(txt || 'Request failed');
    }
    
    return res.json();
  },
};
