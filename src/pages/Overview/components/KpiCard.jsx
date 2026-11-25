import React from 'react';
import { Layers, CheckCircle2, Sprout, Radio, ArrowUpRight, Minus } from 'lucide-react';
import { Card } from '../../../components/ui/Card';

const iconMap = {
  Layers,
  CheckCircle2,
  Sprout,
  Radio,
};

export function KpiCard({ title, value, unit, iconName, changeLabel, trend }) {
  const Icon = iconMap[iconName] || Layers;

  return (
    <Card className="hover:border-forest-600/40 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-sand-500">
          {title}
        </span>
        <div className="w-8 h-8 rounded-lg bg-sand-100 flex items-center justify-center text-forest-700">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-2.5 flex items-baseline gap-1.5">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-sand-900 font-mono">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-medium text-sand-500">
            {unit}
          </span>
        )}
      </div>

      {changeLabel && (
        <div className="mt-2 flex items-center gap-1.5 text-xs">
          {trend === 'up' && (
            <span className="text-emerald-700 flex items-center font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          )}
          {trend === 'warning' && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
          )}
          {trend === 'neutral' && (
            <span className="text-sand-400">
              <Minus className="w-3 h-3" />
            </span>
          )}
          <span className="text-sand-600 font-medium truncate">
            {changeLabel}
          </span>
        </div>
      )}
    </Card>
  );
}
