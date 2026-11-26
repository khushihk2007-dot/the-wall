import { DEFAULT_QUALITY_CRITERIA } from '../constants/qualityCriteria';

const CRITERIA_STORAGE_KEY = 'thewall_qc_criteria_versions_v1';
const ACTIVE_VERSION_KEY = 'thewall_qc_criteria_active_version_v1';

/**
 * Service to manage versioned quality grading criteria and thresholds.
 * Preserves historical criteria versions so historical test evaluations remain unaltered.
 */
export const criteriaService = {
  /**
   * Retrieves all criteria versions stored locally (or defaults)
   */
  getAllVersions() {
    try {
      const stored = localStorage.getItem(CRITERIA_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return [DEFAULT_QUALITY_CRITERIA];
  },

  /**
   * Retrieves the currently active criteria configuration
   */
  getActiveCriteria() {
    try {
      const activeVersion = localStorage.getItem(ACTIVE_VERSION_KEY) || DEFAULT_QUALITY_CRITERIA.version;
      const all = this.getAllVersions();
      const match = all.find((c) => c.version === activeVersion);
      if (match) return match;
    } catch {
      // Fallback
    }
    return DEFAULT_QUALITY_CRITERIA;
  },

  /**
   * Retrieves a specific criteria configuration by version string
   */
  getCriteriaByVersion(version) {
    if (!version) return this.getActiveCriteria();
    const all = this.getAllVersions();
    const match = all.find((c) => c.version === version);
    return match || this.getActiveCriteria();
  },

  /**
   * Saves updated criteria or a new criteria version.
   * Authorized administrators can adjust thresholds and toggle validation status.
   */
  saveCriteria(criteriaData, setAsActive = true) {
    const all = this.getAllVersions();
    const index = all.findIndex((c) => c.version === criteriaData.version);

    let updatedList;
    if (index >= 0) {
      updatedList = [...all];
      updatedList[index] = { ...criteriaData, lastUpdated: new Date().toISOString().split('T')[0] };
    } else {
      updatedList = [criteriaData, ...all];
    }

    try {
      localStorage.setItem(CRITERIA_STORAGE_KEY, JSON.stringify(updatedList));
      if (setAsActive) {
        localStorage.setItem(ACTIVE_VERSION_KEY, criteriaData.version);
      }
    } catch (e) {
      console.warn('Failed to save criteria to localStorage:', e);
    }

    return { criteria: criteriaData, all: updatedList };
  },

  /**
   * Sets a specific criteria version as active for subsequent testing
   */
  setActiveVersion(version) {
    try {
      localStorage.setItem(ACTIVE_VERSION_KEY, version);
    } catch (e) {
      console.warn('Failed to set active criteria version:', e);
    }
  },

  /**
   * Resets criteria back to the baseline default configuration
   */
  resetToDefault() {
    try {
      localStorage.removeItem(CRITERIA_STORAGE_KEY);
      localStorage.removeItem(ACTIVE_VERSION_KEY);
    } catch {
      // ignore
    }
    return DEFAULT_QUALITY_CRITERIA;
  },
};
