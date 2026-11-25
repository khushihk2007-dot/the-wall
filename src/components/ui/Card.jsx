import React from 'react';
import { cn } from '../../utils/cn';

export function Card({
  children,
  title,
  subtitle,
  action,
  className = '',
  bodyClassName = '',
  footer,
}) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-sand-200/90 shadow-card overflow-hidden transition-shadow hover:shadow-subtle',
        className
      )}
    >
      {(title || subtitle || action) && (
        <div className="px-5 py-4 border-b border-sand-100 flex items-center justify-between gap-4">
          <div>
            {title && (
              <h3 className="text-base font-semibold text-sand-900 tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-sand-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      <div className={cn('p-5', bodyClassName)}>{children}</div>

      {footer && (
        <div className="px-5 py-3.5 bg-sand-50/70 border-t border-sand-100 text-xs text-sand-600">
          {footer}
        </div>
      )}
    </div>
  );
}
