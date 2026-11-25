import React from 'react';
import { FlaskConical, CheckCircle2, XCircle, Clock, Percent } from 'lucide-react';
import { Card } from '../../../components/ui/Card';

export function QualityKPIs({ tests }) {
  const totalTested = tests.filter((t) => t.status === 'Approved' || t.status === 'Rejected').length;
  const passedBatches = tests.filter((t) => t.status === 'Approved' && (t.grade === 'Grade A' || t.grade === 'Grade B')).length;
  const failedBatches = tests.filter((t) => t.status === 'Rejected' || t.grade === 'Grade C' || t.grade === 'Failed').length;
  const pendingTests = tests.filter((t) => t.status === 'Pending' || t.status === 'In Progress' || t.status === 'Awaiting Review').length;

  const passRate = totalTested > 0 ? `${((passedBatches / totalTested) * 100).toFixed(1)}%` : '—';

  const kpiData = [
    {
      title: 'Total Batches Tested',
      value: totalTested,
      unit: 'completed',
      icon: FlaskConical,
      subtext: `${tests.length} total records logged`,
      color: 'text-forest-700',
    },
    {
      title: 'Passed Batches',
      value: passedBatches,
      unit: 'lots',
      icon: CheckCircle2,
      subtext: 'Grade A & B compliant',
      color: 'text-emerald-700',
    },
    {
      title: 'Failed / Low Grade',
      value: failedBatches,
      unit: 'lots',
      icon: XCircle,
      subtext: 'Rejected or Grade C',
      color: 'text-rose-700',
    },
    {
      title: 'Pending Tests',
      value: pendingTests,
      unit: 'in queue',
      icon: Clock,
      subtext: 'Active testing pipeline',
      color: 'text-amber-700',
    },
    {
      title: 'Overall Pass Rate',
      value: passRate,
      unit: 'compliance',
      icon: Percent,
      subtext: totalTested > 0 ? `${passedBatches} of ${totalTested} finalized` : 'No finalized tests',
      color: 'text-forest-700',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6">
      {kpiData.map((kpi) => {
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
