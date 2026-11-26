import React from 'react';
import { 
  Droplet, 
  Thermometer, 
  CloudRain, 
  Ruler, 
  MapPin, 
  CheckCircle2, 
  Info,
  Clock,
  Radio,
  Zap,
  Wind
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { useSensorData } from '../../../hooks/useSensorData';
import { useDataSourceFilter } from '../../../hooks/useDataSourceFilter';
import { DataSourceBadge } from '../../../components/common/DataSourceBadge';
import { DATA_SOURCES, SOURCE_TYPES } from '../../../constants/dataSourceTypes';

export function SensorOverview({ snapshot, installation, device }) {
  const { data: sensorData, isConnected, isStale, lastFetchedAt } = useSensorData();
  const { isRealOnly, isDemoOnly } = useDataSourceFilter();

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

  // Live sensor readings mapped cleanly with strict hardware validation
  const isSoilValid = sensorData && sensorData.soilValid;
  const liveSoilPct = isSoilValid ? sensorData.soilMoisturePercent : null;
  const liveSoilRaw = sensorData ? sensorData.soilRaw : null;

  const temp1 = sensorData && sensorData.dht1Valid && sensorData.temperature1 !== null ? sensorData.temperature1 : null;
  const temp2 = sensorData && sensorData.dht2Valid && sensorData.temperature2 !== null ? sensorData.temperature2 : null;
  const hum1 = sensorData && sensorData.dht1Valid && sensorData.humidity1 !== null ? sensorData.humidity1 : null;
  const hum2 = sensorData && sensorData.dht2Valid && sensorData.humidity2 !== null ? sensorData.humidity2 : null;

  const isUltrasonicValid = sensorData && sensorData.ultrasonicValid;
  const ultrasonicDist = isUltrasonicValid ? sensorData.ultrasonicDistanceCm : null;
  const rainDetected = sensorData ? Boolean(sensorData.rainDetected) : false;
  const pumpOn = sensorData ? Boolean(sensorData.pumpOn) : false;
  const fanOn = sensorData ? Boolean(sensorData.fanOn) : false;
  const pumpMode = sensorData?.pumpMode || 'AUTO';
  const fanMode = sensorData?.fanMode || 'AUTO';

  const hasGpsFix = Boolean(sensorData && sensorData.gpsValid && sensorData.latitude != null && sensorData.longitude != null);

  return (
    <div className="space-y-6">
      {/* Transparency & Hardware Status Notice */}
      <div className="bg-sand-50 border border-sand-300 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-forest-100 text-forest-800 rounded-lg mt-0.5 md:mt-0">
            <Radio className="w-5 h-5 text-forest-700 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sand-900 text-sm">Central ESP32 Telemetry Reservoir</span>
              {isConnected ? (
                <Badge variant={isStale ? "warning" : "success"} size="xs" dot>
                  {isStale ? "STALE TELEMETRY" : "ONLINE"}
                </Badge>
              ) : (
                <Badge variant="danger" size="xs" dot>
                  HARDWARE DISCONNECTED
                </Badge>
              )}
              <Badge variant="neutral" size="xs">{sensorData?.device || 'ESP32 Node'}</Badge>
              {sensorData?.ipAddress && (
                <span className="text-[10px] font-mono text-sand-500 bg-white px-2 py-0.5 rounded border border-sand-200">
                  {sensorData.ipAddress}
                </span>
              )}
            </div>
            <p className="text-xs text-sand-600 mt-0.5">
              Physical node provides <strong>one capacitive moisture channel</strong>. Wi-Fi: {sensorData?.wifiConnected ? 'Active' : 'Offline'} • 15s shared reservoir polling.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-sand-600 bg-white px-3 py-1.5 rounded-lg border border-sand-200 shrink-0">
          <Clock className="w-3.5 h-3.5 text-sand-400" />
          <span>Last sync: {lastFetchedAt || 'Awaiting first poll'}</span>
        </div>
      </div>

      {/* Primary Soil Moisture Telemetry (Only Channel 1 Active on Hardware) */}
      <Card
        title="Growing Bed Soil Moisture Spectrum"
        subtitle="Channel 1 capacitive probe active. Expansion channels 2 & 3 explicitly unpopulated on current hardware."
        action={
          <div className="flex items-center gap-2">
            {isDemoOnly ? (
              <DataSourceBadge source={DATA_SOURCES.DEMO} sourceType={SOURCE_TYPES.MOCK} size="sm" />
            ) : isConnected ? (
              <DataSourceBadge source={DATA_SOURCES.REAL} sourceType={SOURCE_TYPES.ESP32} size="sm" />
            ) : (
              <DataSourceBadge source={DATA_SOURCES.UNAVAILABLE} size="sm" />
            )}
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Channel 1: Top Layer (Active) */}
          <div className={`p-4 rounded-xl border transition-all ${
            isConnected 
              ? 'bg-forest-50/50 border-forest-200' 
              : 'bg-sand-50 border-sand-200 opacity-70'
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
              <Badge 
                variant={
                  isSoilValid 
                    ? 'success' 
                    : isConnected && liveSoilRaw === 0 
                      ? 'warning' 
                      : 'neutral'
                } 
                size="xs"
              >
                {isSoilValid 
                  ? 'Active' 
                  : isConnected && liveSoilRaw === 0 
                    ? 'Zero / Uncalibrated' 
                    : 'Offline'}
              </Badge>
            </div>

            <div className="my-2">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-forest-900 tracking-tight">
                  {isSoilValid ? liveSoilPct : '—'}
                </span>
                <span className="text-sm font-medium text-forest-700">% RH</span>
              </div>
              <div className="flex items-center justify-between text-xs text-sand-500 mt-2 pt-2 border-t border-forest-100">
                <span>Raw ADC (12-bit):</span>
                <span className="font-mono font-medium text-sand-700">
                  {liveSoilRaw !== null ? `${liveSoilRaw} / 4095` : 'N/A'}
                  {liveSoilRaw === 0 && ' (Zero)'}
                </span>
              </div>
            </div>

            <div className={`text-[11px] p-2 rounded-lg mt-3 flex items-center gap-1.5 ${
              isSoilValid 
                ? 'text-forest-800 bg-forest-100/60' 
                : isConnected && liveSoilRaw === 0
                  ? 'text-amber-800 bg-amber-50 border border-amber-200'
                  : 'text-sand-600 bg-sand-100'
            }`}>
              <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${
                isSoilValid ? 'text-forest-600' : isConnected && liveSoilRaw === 0 ? 'text-amber-600' : 'text-sand-400'
              }`} />
              <span>
                {isSoilValid 
                  ? 'Calibrated capacitive soil moisture probe' 
                  : isConnected && liveSoilRaw === 0 
                    ? 'Probe raw ADC is 0; awaiting calibration or substrate contact (NOT 100%)' 
                    : 'Awaiting sensor connection'}
              </span>
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
              <span className="font-medium text-sand-700">Hardware Notice:</span> Current prototype has only one confirmed soil moisture channel.
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
              <span className="font-medium text-sand-700">Hardware Notice:</span> Secondary ground probe unpopulated. Zero fabricated readings.
            </div>
          </div>
        </div>
      </Card>

      {/* Environmental & Auxiliary Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Core Substrate / Bed Temperature */}
        <div className="bg-white border border-sand-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-black">Temperature 1</span>
            <div className="w-7 h-7 rounded-lg bg-earth-50 text-earth-700 flex items-center justify-center">
              <Thermometer className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-2xl font-bold text-sand-900">
              {temp1 !== null ? temp1 : '--'}
            </span>
            <span className="text-sm font-medium text-sand-600">°C</span>
          </div>
          <div className="flex items-center justify-between text-xs mt-3 pt-2 border-t border-sand-100">
            <span className="text-sand-500">Humidity 1: {hum1 !== null ? `${hum1}%` : '--'}</span>
            <span className="font-medium text-forest-700">
              {sensorData?.dht1Valid ? 'DHT1 Valid' : isConnected ? 'Check DHT1' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Ambient Air Climate (Temperature 2 & Humidity 2) */}
        <div className="bg-white border border-sand-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-black">Temperature 2</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <CloudRain className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between my-1">
            <div>
              <span className="text-2xl font-bold text-sand-900">
                {temp2 !== null ? temp2 : '--'}
              </span>
              <span className="text-xs font-medium text-sand-600 ml-0.5">°C</span>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-sand-800">
                {hum2 !== null ? hum2 : '--'}
              </span>
              <span className="text-xs font-medium text-sand-600 ml-0.5">% RH</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs mt-3 pt-2 border-t border-sand-100">
            <span className="text-sand-500">Rain: {rainDetected ? 'Rain Active' : 'Clear'}</span>
            <span className="font-medium text-sand-700">
              {sensorData?.dht2Valid ? 'DHT2 Valid' : isConnected ? 'Check DHT2' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Ultrasonic Depth Sensor */}
        <div className="bg-white border border-sand-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-black">Ultrasonic Distance</span>
            <div className="w-7 h-7 rounded-lg bg-sand-100 text-sand-700 flex items-center justify-center">
              <Ruler className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-2xl font-bold text-sand-900">
              {isUltrasonicValid && ultrasonicDist !== null ? ultrasonicDist : '--'}
            </span>
            <span className="text-sm font-medium text-sand-600">cm</span>
          </div>
          <p className={`text-[11px] rounded px-1.5 py-0.5 mt-2 border ${
            isUltrasonicValid 
              ? 'text-forest-700 bg-forest-50 border-forest-200' 
              : 'text-amber-700 bg-amber-50 border-amber-200'
          }`}>
            {isUltrasonicValid && sensorData && sensorData.estimatedWaterLiters != null
              ? `Est. water volume: ${sensorData.estimatedWaterLiters.toLocaleString()} L`
              : 'Ultrasonic sensor timeout (-1) / No echo (awaiting active surface)'}
          </p>
        </div>

        {/* GPS Telemetry (Location ONLY when valid) */}
        <div className="bg-white border border-sand-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-black">GPS Location</span>
            <div className="w-7 h-7 rounded-lg bg-sand-100 text-sand-700 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="my-1">
            <div className="text-xs font-semibold text-sand-900 truncate font-mono">
              {hasGpsFix
                ? `${sensorData.latitude.toFixed(5)}°, ${sensorData.longitude.toFixed(5)}°`
                : 'Searching for Fix...'}
            </div>
            <div className="text-[11px] text-sand-500 flex items-center gap-1 mt-0.5">
              <span>Status: {hasGpsFix ? 'Satellite Locked' : 'GPS Offline / In Building'}</span>
            </div>
          </div>
          <p className="text-[10px] text-sand-500 mt-2 pt-2 border-t border-sand-100 truncate">
            {hasGpsFix ? 'Verified real-time satellite coordinates' : 'No fake GPS location invented'}
          </p>
        </div>
      </div>

      {/* Actuators & Hardware Control States */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Pump State */}
        <div className="p-3.5 rounded-xl bg-sand-50 border border-sand-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg ${pumpOn ? 'bg-emerald-100 text-emerald-800' : 'bg-sand-200 text-sand-600'}`}>
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sand-900 block">Irrigation Pump: {pumpOn ? 'RUNNING' : 'STANDBY'}</span>
              <span className="text-[11px] text-sand-500">Operating Mode: {pumpMode}</span>
            </div>
          </div>
          <Badge variant={pumpOn ? 'success' : 'neutral'} size="xs">
            {pumpOn ? 'Energized' : 'Inactive'}
          </Badge>
        </div>

        {/* Fan State */}
        <div className="p-3.5 rounded-xl bg-sand-50 border border-sand-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg ${fanOn ? 'bg-cyan-100 text-cyan-800' : 'bg-sand-200 text-sand-600'}`}>
              <Wind className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sand-900 block">Ventilation Fan: {fanOn ? 'RUNNING' : 'STANDBY'}</span>
              <span className="text-[11px] text-sand-500">Operating Mode: {fanMode}</span>
            </div>
          </div>
          <Badge variant={fanOn ? 'success' : 'neutral'} size="xs">
            {fanOn ? 'Energized' : 'Inactive'}
          </Badge>
        </div>
      </div>
    </div>
  );
}
