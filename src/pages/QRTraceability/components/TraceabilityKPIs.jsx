import React from 'react';
import { Factory, QrCode, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { Card } from '../../../components/ui/Card';

export function TraceabilityKPIs({ records }) {
  const totalBatches = records.length;
  const qrGenerated = records.filter((r) => r.hasQr).length;
  const verifiedBatches = records.filter((r) => r.verificationStatus === 'Quality Approved' || r.verificationStatus === 'Quality Approved (Standard C)').length;
  const pendingQuality = records.filter((r) => r.verificationStatus === 'Awaiting Quality Approval' || r.verificationStatus === 'Manufacturing In Progress').length;
  const withoutQr = records.filter((r) => !r.hasQr).length;

  const kpiData = [
    {
      title: 'Total Batches',
      value: totalBatches,
      unit: 'lots',
      icon: Factory,
      subtext: 'Registered production runs',
      color: 'text-forest-700',
    },
    {
      title: 'QR Codes Active',
      value: qrGenerated,
      unit: 'passports',
      icon: QrCode,
      subtext: `${totalBatches > 0 ? ((qrGenerated / totalBatches) * 100).toFixed(0) : 0}% coverage`,
      color: 'text-forest-700',
    },
    {
      title: 'Verified Batches',
      value: verifiedBatches,
      unit: 'lots',
      icon: CheckCircle2,
      subtext: 'Passed QA inspection',
      color: 'text-emerald-700',
    },
    {
      title: 'Pending QA Approval',
      value: pendingQuality,
      unit: 'lots',
      icon: Clock,
      subtext: 'Awaiting lab testing',
      color: 'text-amber-700',
    },
    {
      title: 'Without QR Codes',
      value: withoutQr,
      unit: 'batches',
      icon: AlertTriangle,
      subtext: withoutQr > 0 ? 'Requires generation' : 'All batches provisioned',
      color: withoutQr > 0 ? 'text-amber-700' : 'text-sand-400',
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
