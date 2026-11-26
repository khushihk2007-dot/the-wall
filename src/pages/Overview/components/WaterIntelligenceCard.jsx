import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Droplet, Calendar, ShieldCheck, Ruler } from 'lucide-react';
import { useSensorData } from '../../../hooks/useSensorData';
import { useDataSourceFilter } from '../../../hooks/useDataSourceFilter';
import { DataSourceBadge } from '../../../components/common/DataSourceBadge';
import { DATA_SOURCES, SOURCE_TYPES } from '../../../constants/dataSourceTypes';

export function WaterIntelligenceCard({ data }) {
  const { data: sensorData, isConnected, isStale, lastFetchedAt } = useSensorData();
  const { isRealOnly, isDemoOnly } = useDataSourceFilter();
  const fallback = data || {};

  const hasLiveWater = !isDemoOnly && sensorData && sensorData.estimatedWaterLiters !== null;
  const availableWater = hasLiveWater
    ? sensorData.estimatedWaterLiters
    : isRealOnly
    ? null
    : fallback.availableWater ?? null;

  const ultrasonicDist = !isDemoOnly && sensorData && sensorData.ultrasonicDistanceCm !== null
    ? sensorData.ultrasonicDistanceCm
    : null;

  const storageCapacity = fallback.storageCapacity || 5000;
  const storagePercentage = availableWater !== null && storageCapacity > 0
    ? Math.min(100, Math.round((availableWater / storageCapacity) * 100))
    : (fallback.storagePercentage ?? 0);

  const getStatusBadge = () => {
    if (isDemoOnly) {
      return <DataSourceBadge source={DATA_SOURCES.DEMO} sourceType={SOURCE_TYPES.MOCK} size="sm" />;
    }
    if (isConnected) {
      if (isStale) {
        return (
          <Badge variant="warning" size="sm" dot>
            Stale Telemetry
          </Badge>
        );
      }
      return <DataSourceBadge source={DATA_SOURCES.REAL} sourceType={SOURCE_TYPES.ESP32} size="sm" />;
    }
    return <DataSourceBadge source={DATA_SOURCES.UNAVAILABLE} size="sm" />;
  };

  return (
    <Card
      title="Water Intelligence & Reservoir"
      subtitle={
        isConnected
          ? `ESP32 Ultrasonic Telemetry • Updated ${lastFetchedAt || 'Just now'}`
          : 'Reservoir Sensor Offline • Awaiting ESP32 hardware connection'
      }
      action={getStatusBadge()}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {/* Available Water */}
        <div className="p-3 rounded-lg bg-sand-50 border border-sand-200">
          <div className="flex items-center gap-1.5 text-xs text-sand-500 font-semibold mb-1">
            <Droplet className="w-3.5 h-3.5 text-water-600" />
            <span>Estimated Available</span>
          </div>
          <p className="text-xl font-bold font-mono text-sand-900">
            {availableWater !== null ? availableWater.toLocaleString() : '—'}{' '}
            <span className="text-xs font-normal text-sand-500">L</span>
          </p>
          <span className="text-[10px] text-sand-500">
            {ultrasonicDist !== null ? `Surface distance: ${ultrasonicDist} cm` : 'Sensor distance unavailable'}
          </span>
        </div>

        {/* Daily Demand */}
        <div className="p-3 rounded-lg bg-sand-50 border border-sand-200">
          <div className="flex items-center gap-1.5 text-xs text-sand-500 font-semibold mb-1">
            <Calendar className="w-3.5 h-3.5 text-earth-600" />
            <span>Daily Demand</span>
          </div>
          <p className="text-xl font-bold font-mono text-sand-900">
            {fallback.dailyRequirement ? fallback.dailyRequirement.toLocaleString() : '—'}{' '}
            <span className="text-xs font-normal text-sand-500">L/day</span>
          </p>
          <span className="text-[10px] text-sand-500">Configured baseline demand</span>
        </div>

        {/* Water Runway */}
        <div className="p-3 rounded-lg bg-forest-50/70 border border-forest-200">
          <div className="flex items-center gap-1.5 text-xs text-forest-800 font-semibold mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-forest-700" />
            <span>Estimated Runway</span>
          </div>
          <p className="text-xl font-bold font-mono text-forest-900">
            {fallback.estimatedRunwayDays ?? '—'}{' '}
            <span className="text-xs font-normal text-forest-700">Days</span>
          </p>
          <span className="text-[10px] text-forest-700 font-medium">Safe operational buffer</span>
        </div>
      </div>

      {/* Tank Level Gauge */}
      <div>
        <div className="flex justify-between text-xs font-semibold text-sand-700 mb-1.5">
          <span>Storage Reservoir Level</span>
          <span className="font-mono text-water-700">
            {availableWater !== null ? `${storagePercentage}% Full` : 'Level Unavailable'}
          </span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-sand-200 overflow-hidden">
          <div
            className="h-full bg-water-500 rounded-full transition-all duration-500"
            style={{ width: `${storagePercentage}%` }}
          />
        </div>
      </div>

      <div className="mt-3.5 pt-3 border-t border-sand-100 flex items-center justify-between text-[11px] text-sand-500">
        <span>
          {sensorData && sensorData.estimatedNetWaterChangeLpm != null
            ? `Estimated Net Flow Change: ${sensorData.estimatedNetWaterChangeLpm} L/min`
            : fallback.note || 'Reservoir capacity monitored via top-mount ultrasonic probe'}
        </span>
        <span className="italic text-sand-400">15s Reservoir Sync</span>
      </div>
    </Card>
  );
}
