import React from 'react';
import { cn } from '../../utils/cn';

const statusVariants = {
  success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
  danger: 'bg-rose-50 text-rose-800 border-rose-200',
  info: 'bg-water-50 text-water-800 border-water-200',
  neutral: 'bg-sand-100 text-sand-700 border-sand-200',
  forest: 'bg-forest-50 text-forest-800 border-forest-200',
  earth: 'bg-earth-100 text-earth-800 border-earth-300',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs font-medium',
};

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  dot = false,
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border tracking-wide select-none',
        statusVariants[variant] || statusVariants.neutral,
        sizes[size] || sizes.md,
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full shrink-0',
            variant === 'success' && 'bg-emerald-500',
            variant === 'warning' && 'bg-amber-500',
            variant === 'danger' && 'bg-rose-500',
            variant === 'info' && 'bg-water-500',
            variant === 'forest' && 'bg-forest-600',
            variant === 'earth' && 'bg-earth-600',
            variant === 'neutral' && 'bg-sand-400'
          )}
        />
      )}
      <span>{children}</span>
    </span>
  );
}
