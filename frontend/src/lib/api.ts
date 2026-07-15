const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001/api';
export const UPLOADS_BASE = API_BASE.replace(/\/api$/, '');

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('isms_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
}

export async function api<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { ...getAuthHeaders(), ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    if (res.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('isms_token');
      localStorage.removeItem('isms_user');
      window.location.href = '/login';
    }
    const error = await res.text().catch(() => 'Unknown error');
    throw new Error(`API Error ${res.status}: ${error}`);
  }
  return res.json();
}

// Convenience helpers
export const apiGet = <T = any>(endpoint: string) => api<T>(endpoint);
export const apiPost = <T = any>(endpoint: string, data: any) => api<T>(endpoint, { method: 'POST', body: JSON.stringify(data) });
export const apiPut = <T = any>(endpoint: string, data: any) => api<T>(endpoint, { method: 'PUT', body: JSON.stringify(data) });
export const apiDelete = (endpoint: string) => api(endpoint, { method: 'DELETE' });
