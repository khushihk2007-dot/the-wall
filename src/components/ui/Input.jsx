import React from 'react';
import { cn } from '../../utils/cn';

export function Input({
  label,
  id,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  error,
  helperText,
  icon: Icon,
  className = '',
  disabled = false,
  required = false,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-sand-800 tracking-wide"
        >
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-sand-500">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            'w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-sand-900 placeholder:text-sand-400 transition-colors focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-forest-600 disabled:bg-sand-100 disabled:cursor-not-allowed',
            Icon ? 'pl-9' : 'pl-3.5',
            error ? 'border-red-500 focus:ring-red-500' : 'border-sand-300 hover:border-sand-400',
            className
          )}
          {...props}
        />
      </div>

      {error ? (
        <p className="text-xs text-red-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-sand-500">{helperText}</p>
      ) : null}
    </div>
  );
}
