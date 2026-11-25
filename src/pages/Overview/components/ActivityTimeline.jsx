import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Factory, CheckCircle2, Sprout, Radio } from 'lucide-react';

const iconMap = {
  Factory: { icon: Factory, color: 'text-forest-700 bg-forest-50 border-forest-200' },
  CheckCircle2: { icon: CheckCircle2, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  Sprout: { icon: Sprout, color: 'text-earth-700 bg-earth-50 border-earth-200' },
  Radio: { icon: Radio, color: 'text-water-700 bg-water-50 border-water-200' },
};

export function ActivityTimeline({ activities }) {
  return (
    <Card
      title="Recent Platform Activity"
      subtitle="[Demo Feed] Chronological feed of manufacturing, QC, and farm operations"
    >
      <div className="space-y-4">
        {activities.map((act, index) => {
          const config = iconMap[act.iconName] || iconMap.Factory;
          const Icon = config.icon;
          const isLast = index === activities.length - 1;

          return (
            <div key={act.id} className="relative flex items-start gap-3">
              {/* Connector Line */}
              {!isLast && (
                <span
                  className="absolute left-4 top-8 bottom-0 w-0.5 -ml-px bg-sand-200"
                  aria-hidden="true"
                />
              )}

              {/* Icon badge */}
              <div
                className={`relative w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${config.color}`}
              >
                <Icon className="w-4 h-4" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-sand-900 truncate">
                    {act.title}
                  </p>
                  <span className="text-[10px] text-sand-400 shrink-0 font-mono">
                    {act.timestamp}
                  </span>
                </div>
                <p className="text-xs text-sand-600 mt-0.5 leading-relaxed">
                  {act.description}
                </p>
                <span className="inline-block mt-1 text-[10px] text-forest-700 font-medium bg-sand-100 px-2 py-0.5 rounded">
                  {act.category}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
