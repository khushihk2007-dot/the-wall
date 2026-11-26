import React, { useState } from 'react';
import { 
  Radio, 
  Cpu, 
  Wifi, 
  WifiOff, 
  Droplets, 
  Thermometer, 
  Ruler, 
  Zap, 
  Wind, 
  RefreshCw, 
  Terminal, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  CloudRain, 
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { useSensorData } from '../../../hooks/useSensorData';
import { useDataSourceFilter } from '../../../hooks/useDataSourceFilter';
import { DataSourceBadge } from '../../../components/common/DataSourceBadge';
import { DATA_SOURCES, SOURCE_TYPES } from '../../../constants/dataSourceTypes';
import { sensorDataService } from '../../../services/sensorDataService';

export function LiveHardwareStreamCard() {
  const { 
    data: sensorData, 
    isConnected, 
    isStale, 
    lastFetchedAt, 
    isFetching, 
    refetch, 
    apiUrl, 
    error 
  } = useSensorData();
  const { isDemoOnly } = useDataSourceFilter();

  const [showRawJson, setShowRawJson] = useState(false);

  // Formatted hardware uptime
  const uptimeString = sensorData && sensorData.uptimeMs 
    ? sensorDataService.formatUptime(sensorData.uptimeMs) 
    : '—';

  return (
    <div className="bg-gradient-to-r from-sand-900 via-forest-950 to-sand-900 text-white rounded-2xl p-5 border border-forest-800/80 shadow-md">
      {/* Top Bar: Title, Live Status & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-forest-800/60">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${isConnected ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40' : 'bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/40'}`}>
            <Radio className={`w-5 h-5 ${isConnected ? 'animate-pulse text-emerald-400' : 'text-rose-400'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-base tracking-tight text-white font-sans">
                ESP32 Hardware Stream
              </span>
              {isDemoOnly ? (
                <DataSourceBadge source={DATA_SOURCES.DEMO} sourceType={SOURCE_TYPES.MOCK} size="xs" />
              ) : isConnected ? (
                <DataSourceBadge source={isStale ? DATA_SOURCES.UNAVAILABLE : DATA_SOURCES.REAL} sourceType={SOURCE_TYPES.ESP32} size="xs" />
              ) : (
                <DataSourceBadge source={DATA_SOURCES.UNAVAILABLE} size="xs" />
              )}
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                15s Shared Interval
              </span>
            </div>
            <p className="text-xs text-sand-300 mt-0.5 flex items-center gap-1.5 font-mono">
              <span>Endpoint:</span>
              <span className="text-sand-100 font-semibold bg-sand-800/60 px-1.5 py-0.5 rounded text-[11px]">
                {apiUrl}
              </span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setShowRawJson(!showRawJson)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-forest-900/60 hover:bg-forest-800/80 border border-forest-700/60 text-xs font-mono text-sand-200 transition-colors"
            title="Inspect raw JSON packet from ESP32"
          >
            <Terminal className="w-3.5 h-3.5 text-forest-300" />
            <span>Raw Packet</span>
            {showRawJson ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <Button
            variant="primary"
            size="sm"
            icon={RefreshCw}
            loading={isFetching}
            onClick={() => refetch()}
            className="!bg-emerald-600 hover:!bg-emerald-500 !text-white text-xs font-semibold shadow-xs"
            title="Trigger immediate fetch from ESP32"
          >
            {isFetching ? 'Fetching...' : 'Fetch Now'}
          </Button>
        </div>
      </div>

      {/* Live Stream Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4">
        {/* Soil Moisture (Ch 1) */}
        <div className="bg-sand-800/40 border border-forest-800/40 rounded-xl p-3">
          <div className="flex items-center justify-between text-sand-400 mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">Soil Moisture</span>
            <Droplets className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-white">
              {sensorData && sensorData.soilMoisturePercent !== null ? `${sensorData.soilMoisturePercent}%` : '—'}
            </span>
            <span className="text-[10px] text-sand-400">RH</span>
          </div>
          <span className="text-[10px] text-sand-400 font-mono block mt-1">
            ADC: {sensorData && sensorData.soilRaw !== null ? `${sensorData.soilRaw}/4095` : 'Ch 1 Active'}
          </span>
        </div>

        {/* Bed Temperature */}
        <div className="bg-sand-800/40 border border-forest-800/40 rounded-xl p-3">
          <div className="flex items-center justify-between text-sand-400 mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">Bed Temp</span>
            <Thermometer className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-white">
              {sensorData && sensorData.temperature1 !== null ? `${sensorData.temperature1}°` : '—'}
            </span>
            <span className="text-[10px] text-sand-400">C</span>
          </div>
          <span className="text-[10px] text-sand-400 font-mono block mt-1">
            DHT1: {sensorData?.dht1Valid ? 'Valid' : 'Sensor 1'}
          </span>
        </div>

        {/* Ambient Climate */}
        <div className="bg-sand-800/40 border border-forest-800/40 rounded-xl p-3">
          <div className="flex items-center justify-between text-sand-400 mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400">Ambient Air</span>
            <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-white">
              {sensorData && sensorData.temperature2 !== null ? `${sensorData.temperature2}°` : '—'}
            </span>
            <span className="text-[10px] text-sand-400">
              {sensorData && sensorData.humidity2 !== null ? `(${sensorData.humidity2}%)` : ''}
            </span>
          </div>
          <span className="text-[10px] text-sand-400 font-mono block mt-1">
            Rain: {sensorData ? (sensorData.rainDetected ? 'Wet Detected' : 'Dry / Clear') : 'Rain Sensor'}
          </span>
        </div>

        {/* Ultrasonic Depth */}
        <div className="bg-sand-800/40 border border-forest-800/40 rounded-xl p-3">
          <div className="flex items-center justify-between text-sand-400 mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-400">Ultrasonic</span>
            <Ruler className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-white">
              {sensorData && sensorData.ultrasonicDistanceCm !== null ? `${sensorData.ultrasonicDistanceCm}` : '—'}
            </span>
            <span className="text-[10px] text-sand-400">cm</span>
          </div>
          <span className="text-[10px] text-sand-400 font-mono block mt-1 truncate">
            {sensorData && sensorData.estimatedWaterLiters !== null
              ? `${sensorData.estimatedWaterLiters} L est.`
              : 'HC-SR04 Range'}
          </span>
        </div>

        {/* Pump & Fan Actuators */}
        <div className="bg-sand-800/40 border border-forest-800/40 rounded-xl p-3">
          <div className="flex items-center justify-between text-sand-400 mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">Actuators</span>
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="space-y-0.5 text-xs font-mono">
            <div className="flex justify-between items-center">
              <span className="text-sand-400">Pump:</span>
              <span className={`font-semibold ${sensorData?.pumpOn ? 'text-emerald-400' : 'text-sand-300'}`}>
                {sensorData ? (sensorData.pumpOn ? 'ON' : 'OFF') : 'AUTO'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sand-400">Fan:</span>
              <span className={`font-semibold ${sensorData?.fanOn ? 'text-cyan-400' : 'text-sand-300'}`}>
                {sensorData ? (sensorData.fanOn ? 'ON' : 'OFF') : 'AUTO'}
              </span>
            </div>
          </div>
        </div>

        {/* Node Connectivity & IP */}
        <div className="bg-sand-800/40 border border-forest-800/40 rounded-xl p-3">
          <div className="flex items-center justify-between text-sand-400 mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-400">Gateway</span>
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="space-y-0.5 text-xs font-mono">
            <div className="truncate text-white font-semibold">
              {sensorData?.device || 'ESP32 Node'}
            </div>
            <div className="text-[10px] text-sand-300 truncate">
              IP: {sensorData?.ipAddress || '10.244.183.187'}
            </div>
            <div className="text-[10px] text-sand-400">
              Up: {uptimeString}
            </div>
          </div>
        </div>
      </div>

      {/* Status Footer: Last sync and diagnostic banner */}
      <div className="mt-3 pt-3 border-t border-forest-800/40 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-sand-300 gap-2">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-forest-400 shrink-0" />
          <span>Last Poll Attempt: <strong className="text-white font-mono">{lastFetchedAt || 'Initializing...'}</strong></span>
        </div>
        <div className="flex items-center gap-1.5 text-forest-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Central Reservoir feeds Overview, Farm Monitoring & Water Runway seamlessly.</span>
        </div>
      </div>

      {/* Expandable Live JSON Payload Inspector (Pitch Showcase) */}
      {showRawJson && (
        <div className="mt-4 pt-4 border-t border-forest-800/80 animate-fadeIn">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-emerald-300 flex items-center gap-1.5">
              <Terminal className="w-4 h-4" /> Live JSON Payload Stream ({sensorData ? 'HTTP 200 OK' : 'Awaiting Connection'}):
            </span>
            <span className="text-[10px] font-mono text-sand-400">
              Content-Type: application/json
            </span>
          </div>
          <pre className="p-3.5 rounded-xl bg-sand-950 text-emerald-400 font-mono text-xs overflow-x-auto border border-forest-800/80 max-h-60 leading-relaxed">
            {JSON.stringify(
              sensorData || {
                targetDevice: 'ESP32-Field-Node',
                targetEndpoint: apiUrl,
                pollingIntervalMs: 15000,
                connectionStatus: isConnected ? 'Connected' : 'Standby / Local Subnet Routing Required',
                timeoutMs: 6000,
                lastAttempt: lastFetchedAt || new Date().toISOString(),
                payloadSchema: {
                  device: 'string',
                  wifiConnected: 'boolean',
                  ipAddress: 'string',
                  uptimeMs: 'number',
                  soilRaw: 'number (0-4095)',
                  soilMoisturePercent: 'number (%)',
                  temperature1: 'number (°C)',
                  humidity1: 'number (%)',
                  temperature2: 'number (°C)',
                  humidity2: 'number (%)',
                  ultrasonicDistanceCm: 'number (cm)',
                  estimatedWaterLiters: 'number (L)',
                  estimatedNetWaterChangeLpm: 'number (L/min)',
                  pumpOn: 'boolean',
                  fanOn: 'boolean',
                  pumpMode: 'string (AUTO|MANUAL)',
                  fanMode: 'string (AUTO|MANUAL)',
                  gpsValid: 'boolean',
                  latitude: 'number',
                  longitude: 'number',
                },
              },
              null,
              2
            )}
          </pre>
        </div>
      )}
    </div>
  );
}
