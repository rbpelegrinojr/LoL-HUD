(function () {
  let cachedCsrfToken = null;

  async function getCsrfToken(forceRefresh) {
    if (cachedCsrfToken && !forceRefresh) {
      return cachedCsrfToken;
    }
    const response = await fetch('/api/csrf-token', { credentials: 'same-origin' });
    if (!response.ok) {
      throw new Error('Unable to obtain CSRF token');
    }
    const data = await response.json();
    cachedCsrfToken = data.csrfToken;
    return cachedCsrfToken;
  }

  async function apiFetch(url, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const headers = { ...(options.headers || {}) };
    let { body } = options;

    if (body && !(body instanceof FormData) && typeof body !== 'string') {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(body);
    }

    if (method !== 'GET' && method !== 'HEAD') {
      headers['x-csrf-token'] = await getCsrfToken();
    }

    let response = await fetch(url, { ...options, method, headers, body, credentials: 'same-origin' });

    if (response.status === 403 && method !== 'GET' && method !== 'HEAD') {
      headers['x-csrf-token'] = await getCsrfToken(true);
      response = await fetch(url, { ...options, method, headers, body, credentials: 'same-origin' });
    }

    return response;
  }

  window.apiClient = { apiFetch, getCsrfToken };
})();
