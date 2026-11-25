import React from 'react';
import { Factory, Clock, CheckCircle2, Layers, Award } from 'lucide-react';
import { Card } from '../../../components/ui/Card';

export function ManufacturingKpis({ batches }) {
  const totalBatches = batches.length;
  const inProgress = batches.filter((b) => b.stage !== 'Completed').length;
  const completed = batches.filter((b) => b.stage === 'Completed').length;
  const totalBeds = batches.reduce((acc, b) => acc + (Number(b.quantity) || 0), 0);
  const completionRate = totalBatches > 0 ? ((completed / totalBatches) * 100).toFixed(1) : '0';

  const kpis = [
    {
      title: 'Total Batches',
      value: totalBatches,
      unit: 'registered',
      icon: Factory,
      subtext: 'All production runs',
      color: 'text-forest-700',
    },
    {
      title: 'In Progress',
      value: inProgress,
      unit: 'batches',
      icon: Clock,
      subtext: 'Currently in line',
      color: 'text-amber-700',
    },
    {
      title: 'Completed Batches',
      value: completed,
      unit: 'batches',
      icon: CheckCircle2,
      subtext: 'Passed manufacturing',
      color: 'text-emerald-700',
    },
    {
      title: 'Total Beds Made',
      value: totalBeds.toLocaleString(),
      unit: 'beds',
      icon: Layers,
      subtext: 'Cumulative output',
      color: 'text-earth-700',
    },
    {
      title: 'Completion Rate',
      value: `${completionRate}%`,
      unit: 'efficiency',
      icon: Award,
      subtext: `${completed} of ${totalBatches} finalized`,
      color: 'text-forest-700',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card key={kpi.title} className="p-4" bodyClassName="p-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-sand-500">
                {kpi.title}
              </span>
              <Icon className={`w-4 h-4 ${kpi.color}`} />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-sand-900">
                {kpi.value}
              </span>
              <span className="text-[11px] text-sand-500">{kpi.unit}</span>
            </div>
            <p className="text-[11px] text-sand-500 mt-1 truncate">{kpi.subtext}</p>
          </Card>
        );
      })}
    </div>
  );
}
