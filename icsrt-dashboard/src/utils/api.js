// Utility functions for API calls - No authentication required
import { API_BASE_URL } from '../lib/api';
export const getAuthHeaders = () => {
  return {
    'Content-Type': 'application/json'
  };
};

export const apiCall = async (url, options = {}) => {
  const defaultOptions = {
    headers: getAuthHeaders(),
    ...options
  };

  // Merge headers if options.headers exists
  if (options.headers) {
    defaultOptions.headers = { ...defaultOptions.headers, ...options.headers };
  }

  try {
    const response = await fetch(url, defaultOptions);
    return response;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

export const apiGet = (url) => apiCall(url, { method: 'GET' });
export const apiPost = (url, data) => apiCall(url, { method: 'POST', body: JSON.stringify(data) });
export const apiPut = (url, data) => apiCall(url, { method: 'PUT', body: JSON.stringify(data) });
export const apiDelete = (url) => apiCall(url, { method: 'DELETE' });

// Multipart upload helper (no JSON headers)
export const apiUpload = async (url, file) => {
  // Allow passing path like '/api/upload' and auto-prefix with API_BASE_URL
  const fullUrl = /^https?:\/\//i.test(url) ? url : `${API_BASE_URL}${url}`;
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(fullUrl, {
    method: 'POST',
    body: formData,
    // Let browser set Content-Type with boundary
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Upload failed');
  }
  return res.json();
};

// No permission system - always return true
export const hasPermission = (permission) => true;

// Component wrapper for permission checking - no restrictions
export const withPermissionCheck = (Component, requiredPermission) => {
  return (props) => {
    return <Component {...props} />;
  };
};
