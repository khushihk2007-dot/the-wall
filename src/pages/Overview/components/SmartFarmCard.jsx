import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Droplets, Thermometer, CloudRain } from 'lucide-react';
import { useSensorData } from '../../../hooks/useSensorData';
import { useDataSourceFilter } from '../../../hooks/useDataSourceFilter';
import { DataSourceBadge } from '../../../components/common/DataSourceBadge';
import { DATA_SOURCES, SOURCE_TYPES } from '../../../constants/dataSourceTypes';

export function SmartFarmCard({ data }) {
  const { data: sensorData, isConnected, isStale, lastFetchedAt } = useSensorData();
  const { isRealOnly, isDemoOnly } = useDataSourceFilter();
  const fallbackMetrics = data?.metrics || {};

  // Resolve values according to active data source filter
  const moistureUnit = '%';
  const hasLiveMoisture = !isDemoOnly && sensorData && sensorData.soilMoisturePercent !== null;
  const moistureValue = hasLiveMoisture
    ? sensorData.soilMoisturePercent
    : isRealOnly
    ? '—'
    : fallbackMetrics.averageMoisture?.value ?? '—';
  const moistureSource = hasLiveMoisture
    ? DATA_SOURCES.REAL
    : isRealOnly
    ? DATA_SOURCES.UNAVAILABLE
    : DATA_SOURCES.DEMO;

  const hasLiveTemp = !isDemoOnly && sensorData && (sensorData.temperature1 !== null || sensorData.temperature2 !== null);
  const tempValue = hasLiveTemp
    ? (sensorData.temperature1 !== null ? sensorData.temperature1 : sensorData.temperature2)
    : isRealOnly
    ? '—'
    : fallbackMetrics.averageTemperature?.value ?? '—';
  const tempSource = hasLiveTemp
    ? DATA_SOURCES.REAL
    : isRealOnly
    ? DATA_SOURCES.UNAVAILABLE
    : DATA_SOURCES.DEMO;

  const hasLiveHumidity = !isDemoOnly && sensorData && (sensorData.humidity1 !== null || sensorData.humidity2 !== null);
  const humidityValue = hasLiveHumidity
    ? (sensorData.humidity1 !== null ? sensorData.humidity1 : sensorData.humidity2)
    : isRealOnly
    ? '—'
    : fallbackMetrics.averageHumidity?.value ?? '—';
  const humiditySource = hasLiveHumidity
    ? DATA_SOURCES.REAL
    : isRealOnly
    ? DATA_SOURCES.UNAVAILABLE
    : DATA_SOURCES.DEMO;

  const getStatusBadge = () => {
    if (isDemoOnly) {
      return <DataSourceBadge source={DATA_SOURCES.DEMO} sourceType={SOURCE_TYPES.MOCK} size="sm" />;
    }
    if (isConnected) {
      if (isStale) {
        return (
          <Badge variant="warning" size="sm" dot>
            Stale Telemetry ({lastFetchedAt || 'Offline'})
          </Badge>
        );
      }
      return <DataSourceBadge source={DATA_SOURCES.REAL} sourceType={SOURCE_TYPES.ESP32} size="sm" />;
    }
    return <DataSourceBadge source={DATA_SOURCES.UNAVAILABLE} size="sm" />;
  };

  return (
    <Card
      title="Smart Farm Monitoring"
      subtitle={
        isConnected
          ? `Live field node (${sensorData?.device || 'ESP32'}) • Synchronized every 15s`
          : 'ESP32 Hardware Disconnected • Awaiting local sensor node'
      }
      action={getStatusBadge()}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-3">
        {/* Moisture Block with Layer Breakdown */}
        <div className="p-3.5 rounded-xl bg-water-50/60 border border-water-200/80">
          <div className="flex items-center justify-between text-water-800 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Bed Moisture</span>
            <Droplets className="w-4 h-4 text-water-600" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-water-950">
              {moistureValue}
            </span>
            <span className="text-xs font-medium text-water-700">{moistureUnit}</span>
          </div>

          <div className="mt-2.5 pt-2 border-t border-water-200/60 space-y-1 text-[11px] text-water-900">
            <div className="flex justify-between">
              <span className="text-water-700">Top Layer Substrate:</span>
              <span className="font-mono font-semibold">
                {hasLiveMoisture ? `${sensorData.soilMoisturePercent}%` : '—'}
              </span>
            </div>
            <div className="flex justify-between text-sand-400">
              <span>Bottom Layer (Coir):</span>
              <span className="font-mono italic">Unpaired</span>
            </div>
            <div className="flex justify-between text-sand-400">
              <span>Root-Zone Soil:</span>
              <span className="font-mono italic">Unpaired</span>
            </div>
          </div>
        </div>

        {/* Temperature Block */}
        <div className="p-3.5 rounded-xl bg-sand-50 border border-sand-200">
          <div className="flex items-center justify-between text-sand-700 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Substrate Temperature</span>
            <Thermometer className="w-4 h-4 text-sand-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-sand-900">
              {tempValue}
            </span>
            <span className="text-xs font-medium text-sand-600">°C</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-sand-200 text-[11px] text-sand-600 space-y-1">
            <div className="flex justify-between">
              <span>Sensor Status:</span>
              <span className="font-semibold text-forest-700">
                {isConnected && sensorData?.dht1Valid ? 'DHT Active' : isConnected ? 'Check DHT probe' : 'Disconnected'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Optimal Range:</span>
              <span className="font-mono">18°C – 28°C</span>
            </div>
          </div>
        </div>

        {/* Humidity Block */}
        <div className="p-3.5 rounded-xl bg-sand-50 border border-sand-200">
          <div className="flex items-center justify-between text-sand-700 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Air Humidity</span>
            <CloudRain className="w-4 h-4 text-sand-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-sand-900">
              {humidityValue}
            </span>
            <span className="text-xs font-medium text-sand-600">%</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-sand-200 text-[11px] text-sand-600 space-y-1">
            <div className="flex justify-between">
              <span>Atmosphere:</span>
              <span className="font-semibold text-forest-700">
                {sensorData?.rainDetected ? 'Rain Detected' : isConnected ? 'Clear' : 'Unavailable'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Optimal Range:</span>
              <span className="font-mono">40% – 70%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-[11px] text-sand-500 flex items-center justify-between px-1">
        <span>Single physical soil moisture channel active on current ESP32 prototype.</span>
        <span className="font-mono text-sand-400">
          {lastFetchedAt ? `Synced ${lastFetchedAt}` : 'Awaiting first sync'}
        </span>
      </div>
    </Card>
  );
}
