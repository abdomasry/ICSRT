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
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('icsrtToken') : null;
    if (token && !headers.Authorization) headers.Authorization = `Bearer ${token}`;
  } catch {}
  return headers;
}

async function request(path: string, options: RequestInit = {}): Promise<any> {
  const url = buildUrl(path);
  console.log(`🌐 Request: ${options.method || 'GET'} ${url}`);
  
  const res = await fetch(url, {
    headers: buildDefaultHeaders(options.headers as Record<string, string> || {}),
    credentials: 'include',
    ...options,
  });
  
  if (!res.ok) {
    let details = '';
    try { details = await res.text(); } catch {}
    console.error(`❌ Request failed: ${res.status} ${res.statusText}`, details);
    const err: any = new Error(`${res.status} ${res.statusText} ${details}`.trim());
    err.status = res.status;
    err.body = details;
    throw err;
  }
  
  const data = await res.json().catch(() => null);
  if (Array.isArray(data)) return data.map(normalizeId);
  if (data && Array.isArray(data.data)) return data.data.map(normalizeId);
  return normalizeId(data);
}

export interface SafeResponse<T = any> {
  ok: boolean;
  status: number;
  data: T;
}

async function requestSafe<T = any>(path: string, options: RequestInit = {}): Promise<SafeResponse<T>> {
  try {
    const url = buildUrl(path);
    console.log(`🌐 Safe request: ${options.method || 'GET'} ${url}`);
    
    const res = await fetch(url, {
      headers: buildDefaultHeaders(options.headers as Record<string, string> || {}),
      credentials: 'include',
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
  } catch (e: any) {
    console.error('❌ Network error in requestSafe:', e);
    return { ok: false, status: 0, data: { error: 'Network error', message: e?.message || 'Network error' } as any };
  }
}

export const api = {
  get: (path: string) => request(path),
  post: (path: string, body?: any) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path: string, body?: any) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (path: string, body?: any) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  del: (path: string) => request(path, { method: 'DELETE' }),
  
  getSafe: <T = any>(path: string) => requestSafe<T>(path),
  postSafe: <T = any>(path: string, body?: any) => requestSafe<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  putSafe: <T = any>(path: string, body?: any) => requestSafe<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patchSafe: <T = any>(path: string, body?: any) => requestSafe<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delSafe: <T = any>(path: string) => requestSafe<T>(path, { method: 'DELETE' }),
  
  postFormData: async (path: string, formData: FormData) => {
    const url = buildUrl(path);
    const headers: Record<string, string> = {};
    
    try {
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('icsrtToken') : null;
      if (token) headers.Authorization = `Bearer ${token}`;
    } catch {}
    
    console.log(`🌐 FormData POST: ${url}`);
    
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
  
  uploadFile: async (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.postFormData('/upload', fd);
  },
  
  uploadFileSafe: async (file: File) => {
    try {
      const data = await api.uploadFile(file);
      return { ok: true, data };
    } catch (e: any) {
      console.error('❌ File upload error:', e);
      return { ok: false, data: { error: e?.message || 'Upload failed' } };
    }
  },
};

export default api;
