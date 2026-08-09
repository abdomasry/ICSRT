declare global {
  interface Window {
    __API_BASE_URL__?: string;
  }
}

const getApiUrl = (): string => {
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  
  if (typeof window !== 'undefined' && window.__API_BASE_URL__) {
    return window.__API_BASE_URL__;
  }
  
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3000';
    }

    if (/^192\.168\.\d+\.\d+$/.test(hostname) || /^10\.\d+\.\d+\.\d+$/.test(hostname)) {
      return `${protocol}//${hostname}:3000`;
    }
    
    const domainParts = hostname.split('.');
    if (domainParts.length >= 2) {
      return `${protocol}//${hostname}`;
    }
  }
  
  return 'http://localhost:3000';
};

export const API_BASE_URL = getApiUrl();

export const normalizeId = (x: any): any => (x ? { ...x, id: x.id ?? x._id } : x);

const buildUrl = (path: string): string => {
  let base = API_BASE_URL.replace(/\/+$/, "");
  let p = String(path || "").trim().replace(/^\/+/, "");

  if (base.endsWith("/api"))
    return `${base}/${p}`;

  if (p.startsWith("api/"))
    return `${base}/${p}`;

  return `${base}/api/${p}`;
};

function buildDefaultHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...extra };
  try {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('adminToken') : null;
    if (token && !headers.Authorization) headers.Authorization = `Bearer ${token}`;
  } catch {}
  return headers;
}

async function request(path: string, options: RequestInit = {}): Promise<any> {
  const url = buildUrl(path);
  console.log(`🌐 Dashboard request: ${options.method || 'GET'} ${url}`);
  
  const res = await fetch(url, {
    headers: buildDefaultHeaders(options.headers as Record<string, string> || {}),
    credentials: 'include',
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
  if (data && Array.isArray(data.data)) return data.data.map(normalizeId);
  return normalizeId(data);
}

async function requestJson(path: string, options: RequestInit = {}): Promise<any> {
  const url = buildUrl(path);
  console.log(`🌐 Dashboard JSON request: ${options.method || 'GET'} ${url}`);
  
  const res = await fetch(url, {
    headers: buildDefaultHeaders(options.headers as Record<string, string> || {}),
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
  get: (path: string) => request(path),
  post: (path: string, body?: any) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path: string, body?: any) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (path: string, body?: any) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  del: (path: string) => request(path, { method: 'DELETE' }),
  
  getJson: (path: string) => requestJson(path),
  postJson: (path: string, body?: any) => requestJson(path, { method: 'POST', body: JSON.stringify(body) }),
  putJson: (path: string, body?: any) => requestJson(path, { method: 'PUT', body: JSON.stringify(body) }),
  patchJson: (path: string, body?: any) => requestJson(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delJson: (path: string) => requestJson(path, { method: 'DELETE' }),
  
  postFormData: async (path: string, formData: FormData) => {
    const url = buildUrl(path);
    const headers: Record<string, string> = {};
    
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

export default api;
