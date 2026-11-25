import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Droplets, Thermometer, CloudRain } from 'lucide-react';

export function SmartFarmCard({ data }) {
  const { isSimulated, metrics } = data;
  const { averageMoisture, averageTemperature, averageHumidity } = metrics;

  return (
    <Card
      title="Smart Farm Monitoring"
      subtitle="Aggregated multi-zone soil and environmental telemetry"
      action={
        isSimulated ? (
          <Badge variant="warning" size="sm">
            [SIMULATED DATA]
          </Badge>
        ) : (
          <Badge variant="success" size="sm" dot>
            Live Sensors
          </Badge>
        )
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-3">
        {/* Moisture Block with Layer Breakdown */}
        <div className="p-3.5 rounded-xl bg-water-50/60 border border-water-200/80">
          <div className="flex items-center justify-between text-water-800 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Bed Moisture</span>
            <Droplets className="w-4 h-4 text-water-600" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-water-950">
              {averageMoisture.value}
            </span>
            <span className="text-xs font-medium text-water-700">{averageMoisture.unit}</span>
          </div>

          <div className="mt-2.5 pt-2 border-t border-water-200/60 space-y-1 text-[11px] text-water-900">
            <div className="flex justify-between">
              <span className="text-water-700">Top Layer (Crop):</span>
              <span className="font-mono font-semibold">{averageMoisture.topLayer}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-water-700">Bottom Layer (Coir):</span>
              <span className="font-mono font-semibold">{averageMoisture.bottomLayer}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-water-700">Root-Zone Soil:</span>
              <span className="font-mono font-semibold">{averageMoisture.rootZoneSoil}%</span>
            </div>
          </div>
        </div>

        {/* Temperature Block */}
        <div className="p-3.5 rounded-xl bg-sand-50 border border-sand-200">
          <div className="flex items-center justify-between text-sand-700 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Temperature</span>
            <Thermometer className="w-4 h-4 text-sand-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-sand-900">
              {averageTemperature.value}
            </span>
            <span className="text-xs font-medium text-sand-600">{averageTemperature.unit}</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-sand-200 text-[11px] text-sand-600 space-y-1">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-semibold text-forest-700">{averageTemperature.status}</span>
            </div>
            <div className="flex justify-between">
              <span>Typical Range:</span>
              <span className="font-mono">{averageTemperature.range}</span>
            </div>
          </div>
        </div>

        {/* Humidity Block */}
        <div className="p-3.5 rounded-xl bg-sand-50 border border-sand-200">
          <div className="flex items-center justify-between text-sand-700 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Humidity</span>
            <CloudRain className="w-4 h-4 text-sand-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-sand-900">
              {averageHumidity.value}
            </span>
            <span className="text-xs font-medium text-sand-600">{averageHumidity.unit}</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-sand-200 text-[11px] text-sand-600 space-y-1">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-semibold text-forest-700">{averageHumidity.status}</span>
            </div>
            <div className="flex justify-between">
              <span>Optimum Range:</span>
              <span className="font-mono">{averageHumidity.range}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-[11px] text-sand-500 flex items-center justify-between px-1">
        <span>Distinguishing bed substrate moisture from true root-zone ground soil.</span>
        <span className="font-mono text-sand-400">Node Sync: 100% Signal</span>
      </div>
    </Card>
  );
}
