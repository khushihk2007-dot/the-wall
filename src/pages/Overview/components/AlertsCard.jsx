import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

const severityConfig = {
  critical: {
    icon: AlertCircle,
    badgeVariant: 'danger',
    borderClass: 'border-l-4 border-l-rose-500 bg-rose-50/30',
    titleClass: 'text-rose-950',
    badgeLabel: 'Critical',
  },
  warning: {
    icon: AlertTriangle,
    badgeVariant: 'warning',
    borderClass: 'border-l-4 border-l-amber-500 bg-amber-50/30',
    titleClass: 'text-amber-950',
    badgeLabel: 'Warning',
  },
  info: {
    icon: Info,
    badgeVariant: 'info',
    borderClass: 'border-l-4 border-l-water-500 bg-water-50/30',
    titleClass: 'text-water-950',
    badgeLabel: 'Notice',
  },
};

export function AlertsCard({ alerts }) {
  return (
    <Card
      title="Alerts & System Notifications"
      subtitle="[Simulated Feed] Priority operational warnings and safety triggers"
      action={
        <Badge variant="neutral" size="sm">
          {alerts.length} Active Events
        </Badge>
      }
    >
      <div className="space-y-2.5">
        {alerts.map((alt) => {
          const cfg = severityConfig[alt.severity] || severityConfig.info;
          const Icon = cfg.icon;

          return (
            <div
              key={alt.id}
              className={`p-3 rounded-lg border border-sand-200 ${cfg.borderClass} transition-colors`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className="w-4 h-4 shrink-0 text-current opacity-80" />
                  <span className={`text-xs font-semibold truncate ${cfg.titleClass}`}>
                    {alt.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={cfg.badgeVariant} size="sm">
                    {cfg.badgeLabel}
                  </Badge>
                  <span className="text-[10px] text-sand-400 font-mono">
                    {alt.timestamp}
                  </span>
                </div>
              </div>
              <p className="text-xs text-sand-600 pl-6 leading-relaxed">
                {alt.message}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
