import React from 'react';
import { Cpu, Clock } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { useSensorData } from '../../../hooks/useSensorData';
import { useDataSourceFilter } from '../../../hooks/useDataSourceFilter';
import { DataSourceBadge } from '../../../components/common/DataSourceBadge';
import { DATA_SOURCES, SOURCE_TYPES } from '../../../constants/dataSourceTypes';

export function CompactDeviceStatus({ device, snapshot, installation }) {
  const { data: sensorData, isConnected, isStale, lastFetchedAt } = useSensorData();
  const { isDemoOnly } = useDataSourceFilter();

  const isEspConnected = isDemoOnly
    ? Boolean(device && device.connectionStatus === 'Connected')
    : isConnected;

  const isSensorConnected = isDemoOnly
    ? Boolean(isEspConnected && snapshot?.moisture?.channel1?.isConnected)
    : Boolean(isConnected && sensorData && sensorData.soilValid && sensorData.soilMoisturePercent !== null);

  const deviceId = isDemoOnly
    ? (device?.id || installation?.deviceId || 'No Gateway')
    : (sensorData?.device || device?.id || installation?.deviceId || 'ESP32 Node');

  const lastUpdated = isDemoOnly
    ? (device?.lastCommunication || snapshot?.lastUpdated || 'Never')
    : (lastFetchedAt || 'Never');

  return (
    <div className="bg-white border border-sand-200 rounded-xl p-3.5 shadow-xs flex flex-col justify-between h-full">
      {/* Header with Title, Origin Badge, and ESP32 Status */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-sand-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-forest-100 flex items-center justify-center text-forest-800 shrink-0">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-sand-900">Device Status</span>
              {isDemoOnly ? (
                <DataSourceBadge source={DATA_SOURCES.DEMO} sourceType={SOURCE_TYPES.MOCK} size="xs" />
              ) : (
                <DataSourceBadge source={isConnected ? DATA_SOURCES.REAL : DATA_SOURCES.UNAVAILABLE} sourceType={SOURCE_TYPES.ESP32} size="xs" />
              )}
            </div>
            <span className="text-[11px] text-sand-500 font-mono block">
              Device ID: <strong className="text-sand-800">{deviceId}</strong>
            </span>
          </div>
        </div>

        <div className="text-right">
          <Badge variant={isEspConnected ? (isStale ? 'warning' : 'success') : 'danger'} size="xs" dot>
            ESP32: {isEspConnected ? (isStale ? 'Stale' : 'Connected') : 'Disconnected'}
          </Badge>
        </div>
      </div>

      {/* Sensor Status and Last Data Received */}
      <div className="pt-2 flex items-center justify-between gap-2 text-xs flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-sand-500">Sensor:</span>
          <Badge variant={isSensorConnected ? 'success' : 'neutral'} size="xs" dot>
            {isSensorConnected ? 'Probe Valid' : isEspConnected ? 'Uncalibrated / Zero' : 'Disconnected'}
          </Badge>
          <span className="text-[10px] text-sand-400">(Top Layer Probe)</span>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-sand-500">
          <Clock className="w-3 h-3 text-sand-400 shrink-0" />
          <span>Last data: <span className="font-mono font-medium text-sand-700">{lastUpdated}</span></span>
        </div>
      </div>
    </div>
  );
}
