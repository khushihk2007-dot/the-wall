import React from 'react';
import { 
  Droplet, 
  Thermometer, 
  CloudRain, 
  Ruler, 
  MapPin, 
  CheckCircle2, 
  Info,
  Clock
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';

export function SensorOverview({ snapshot, installation, device }) {
  if (!snapshot || !installation) {
    return (
      <Card>
        <div className="p-8 text-center text-sand-500">
          <Info className="w-8 h-8 mx-auto mb-2 text-sand-400" />
          <p className="font-medium text-sand-700">No installation selected</p>
          <p className="text-sm">Please select a growing bed installation above to monitor telemetry.</p>
        </div>
      </Card>
    );
  }

  const isConnected = snapshot.isConnected;
  const moisture = snapshot.moisture || {};
  const ch1 = moisture.channel1 || {};
  const bedTemp = snapshot.bedTemperature || {};
  const env = snapshot.environment || {};
  const ultrasonic = snapshot.ultrasonic || {};
  const gps = snapshot.gps || {};

  return (
    <div className="space-y-6">
      {/* Transparency & Hardware Status Notice */}
      <div className="bg-sand-50 border border-sand-300 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 text-amber-800 rounded-lg mt-0.5 md:mt-0">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sand-900 text-sm">Hardware Prototype Specification Notice</span>
              <Badge variant="warning" size="xs">SIMULATED DEMO DATA</Badge>
              <Badge variant="neutral" size="xs">ESP32 Prototype v1</Badge>
            </div>
            <p className="text-xs text-sand-600 mt-0.5">
              Physical field prototype is equipped with <strong>only one capacitive soil moisture channel</strong> (Channel 1: Top Layer Substrate). 
              Channels 2 (Bottom Layer) &amp; 3 (Root-Zone Soil) are hardware-pending and explicitly unpopulated.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-sand-600 bg-white px-3 py-1.5 rounded-lg border border-sand-200 shrink-0">
          <Clock className="w-3.5 h-3.5 text-sand-400" />
          <span>Telemetery: {snapshot.lastUpdated}</span>
        </div>
      </div>

      {/* Primary Soil Moisture Telemetry (3-Channel Distinction) */}
      <Card
        title="Growing Bed Soil Moisture Spectrum"
        subtitle="Multi-depth moisture monitoring. Channel 1 probe active; expansion channels pending physical assembly."
        action={
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Badge variant="success" size="sm" dot>
                {device?.id || 'Gateway Connected'}
              </Badge>
            ) : (
              <Badge variant="danger" size="sm" dot>
                {device ? 'Device Disconnected' : 'No Gateway Assigned'}
              </Badge>
            )}
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Channel 1: Top Layer (Active) */}
          <div className={`p-4 rounded-xl border transition-all ${
            isConnected 
              ? 'bg-forest-50/50 border-forest-200' 
              : 'bg-sand-50 border-sand-200 opacity-60'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-forest-100 flex items-center justify-center text-forest-700">
                  <Droplet className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-sand-900">Channel 1</h4>
                  <p className="text-xs text-sand-500">Top Layer Substrate</p>
                </div>
              </div>
              <Badge variant={isConnected ? 'success' : 'neutral'} size="xs">
                {ch1.status || 'Offline'}
              </Badge>
            </div>

            <div className="my-2">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-forest-900 tracking-tight">
                  {ch1.value !== null && ch1.value !== undefined ? ch1.value : '--'}
                </span>
                <span className="text-sm font-medium text-forest-700">% RH</span>
              </div>
              <div className="flex items-center justify-between text-xs text-sand-500 mt-2 pt-2 border-t border-forest-100">
                <span>Raw ADC (12-bit):</span>
                <span className="font-mono font-medium text-sand-700">
                  {ch1.rawAdc !== null && ch1.rawAdc !== undefined ? `${ch1.rawAdc} / 4095` : 'N/A'}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-forest-800 bg-forest-100/60 p-2 rounded-lg mt-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-forest-600 shrink-0" />
              <span>Calibrated 2-point capacitive probe</span>
            </div>
          </div>

          {/* Channel 2: Bottom Layer Coir Buffer (Not Connected) */}
          <div className="p-4 rounded-xl border border-sand-200 bg-sand-50/80">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sand-200 flex items-center justify-center text-sand-500">
                  <Droplet className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-sand-700">Channel 2</h4>
                  <p className="text-xs text-sand-500">Bottom Layer Coir Buffer</p>
                </div>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-sand-200 text-sand-700 border border-sand-300">
                Not Connected
              </span>
            </div>

            <div className="my-2">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-sand-400 tracking-tight">--</span>
                <span className="text-sm font-medium text-sand-400">% RH</span>
              </div>
              <div className="flex items-center justify-between text-xs text-sand-400 mt-2 pt-2 border-t border-sand-200">
                <span>Raw ADC:</span>
                <span className="font-mono text-sand-400">Unconnected</span>
              </div>
            </div>

            <div className="text-[11px] text-sand-600 bg-white/80 p-2 rounded-lg mt-3 border border-sand-200">
              <span className="font-medium text-sand-700">Hardware Pending:</span> Probe expansion planned for multi-layer v2 hardware revision.
            </div>
          </div>

          {/* Channel 3: Root-Zone Ground Soil (Not Connected) */}
          <div className="p-4 rounded-xl border border-sand-200 bg-sand-50/80">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sand-200 flex items-center justify-center text-sand-500">
                  <Droplet className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-sand-700">Channel 3</h4>
                  <p className="text-xs text-sand-500">Root-Zone Ground Soil</p>
                </div>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-sand-200 text-sand-700 border border-sand-300">
                Not Connected
              </span>
            </div>

            <div className="my-2">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-sand-400 tracking-tight">--</span>
                <span className="text-sm font-medium text-sand-400">% RH</span>
              </div>
              <div className="flex items-center justify-between text-xs text-sand-400 mt-2 pt-2 border-t border-sand-200">
                <span>Raw ADC:</span>
                <span className="font-mono text-sand-400">Unconnected</span>
              </div>
            </div>

            <div className="text-[11px] text-sand-600 bg-white/80 p-2 rounded-lg mt-3 border border-sand-200">
              <span className="font-medium text-sand-700">Elevated Bed:</span> Bed raised on benching table; ground soil probe not physically wired.
            </div>
          </div>
        </div>
      </Card>

      {/* Environmental & Auxiliary Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Core Bed Temperature */}
        <div className="bg-white border border-sand-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-sand-500">Substrate Temp</span>
            <div className="w-7 h-7 rounded-lg bg-earth-50 text-earth-700 flex items-center justify-center">
              <Thermometer className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-2xl font-bold text-sand-900">
              {bedTemp.value !== null && bedTemp.value !== undefined ? bedTemp.value : '--'}
            </span>
            <span className="text-sm font-medium text-sand-600">°C</span>
          </div>
          <div className="flex items-center justify-between text-xs mt-3 pt-2 border-t border-sand-100">
            <span className="text-sand-500">Sensor: DS18B20 OneWire</span>
            <span className="font-medium text-forest-700">{bedTemp.status || 'Optimal'}</span>
          </div>
        </div>

        {/* Ambient Air Climate */}
        <div className="bg-white border border-sand-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-sand-500">Ambient Air</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <CloudRain className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between my-1">
            <div>
              <span className="text-2xl font-bold text-sand-900">
                {env.airTemp !== null && env.airTemp !== undefined ? env.airTemp : '--'}
              </span>
              <span className="text-xs font-medium text-sand-600 ml-0.5">°C</span>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-sand-800">
                {env.humidity !== null && env.humidity !== undefined ? env.humidity : '--'}
              </span>
              <span className="text-xs font-medium text-sand-600 ml-0.5">% RH</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs mt-3 pt-2 border-t border-sand-100">
            <span className="text-sand-500">Sensor: SHT30 I2C</span>
            <span className="font-medium text-sand-700">{env.status || 'Active'}</span>
          </div>
        </div>

        {/* Ultrasonic Depth Sensor */}
        <div className="bg-white border border-sand-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-sand-500">Ultrasonic Distance</span>
            <div className="w-7 h-7 rounded-lg bg-sand-100 text-sand-700 flex items-center justify-center">
              <Ruler className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-2xl font-bold text-sand-900">
              {ultrasonic.distanceCm !== null && ultrasonic.distanceCm !== undefined ? ultrasonic.distanceCm : '--'}
            </span>
            <span className="text-sm font-medium text-sand-600">cm</span>
          </div>
          <p className="text-[11px] text-amber-700 bg-amber-50 rounded px-1.5 py-0.5 mt-2 border border-amber-200">
            Distance only. Tank litres require geometry config.
          </p>
        </div>

        {/* GPS Telemetry */}
        <div className="bg-white border border-sand-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-sand-500">GPS Telemetry</span>
            <div className="w-7 h-7 rounded-lg bg-sand-100 text-sand-700 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="my-1">
            <div className="text-xs font-semibold text-sand-900 truncate">
              {gps.hasFix ? `${gps.latitude}°, ${gps.longitude}°` : 'Searching for Fix...'}
            </div>
            <div className="text-[11px] text-sand-500 flex items-center gap-1 mt-0.5">
              <span>Fix: {gps.status || 'Offline'}</span>
              {gps.accuracyMeters && <span>(±{gps.accuracyMeters}m)</span>}
            </div>
          </div>
          <p className="text-[10px] text-sand-500 mt-2 pt-2 border-t border-sand-100 truncate">
            {gps.note || 'Simulated demonstration GPS coordinate.'}
          </p>
        </div>
      </div>
    </div>
  );
}
