import React from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';

export function EmptyState({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'No data is currently available in this section.',
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-10 text-center rounded-xl border border-dashed border-sand-300 bg-sand-50/50',
        className
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-sand-100 flex items-center justify-center text-sand-500 mb-3.5">
        <Icon className="w-6 h-6 stroke-[1.5]" />
      </div>
      <h4 className="text-sm font-semibold text-sand-900">{title}</h4>
      <p className="text-xs text-sand-500 mt-1 max-w-md leading-relaxed mb-4">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
