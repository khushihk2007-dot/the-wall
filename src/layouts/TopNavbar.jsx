import React from 'react';
import { Menu } from 'lucide-react';
import { Badge } from '../components/ui/Badge';

export function TopNavbar({ onMenuClick }) {
  return (
    <header className="h-16 bg-white border-b border-sand-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-subtle">
      {/* Left side: mobile menu button & environment badge */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-sand-600 hover:bg-sand-100 hover:text-sand-900 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <Badge variant="forest" size="sm" dot>
            The Wall Core Active
          </Badge>
          <span className="hidden sm:inline-block text-xs text-sand-400 font-mono">
            | Antigravity Engine
          </span>
        </div>
      </div>
    </header>
  );
}
