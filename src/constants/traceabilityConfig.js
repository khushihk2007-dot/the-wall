/**
 * Centralized Traceability Configuration - The Wall
 * Provides stable base URL resolution and QR metadata
 */

export const TRACEABILITY_CONFIG = {
  appBrand: 'The Wall',
  productName: 'Smart Biodegradable Agricultural Growing Bed',
  version: '1.0-TRACE',
  defaultQrSize: 220,
  labelPrintWidth: 320,

  /**
   * Resolves the public base URL dynamically.
   * Priority:
   * 1. import.meta.env.VITE_PUBLIC_APP_URL
   * 2. window.location.origin
   * 3. fallback 'http://localhost:5173'
   */
  getBaseUrl() {
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_PUBLIC_APP_URL) {
      return import.meta.env.VITE_PUBLIC_APP_URL.replace(/\/$/, '');
    }
    if (typeof window !== 'undefined' && window.location?.origin) {
      return window.location.origin.replace(/\/$/, '');
    }
    return 'http://localhost:5173';
  },

  getPublicTraceUrl(traceabilityId) {
    const base = this.getBaseUrl();
    return `${base}/trace/${encodeURIComponent(traceabilityId)}`;
  },
};
