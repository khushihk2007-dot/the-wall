import { apiClient } from './apiClient';

/**
 * In-memory cache of batches to support dependent modules that read synchronously
 * without blocking UI rendering prior to API responses.
 */
let inMemoryBatches = [];
let fetchPromise = null;

// Eagerly prefetch batches in the background on module import
apiClient
  .get('/manufacturing/batches')
  .then((res) => {
    if (res && res.data) {
      inMemoryBatches = res.data;
    }
  })
  .catch(() => {
    // Keep empty array until explicit getBatches() is invoked
  });

/**
 * Service to manage manufacturing batches via the Express backend API
 */
export const manufacturingService = {
  /**
   * Synchronous accessor for in-memory batch cache.
   * If cache is empty, automatically triggers a background fetch.
   */
  getCachedBatches() {
    if (inMemoryBatches.length === 0 && !fetchPromise) {
      this.getBatches().catch(() => {});
    }
    return inMemoryBatches;
  },

  /**
   * Fetches all manufacturing batches from Express backend / Supabase.
   * De-duplicates in-flight requests.
   * @returns {Promise<Array>} Array of batches formatted for the frontend
   */
  async getBatches() {
    if (fetchPromise) {
      return fetchPromise;
    }

    fetchPromise = apiClient
      .get('/manufacturing/batches')
      .then((response) => {
        const batches = response.data || [];
        inMemoryBatches = batches;
        return batches;
      })
      .finally(() => {
        fetchPromise = null;
      });

    return fetchPromise;
  },

  /**
   * Fetches a single manufacturing batch by business ID (e.g. TW-2026-B001)
   * @param {string} batchId
   * @returns {Promise<Object>} The batch object including history
   */
  async getBatchById(batchId) {
    const response = await apiClient.get(`/manufacturing/batches/${encodeURIComponent(batchId)}`);
    return response.data;
  },

  /**
   * Creates a new manufacturing batch in Supabase via Express backend.
   * Batch ID is generated strictly on the backend.
   * @param {Object} data - Form data from CreateBatchModal
   * @returns {Promise<{ batch: Object, all: Array }>} The newly created batch and updated batch list
   */
  async createBatch(data) {
    const payload = {
      quantity: Number(data.quantity) || 100,
      cottonKg: Number(data.cottonKg) || 0,
      coirKg: Number(data.coirKg) || 0,
      mediumKg: Number(data.mediumKg) || 0,
      binder: data.binder || 'Organic starch binder (2.0 kg)',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      notes: data.notes || '',
    };

    const response = await apiClient.post('/manufacturing/batches', payload);
    const newBatch = response.batch || response.data || response;

    inMemoryBatches = [newBatch, ...inMemoryBatches.filter((b) => b && b.id !== newBatch.id)];
    return { batch: newBatch, all: inMemoryBatches };
  },

  /**
   * Advances a batch to its next sequential stage.
   * @param {string} batchId
   * @param {string} customNote
   * @returns {Promise<{ batch: Object, all: Array }>} The updated batch and updated batch list
   */
  async advanceStage(batchId, customNote) {
    const response = await apiClient.patch(`/manufacturing/batches/${encodeURIComponent(batchId)}/stage`, {
      note: customNote,
    });
    const updatedBatch = response.batch || response.data || response;

    inMemoryBatches = inMemoryBatches.map((b) => (b && b.id === batchId ? updatedBatch : b));
    return { batch: updatedBatch, all: inMemoryBatches };
  },

  /**
   * Calculates estimated completion date (6-day cycle)
   */
  calculateExpectedCompletion(startDateStr) {
    try {
      const d = startDateStr ? new Date(startDateStr) : new Date();
      d.setDate(d.getDate() + 6);
      return d.toISOString().split('T')[0];
    } catch {
      return '2026-12-01';
    }
  },
};
