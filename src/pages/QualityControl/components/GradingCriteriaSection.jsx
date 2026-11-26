import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Sliders } from 'lucide-react';
import { ConfigureCriteriaModal } from './ConfigureCriteriaModal';

export function GradingCriteriaSection({
  criteria,
  onSaveCriteria,
  onResetDefault,
}) {
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const isValidated = criteria?.isValidated && criteria?.validationStatus === 'Validated';
  const c = criteria?.tests || {};

  const columns = [
    {
      title: 'Water Absorption (%)',
      gradeA: `≥ ${c.absorption?.gradeA || 400}%`,
      gradeB: `≥ ${c.absorption?.gradeB || 350}%`,
      gradeC: `≥ ${c.absorption?.gradeC || 300}%`,
      critical: `< ${c.absorption?.criticalMin || 300}%`,
    },
    {
      title: 'Water Retention (%)',
      gradeA: `≥ ${c.retention?.gradeA || 78}%`,
      gradeB: `≥ ${c.retention?.gradeB || 72}%`,
      gradeC: `≥ ${c.retention?.gradeC || 65}%`,
      critical: `< ${c.retention?.criticalMin || 65}%`,
    },
    {
      title: 'Moisture Distribution (%)',
      gradeA: `≤ ${c.moistureDist?.gradeA || 15}%`,
      gradeB: `≤ ${c.moistureDist?.gradeB || 25}%`,
      gradeC: `≤ ${c.moistureDist?.gradeC || 35}%`,
      critical: `> ${c.moistureDist?.criticalMax || 40}%`,
    },
    {
      title: 'Structural Stability (%)',
      gradeA: `≤ ${c.stability?.gradeA || 10}%`,
      gradeB: `≤ ${c.stability?.gradeB || 18}%`,
      gradeC: `≤ ${c.stability?.gradeC || 25}%`,
      critical: `> ${c.stability?.criticalMax || 28}%`,
    },
    {
      title: 'Drying Behaviour (%)',
      gradeA: `${c.drying?.gradeA?.min || 55}%–${c.drying?.gradeA?.max || 75}%`,
      gradeB: `${c.drying?.gradeB?.min || 45}%–${c.drying?.gradeB?.max || 85}%`,
      gradeC: `${c.drying?.gradeC?.min || 35}%–${c.drying?.gradeC?.max || 90}%`,
      critical: `< ${c.drying?.criticalMin || 30}% or > ${c.drying?.criticalMax || 92}%`,
    },
  ];

  return (
    <Card
      title="Grading Criteria & Thresholds"
      subtitle="Standardized physical testing benchmarks and rejection limits"
      action={
        <div className="flex flex-wrap items-center gap-2">
          {criteria?.version && (
            <Badge variant="forest" size="sm">
              {criteria.version}
            </Badge>
          )}

          <Badge
            variant={isValidated ? 'success' : 'warning'}
            size="sm"
            dot
          >
            {isValidated ? 'Validated' : 'Awaiting Validation'}
          </Badge>

          <Button
            variant="outline"
            size="sm"
            icon={Sliders}
            onClick={() => setIsConfigOpen(true)}
            className="text-xs font-medium"
          >
            Configure Thresholds
          </Button>
        </div>
      }
      className="mb-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {columns.map((col) => (
          <div
            key={col.title}
            className="p-3.5 rounded-xl border border-sand-200 bg-sand-50/40 hover:bg-sand-50/70 transition-all space-y-2.5"
          >
            {/* Column Heading */}
            <h4 className="font-bold text-sand-900 text-xs tracking-tight border-b border-sand-200/80 pb-2">
              {col.title}
            </h4>

            {/* Threshold Values */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-medium text-forest-800 text-[11px]">Grade A:</span>
                <span className="font-mono font-bold text-forest-900 text-[11px]">{col.gradeA}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-earth-800 text-[11px]">Grade B:</span>
                <span className="font-mono font-bold text-earth-900 text-[11px]">{col.gradeB}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-amber-800 text-[11px]">Grade C:</span>
                <span className="font-mono font-bold text-amber-900 text-[11px]">{col.gradeC}</span>
              </div>
              <div className="flex items-center justify-between pt-1.5 border-t border-dashed border-sand-200 text-rose-700">
                <span className="font-bold text-[10px] uppercase">Critical Fail:</span>
                <span className="font-mono font-bold text-[11px]">{col.critical}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConfigureCriteriaModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        activeCriteria={criteria}
        onSaveCriteria={onSaveCriteria}
        onResetDefault={onResetDefault}
      />
    </Card>
  );
}
