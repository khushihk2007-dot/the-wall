import React from 'react';
import { NavLink } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { NAV_ITEMS } from '../routes/navItems';
import { cn } from '../utils/cn';

export function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-sand-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 w-64 bg-forest-900 text-white flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 border-r border-forest-800',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-forest-800/80 bg-forest-950/40">
          <div className="w-9 h-9 rounded-lg bg-forest-700/80 border border-forest-600/50 flex items-center justify-center text-emerald-300 shadow-inner">
            <Leaf className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-sand-50">
              The Wall
            </span>
            <span className="text-[10px] text-forest-300 font-mono tracking-wider uppercase">
              Agri-Tech Platform v1.0
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-forest-400 font-mono">
            Platform Modules
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                end={item.path === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                    isActive
                      ? 'bg-forest-800 text-emerald-300 font-semibold shadow-sm border-l-4 border-emerald-400'
                      : 'text-forest-200 hover:bg-forest-800/50 hover:text-white'
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0 transition-colors group-hover:text-emerald-300" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Footer info card */}
        <div className="p-3 border-t border-forest-800/80 bg-forest-950/40">
          <div className="p-2.5 rounded-lg bg-forest-800/60 border border-forest-700/50 text-xs">
            <div className="flex items-center justify-between text-forest-300 mb-1">
              <span className="font-medium text-[11px]">Hardware Gateway</span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Standby
              </span>
            </div>
            <p className="text-[10px] text-forest-400 leading-tight">
              ESP32 telemetry ready for connection
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
