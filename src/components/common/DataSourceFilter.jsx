import React from 'react';
import { FILTER_MODES } from '../../constants/dataSourceTypes';
import { useDataSourceFilter } from '../../hooks/useDataSourceFilter';

export function DataSourceFilter({
  value,
  onChange,
  size = 'sm',
  className = '',
  label = null,
}) {
  const globalFilter = useDataSourceFilter();
  const currentMode = value !== undefined ? value : globalFilter.filterMode;
  const handleSelect = (mode) => {
    if (onChange) {
      onChange(mode);
    } else {
      globalFilter.setFilterMode(mode);
    }
  };

  const isSmall = size === 'sm';
  const btnPadding = isSmall ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-xs';

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {label && (
        <span className="text-[11px] font-semibold text-sand-500 uppercase tracking-wider hidden sm:inline">
          {label}:
        </span>
      )}
      <div
        role="group"
        aria-label="Filter data origin"
        className="inline-flex rounded-lg border border-sand-300 bg-sand-100/70 p-0.5 shadow-2xs"
      >
        {/* All Data */}
        <button
          type="button"
          onClick={() => handleSelect(FILTER_MODES.ALL)}
          className={`${btnPadding} font-medium rounded-md transition-all ${
            currentMode === FILTER_MODES.ALL
              ? 'bg-white text-sand-900 shadow-xs font-semibold'
              : 'text-sand-600 hover:text-sand-900 hover:bg-white/50'
          }`}
          title="Display both verified real records and demonstration records"
        >
          All Data
        </button>

        {/* Real Data */}
        <button
          type="button"
          onClick={() => handleSelect(FILTER_MODES.REAL)}
          className={`${btnPadding} font-medium rounded-md transition-all flex items-center gap-1.5 ${
            currentMode === FILTER_MODES.REAL
              ? 'bg-emerald-700 text-white shadow-xs font-semibold'
              : 'text-sand-600 hover:text-emerald-800 hover:bg-white/50'
          }`}
          title="Display only physical hardware telemetry and verified operational records"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${currentMode === FILTER_MODES.REAL ? 'bg-white' : 'bg-emerald-600'}`} />
          <span>Real Data</span>
        </button>

        {/* Demo Data */}
        <button
          type="button"
          onClick={() => handleSelect(FILTER_MODES.DEMO)}
          className={`${btnPadding} font-medium rounded-md transition-all flex items-center gap-1.5 ${
            currentMode === FILTER_MODES.DEMO
              ? 'bg-amber-600 text-white shadow-xs font-semibold'
              : 'text-sand-600 hover:text-amber-800 hover:bg-white/50'
          }`}
          title="Display only demonstration, seeded, and simulated records"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${currentMode === FILTER_MODES.DEMO ? 'bg-white' : 'bg-amber-600'}`} />
          <span>Demo Data</span>
        </button>
      </div>
    </div>
  );
}
