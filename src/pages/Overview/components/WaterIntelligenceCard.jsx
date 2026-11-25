import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Droplet, Calendar, ShieldCheck } from 'lucide-react';

export function WaterIntelligenceCard({ data }) {
  const {
    availableWater,
    dailyRequirement,
    estimatedRunwayDays,
    status,
    storageCapacity,
    storagePercentage,
    note,
  } = data;

  return (
    <Card
      title="Water Intelligence & Runway"
      subtitle="[Simulated Data] Reservoir availability and projected irrigation runway"
      action={
        <Badge variant="success" size="sm" dot>
          {status}
        </Badge>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {/* Available Water */}
        <div className="p-3 rounded-lg bg-sand-50 border border-sand-200">
          <div className="flex items-center gap-1.5 text-xs text-sand-500 font-semibold mb-1">
            <Droplet className="w-3.5 h-3.5 text-water-600" />
            <span>Available Storage</span>
          </div>
          <p className="text-xl font-bold font-mono text-sand-900">
            {availableWater.toLocaleString()} <span className="text-xs font-normal text-sand-500">L</span>
          </p>
          <span className="text-[10px] text-sand-500">of {storageCapacity.toLocaleString()} L total</span>
        </div>

        {/* Daily Requirement */}
        <div className="p-3 rounded-lg bg-sand-50 border border-sand-200">
          <div className="flex items-center gap-1.5 text-xs text-sand-500 font-semibold mb-1">
            <Calendar className="w-3.5 h-3.5 text-earth-600" />
            <span>Daily Demand</span>
          </div>
          <p className="text-xl font-bold font-mono text-sand-900">
            {dailyRequirement.toLocaleString()} <span className="text-xs font-normal text-sand-500">L/day</span>
          </p>
          <span className="text-[10px] text-sand-500">Across 24 active beds</span>
        </div>

        {/* Water Runway */}
        <div className="p-3 rounded-lg bg-forest-50/70 border border-forest-200">
          <div className="flex items-center gap-1.5 text-xs text-forest-800 font-semibold mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-forest-700" />
            <span>Water Runway</span>
          </div>
          <p className="text-xl font-bold font-mono text-forest-900">
            {estimatedRunwayDays} <span className="text-xs font-normal text-forest-700">Days</span>
          </p>
          <span className="text-[10px] text-forest-700 font-medium">Safe operational buffer</span>
        </div>
      </div>

      {/* Tank Level Gauge */}
      <div>
        <div className="flex justify-between text-xs font-semibold text-sand-700 mb-1.5">
          <span>Storage Reservoir Level</span>
          <span className="font-mono text-water-700">{storagePercentage}% Full</span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-sand-200 overflow-hidden">
          <div
            className="h-full bg-water-500 rounded-full transition-all duration-500"
            style={{ width: `${storagePercentage}%` }}
          />
        </div>
      </div>

      <div className="mt-3.5 pt-3 border-t border-sand-100 flex items-center justify-between text-[11px] text-sand-500">
        <span>{note}</span>
        <span className="italic text-sand-400">Scarcity Mode interlocks ready</span>
      </div>
    </Card>
  );
}
