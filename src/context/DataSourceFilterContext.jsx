import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { FILTER_MODES, DATA_SOURCES, classifyRecord } from '../constants/dataSourceTypes';

const DataSourceFilterContext = createContext(null);

export function DataSourceFilterProvider({ children }) {
  const [filterMode, setFilterMode] = useState(FILTER_MODES.ALL);

  const filterRecords = useCallback((records = [], domain, overrideMode = null) => {
    const activeMode = overrideMode || filterMode;
    if (!Array.isArray(records)) return [];
    if (activeMode === FILTER_MODES.ALL) return records;

    return records.filter((item) => {
      const classification = classifyRecord(item, domain);
      if (activeMode === FILTER_MODES.REAL) {
        return classification === DATA_SOURCES.REAL;
      }
      if (activeMode === FILTER_MODES.DEMO) {
        return classification === DATA_SOURCES.DEMO;
      }
      return true;
    });
  }, [filterMode]);

  const value = useMemo(() => ({
    filterMode,
    setFilterMode,
    isRealOnly: filterMode === FILTER_MODES.REAL,
    isDemoOnly: filterMode === FILTER_MODES.DEMO,
    isAll: filterMode === FILTER_MODES.ALL,
    classify: classifyRecord,
    filterRecords,
  }), [filterMode, filterRecords]);

  return (
    <DataSourceFilterContext.Provider value={value}>
      {children}
    </DataSourceFilterContext.Provider>
  );
}

export function useDataSourceFilter() {
  const ctx = useContext(DataSourceFilterContext);
  if (!ctx) {
    // Graceful fallback if invoked outside provider
    return {
      filterMode: FILTER_MODES.ALL,
      setFilterMode: () => {},
      isRealOnly: false,
      isDemoOnly: false,
      isAll: true,
      classify: classifyRecord,
      filterRecords: (items) => items || [],
    };
  }
  return ctx;
}
