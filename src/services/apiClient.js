/**
 * API Client for Express backend integration
 */
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  '/api';

async function handleResponse(response, endpoint) {
  if (!response.ok) {
    let errorDetail = `API Error: ${response.status} ${response.statusText}`;
    try {
      const errorJson = await response.json();
      if (errorJson && (errorJson.error || errorJson.message)) {
        errorDetail =
          typeof errorJson.error === 'string'
            ? errorJson.error
            : errorJson.error?.message || errorJson.message;
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(errorDetail);
  }
  return await response.json();
}

export const apiClient = {
  baseUrl: BASE_URL,

  async get(endpoint, options = {}) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });
      return await handleResponse(response, endpoint);
    } catch (error) {
      console.warn(`[apiClient] GET ${endpoint} failed:`, error.message);
      throw error;
    }
  },

  async post(endpoint, data, options = {}) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: JSON.stringify(data),
        ...options,
      });
      return await handleResponse(response, endpoint);
    } catch (error) {
      console.warn(`[apiClient] POST ${endpoint} failed:`, error.message);
      throw error;
    }
  },

  async patch(endpoint, data, options = {}) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: JSON.stringify(data),
        ...options,
      });
      return await handleResponse(response, endpoint);
    } catch (error) {
      console.warn(`[apiClient] PATCH ${endpoint} failed:`, error.message);
      throw error;
    }
  },
};
