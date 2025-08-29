const TOKEN_KEY = 'xoroj.jwt';

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// Wrapper that auto-attaches Authorization: Bearer <token> for /api/** calls
export async function apiFetch(url, options = {}) {
  const headers = new Headers(options.headers || { 'Content-Type': 'application/json' });

  const needsAuth = options.auth ?? url.startsWith('/api/');
  const token = getToken();
  if (needsAuth && token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    clearToken();
    window.location.href = '/login?reason=unauthorized';
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : res.text();
}
