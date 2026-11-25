import React from 'react';
import { cn } from '../../utils/cn';

export function Select({
  label,
  id,
  options = [],
  value,
  onChange,
  error,
  helperText,
  className = '',
  disabled = false,
  required = false,
  placeholder = 'Select an option',
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold text-sand-800 tracking-wide"
        >
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={cn(
            'w-full appearance-none rounded-lg border bg-white px-3.5 py-2 pr-9 text-sm text-sand-900 transition-colors focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-forest-600 disabled:bg-sand-100 disabled:cursor-not-allowed',
            error ? 'border-red-500 focus:ring-red-500' : 'border-sand-300 hover:border-sand-400',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const labelText = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={val} value={val}>
                {labelText}
              </option>
            );
          })}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-sand-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {error ? (
        <p className="text-xs text-red-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-sand-500">{helperText}</p>
      ) : null}
    </div>
  );
}
