import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export function LoadingState({
  message = 'Loading platform data...',
  description,
  className = '',
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-12 text-center rounded-xl border border-sand-200 bg-white/60',
        className
      )}
    >
      <Loader2 className="w-8 h-8 text-forest-700 animate-spin mb-3" />
      <p className="text-sm font-semibold text-sand-800">{message}</p>
      {description && (
        <p className="text-xs text-sand-500 mt-1 max-w-sm">{description}</p>
      )}
    </div>
  );
}
