import React from 'react';
import { 
  Hourglass, 
  Plus, 
  Info, 
  Trash2
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';

export function WaterRunwaySummary({
  metrics,
  onOpenRecordModal,
  onClearUsageHistory,
}) {
  const isInsufficientData = metrics.isInsufficientData;
  const runwayDays = metrics.runwayDays;
  const isCalibrated = metrics.isCalibrated;

  return (
    <Card
      title="Water Runway Projection"
      subtitle="Estimated operational days remaining before reservoir exhaustion"
      action={
        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={onOpenRecordModal}
        >
          Record Water Usage
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Big Runway Metric Indicator */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-sand-50 to-sand-100/70 border border-sand-200 text-center flex flex-col items-center justify-center relative overflow-hidden">
          <div className="flex items-center gap-2 mb-2 text-sand-500 text-xs font-semibold uppercase tracking-wider">
            <Hourglass className="w-4 h-4 text-forest-700 animate-spin-slow" />
            <span>Projected Water Runway</span>
          </div>

          {!isCalibrated ? (
            <div className="py-2">
              <Badge variant="warning" size="md">
                Calibration Required
              </Badge>
              <p className="text-xs text-sand-600 mt-2 max-w-sm">
                Configure tank dimensions and sensor calibration above to enable runway calculation.
              </p>
            </div>
          ) : isInsufficientData ? (
            <div className="py-2 flex flex-col items-center">
              <span className="text-3xl font-extrabold text-sand-700 font-mono tracking-tight">
                Insufficient data
              </span>
              <p className="text-xs text-sand-500 mt-2 max-w-sm">
                No recorded consumption history. Record at least one water usage entry to estimate average daily consumption and runway days.
              </p>
            </div>
          ) : (
            <div className="py-1">
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-black text-forest-900 font-mono tracking-tight">
                  {runwayDays}
                </span>
                <span className="text-lg font-bold text-forest-700 uppercase tracking-wide">
                  Days
                </span>
              </div>
              <p className="text-xs text-sand-600 mt-2 font-medium">
                At current average rate of <strong className="text-sand-900">{metrics.averageDailyConsumptionLitres} L / day</strong>
              </p>
            </div>
          )}

          {/* Formula Annotation Footer */}
          <div className="mt-4 pt-3 border-t border-sand-200/80 w-full flex items-center justify-center gap-1.5 text-[11px] text-sand-500 font-mono">
            <span>Runway (Days)</span>
            <span>=</span>
            <span>Current Available Water (L)</span>
            <span>÷</span>
            <span>Average Daily Consumption (L/day)</span>
          </div>
        </div>

        {/* Calculation Inputs & Sub-stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-white rounded-xl border border-sand-200">
            <span className="text-[11px] font-medium text-sand-500 block">Current Available</span>
            <span className="text-base font-bold font-mono text-sand-900 mt-0.5 block">
              {metrics.availableLitres !== null ? `${metrics.availableLitres.toLocaleString()} L` : '—'}
            </span>
            <span className="text-[10px] text-sand-400 mt-1 block">
              {metrics.waterLevelPct !== null ? `${metrics.waterLevelPct}% reservoir capacity` : 'Uncalibrated'}
            </span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-sand-200">
            <span className="text-[11px] font-medium text-sand-500 block">Average Daily Use</span>
            <span className="text-base font-bold font-mono text-sand-900 mt-0.5 block">
              {metrics.averageDailyConsumptionLitres > 0 ? `${metrics.averageDailyConsumptionLitres} L/day` : 'Insufficient data'}
            </span>
            <span className="text-[10px] text-sand-400 mt-1 block">
              Across {metrics.activeDaysCount || 0} active recorded days
            </span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-sand-200">
            <span className="text-[11px] font-medium text-sand-500 block">Total Recorded Usage</span>
            <span className="text-base font-bold font-mono text-sand-900 mt-0.5 block">
              {metrics.totalRecordedUsageLitres.toLocaleString()} L
            </span>
            <span className="text-[10px] text-sand-400 mt-1 block">
              {metrics.usageCount || 0} manual log entries
            </span>
          </div>
        </div>

        {/* Transparent Demo Information Note */}
        <div className="p-3 bg-sand-50 border border-sand-200 rounded-xl text-xs text-sand-600 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sand-800">
                Manual Water Usage Tracking [DEMO DATA]
              </p>
              <p className="mt-0.5 text-sand-500 text-[11px]">
                Hardware does not include an in-line flow rate sensor. All usage records are logged manually by farm operators.
              </p>
            </div>
          </div>

          {metrics.usageCount > 0 && (
            <Button
              variant="ghost"
              size="xs"
              icon={Trash2}
              onClick={onClearUsageHistory}
              title="Clear usage records to test the 'Insufficient data' state"
              className="text-sand-400 hover:text-red-700 shrink-0"
            >
              Clear Log
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
