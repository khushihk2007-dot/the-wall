import React from 'react';
import { cn } from '../../utils/cn';

export function Table({ children, className = '' }) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-sand-200">
      <table className={cn('w-full text-left border-collapse text-sm', className)}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className = '' }) {
  return (
    <thead className={cn('bg-sand-50/90 text-xs uppercase font-semibold text-sand-600 border-b border-sand-200', className)}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className = '' }) {
  return (
    <tbody className={cn('divide-y divide-sand-100 bg-white text-sand-800', className)}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className = '', hover = true }) {
  return (
    <tr
      className={cn(
        'transition-colors',
        hover && 'hover:bg-sand-50/60',
        className
      )}
    >
      {children}
    </tr>
  );
}

export function TableHead({ children, className = '' }) {
  return (
    <th className={cn('px-4 py-3 tracking-wider font-semibold', className)}>
      {children}
    </th>
  );
}

export function TableCell({ children, className = '' }) {
  return (
    <td className={cn('px-4 py-3 align-middle text-sand-700', className)}>
      {children}
    </td>
  );
}
