import React from 'react';
import { 
  FlaskConical, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingDown, 
  Plus 
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

export function BiodegradationKPIs({ kpis, onOpenRegisterModal }) {
  const {
    totalSamples = 0,
    underObservation = 0,
    completed = 0,
    requiringAttention = 0,
    avgMassLoss = 0,
    measuredSampleCount = 0,
  } = kpis || {};

  const cards = [
    {
      title: 'Total Samples Registered',
      value: totalSamples,
      unit: 'specimens',
      icon: FlaskConical,
      subtext: 'Coupons & field specimens',
      color: 'text-forest-800',
    },
    {
      title: 'Under Observation',
      value: underObservation,
      unit: 'active',
      icon: Activity,
      subtext: 'Burial, compost & lab tests',
      color: 'text-forest-600',
    },
    {
      title: 'Observation Completed',
      value: completed,
      unit: 'concluded',
      icon: CheckCircle2,
      subtext: 'Cycle concluded (Non-cert)',
      color: 'text-sand-700',
    },
    {
      title: 'Requiring Attention',
      value: requiringAttention,
      unit: 'samples',
      icon: AlertTriangle,
      subtext: requiringAttention > 0 ? 'Review or paused' : 'All monitoring regular',
      color: requiringAttention > 0 ? 'text-amber-700' : 'text-emerald-700',
    },
    {
      title: 'Avg Recorded Mass Loss',
      value: `${avgMassLoss}%`,
      unit: 'loss',
      icon: TrendingDown,
      subtext: `From ${measuredSampleCount} measured samples [Demo]`,
      color: 'text-earth-800',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.title} bodyClassName="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-sand-500">
                  {c.title}
                </span>
                <div className={`p-1.5 rounded-lg bg-sand-100 ${c.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-1 my-1">
                <span className="text-2xl font-bold tracking-tight text-sand-900">
                  {c.value}
                </span>
                <span className="text-xs font-medium text-sand-500">{c.unit}</span>
              </div>
              <p className="text-[11px] text-sand-500 truncate mt-1">
                {c.subtext}
              </p>
            </Card>
          );
        })}
      </div>

      {/* Quick Action & Scientific Notice Bar */}
      <div className="bg-sand-50 border border-sand-300 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-forest-600 animate-pulse shrink-0" />
          <div className="text-xs text-sand-700">
            <span className="font-semibold text-sand-900">Empirical Research Protocol:</span>{' '}
            Observations track physical mass loss and dimensional disintegration over time. Results are empirical measurements and do not constitute automatic certification of compostability.
          </div>
        </div>
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={onOpenRegisterModal}
          className="shrink-0 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Sample</span>
        </Button>
      </div>
    </div>
  );
}
