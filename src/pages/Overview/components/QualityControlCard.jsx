import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';

export function QualityControlCard({ data }) {
  const { passed, failed, pending, grades, averageAbsorption, averageRetention } = data;

  const totalEvaluated = passed + failed;
  const passPercentage = totalEvaluated > 0 ? ((passed / totalEvaluated) * 100).toFixed(1) : 0;

  return (
    <Card
      title="Quality Control Overview"
      subtitle="[Demo Data] Laboratory inspection metrics and automated product grading"
      action={
        <Badge variant="success" size="sm" dot>
          {passPercentage}% Pass Rate
        </Badge>
      }
    >
      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Passed</span>
          <p className="text-xl font-bold font-mono text-emerald-900 mt-0.5">{passed}</p>
        </div>
        <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Pending</span>
          <p className="text-xl font-bold font-mono text-amber-900 mt-0.5">{pending}</p>
        </div>
        <div className="p-3 rounded-lg bg-rose-50/70 border border-rose-200 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800">Failed</span>
          <p className="text-xl font-bold font-mono text-rose-900 mt-0.5">{failed}</p>
        </div>
      </div>

      {/* Grade Distribution */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1.5 font-semibold text-sand-800">
          <span>Batch Grade Distribution</span>
          <span className="text-sand-500 font-mono text-[11px]">{passed} Total Graded</span>
        </div>

        {/* Progress Bar for Grades */}
        <div className="w-full h-3 rounded-full bg-sand-200 overflow-hidden flex">
          {grades.map((grd) => {
            const widthPct = (grd.count / (passed + failed)) * 100;
            return (
              <div
                key={grd.name}
                style={{ width: `${widthPct}%`, backgroundColor: grd.color }}
                title={`${grd.name}: ${grd.count} batches`}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-2.5 space-y-1.5">
          {grades.map((grd) => (
            <div key={grd.name} className="flex items-center justify-between text-xs text-sand-700">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: grd.color }} />
                <span>{grd.name}</span>
              </div>
              <span className="font-mono font-semibold">{grd.count} batches</span>
            </div>
          ))}
        </div>
      </div>

      {/* Moisture Lab Retention Averages */}
      <div className="pt-3 border-t border-sand-100 grid grid-cols-2 gap-3 text-xs">
        <div>
          <span className="text-sand-500 block">Avg Absorption</span>
          <span className="text-sm font-bold font-mono text-sand-900">{averageAbsorption}%</span>
          <span className="text-[10px] text-sand-400 block">Dry weight basis</span>
        </div>
        <div>
          <span className="text-sand-500 block">Avg Retention</span>
          <span className="text-sm font-bold font-mono text-sand-900">{averageRetention}%</span>
          <span className="text-[10px] text-sand-400 block">24h drainage test</span>
        </div>
      </div>
    </Card>
  );
}
