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
   * 1. import.meta.env.VITE_PUBLIC_APP_URL (Configurable production domain in Vercel)
   * 2. window.location.origin (Actual deployed application origin at runtime)
   * 3. Fallback production placeholder
   */
  getBaseUrl() {
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_PUBLIC_APP_URL) {
      const envUrl = import.meta.env.VITE_PUBLIC_APP_URL.trim().replace(/\/$/, '');
      if (envUrl) return envUrl;
    }
    if (typeof window !== 'undefined' && window.location?.origin) {
      const origin = window.location.origin.trim().replace(/\/$/, '');
      if (origin) return origin;
    }
    return 'https://the-wall.vercel.app';
  },

  getPublicTraceUrl(traceabilityId) {
    const base = this.getBaseUrl();
    return `${base}/trace/${encodeURIComponent(traceabilityId)}`;
  },
};
