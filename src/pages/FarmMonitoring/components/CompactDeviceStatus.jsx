import React from 'react';
import { Cpu, Clock } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';

export function CompactDeviceStatus({ device, snapshot, installation }) {
  const isEspConnected = Boolean(device && device.connectionStatus === 'Connected');
  const isSensorConnected = Boolean(isEspConnected && snapshot?.moisture?.channel1?.isConnected);
  const deviceId = device?.id || installation?.deviceId || 'No Gateway';
  const lastUpdated = device?.lastCommunication || snapshot?.lastUpdated || 'Never';

  return (
    <div className="bg-white border border-sand-200 rounded-xl p-3.5 shadow-xs flex flex-col justify-between h-full">
      {/* Header with Title, Demo Status, and ESP32 Status */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-sand-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-forest-100 flex items-center justify-center text-forest-800 shrink-0">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-sand-900">Device Status</span>
              <Badge variant="neutral" size="xs">DEMO STATUS</Badge>
            </div>
            <span className="text-[11px] text-sand-500 font-mono block">
              Device ID: <strong className="text-sand-800">{deviceId}</strong>
            </span>
          </div>
        </div>

        <div className="text-right">
          <Badge variant={isEspConnected ? 'success' : 'danger'} size="xs" dot>
            ESP32: {isEspConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>
      </div>

      {/* Sensor Status and Last Data Received */}
      <div className="pt-2 flex items-center justify-between gap-2 text-xs flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-sand-500">Sensor:</span>
          <Badge variant={isSensorConnected ? 'success' : 'neutral'} size="xs" dot>
            {isSensorConnected ? 'Connected' : 'Disconnected'}
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
