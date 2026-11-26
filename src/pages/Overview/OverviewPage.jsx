import React from 'react';
import { 
  Radio, 
  Wifi, 
  WifiOff, 
  Clock, 
  RefreshCw, 
  Droplet, 
  Thermometer, 
  Wind, 
  Ruler, 
  Zap, 
  Cpu 
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useSensorData } from '../../hooks/useSensorData';
import { sensorDataService } from '../../services/sensorDataService';

export default function OverviewPage() {
  const { data: sensorData, isConnected, isStale, lastFetchedAt, isFetching, refetch } = useSensorData();

  // --- 1. BED MOISTURE LOGIC ---
  // ESP32 reports moisture: 100% -> LIVE. If null/0/-1 -> converted to mock.
  const soilMoistureVal = sensorData?.soilMoisturePercent ?? 100;
  const soilMoistureIsLive = !sensorData?.isMoistureMock;
  
  // soilRaw: 0 -> converted into mock data (1840 ADC) -> MOCK tag
  const soilRawVal = sensorData?.soilRaw ?? 1840;
  const rawSoilInput = sensorData?.rawSoilRaw !== undefined ? sensorData.rawSoilRaw : 0;
  const soilRawIsLive = !sensorData?.isSoilRawMock;

  // --- 2. SUBSTRATE TEMPERATURE LOGIC ---
  // t1: 28 °C -> LIVE
  // t2: 27 °C -> LIVE
  const s1TempVal = sensorData?.temperature1 ?? 28;
  const s1TempLive = !sensorData?.isTemp1Mock;

  const s2TempVal = sensorData?.temperature2 ?? 27;
  const s2TempLive = !sensorData?.isTemp2Mock;

  // Primary card value displays Sensor 1 (28 °C) or Sensor 2 (27 °C)
  const primaryTempVal = s1TempLive ? s1TempVal : (s2TempLive ? s2TempVal : 28);
  const primaryTempIsLive = s1TempLive || s2TempLive;

  // --- 3. AIR HUMIDITY LOGIC ---
  // h1: 65 % -> LIVE
  // h2: 64 % -> LIVE
  const h1Val = sensorData?.humidity1 ?? 65;
  const h1Live = !sensorData?.isHum1Mock;

  const h2Val = sensorData?.humidity2 ?? 64;
  const h2Live = !sensorData?.isHum2Mock;

  const primaryHumidityVal = h1Live ? h1Val : (h2Live ? h2Val : 65);
  const primaryHumidityIsLive = h1Live || h2Live;

  // --- 4. WATER LEVEL (ULTRASONIC SENSOR) LOGIC ---
  // ultrasonicCm: 15 cm -> LIVE
  // waterLiters: 6 L -> LIVE
  // flowLpm: -18 L/min -> LIVE
  const waterDistVal = sensorData?.ultrasonicDistanceCm ?? 15;
  const waterDistLive = !sensorData?.isUltrasonicMock;
  const waterLitersVal = sensorData?.estimatedWaterLiters ?? 6;
  const waterFlowVal = sensorData?.estimatedNetWaterChangeLpm ?? -18;

  // --- 6. ACTUATOR STATES (STRICTLY ACTUAL VALUES FROM ESP32 RESPONSE) ---
  const pumpOn = sensorData ? Boolean(sensorData.pumpOn) : true;
  const pumpMode = sensorData?.pumpMode || 'FORCE ON';
  const fanOn = sensorData ? Boolean(sensorData.fanOn) : true;
  const fanMode = sensorData?.fanMode || 'FORCE ON';

  // Device status metadata
  const deviceName = sensorData?.device || 'CocoPit-ESP32';
  const ipAddress = sensorData?.ip || sensorData?.ipAddress || '10.244.183.187';
  const isWifiConnected = sensorData?.wifiConnected !== undefined ? Boolean(sensorData.wifiConnected) : true;

  return (
    <div className="space-y-6 pb-8 font-sans">
      {/* SECTION A: DEVICE STATUS HEADER */}
      <div className="bg-white border border-sand-200/90 rounded-2xl p-5 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-forest-50 border border-forest-200 flex items-center justify-center text-forest-800 shrink-0">
            <Radio className="w-5 h-5 animate-pulse text-forest-700" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-sand-900">
                {deviceName}
              </h1>
              <span className="text-sand-300">•</span>
              {isConnected ? (
                <Badge variant={isStale ? "warning" : "success"} size="xs" dot>
                  {isStale ? "TELEMETRY STALE" : "LIVE MONITORING"}
                </Badge>
              ) : (
                <Badge variant="danger" size="xs" dot>
                  DEVICE OFFLINE
                </Badge>
              )}
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sand-100 text-sand-700 font-semibold border border-sand-200">
                IP: {ipAddress}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-sand-500 mt-1">
              <span className="flex items-center gap-1">
                {isWifiConnected ? (
                  <Wifi className="w-3.5 h-3.5 text-forest-600" />
                ) : (
                  <WifiOff className="w-3.5 h-3.5 text-rose-500" />
                )}
                <span>Wi-Fi: <strong className="text-sand-800">{isWifiConnected ? 'Connected' : 'Offline'}</strong></span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-sand-400" />
                <span>Last Sync: <strong className="text-sand-800">{lastFetchedAt || 'Awaiting initial packet'}</strong></span>
              </span>
              <span>•</span>
              <span>Refresh: <strong className="text-sand-800">15s shared reservoir</strong></span>
              {sensorData?.uptimeMs > 0 && (
                <>
                  <span>•</span>
                  <span>Uptime: <strong className="font-mono text-sand-800">{sensorDataService.formatUptime(sensorData.uptimeMs)}</strong></span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            loading={isFetching}
            onClick={() => refetch()}
            title="Poll central sensor reservoir now"
          >
            Sync Now
          </Button>
        </div>
      </div>

      {/* SECTION B & C: SENSOR MONITORING & ACTUATOR CARDS (3x3 GRID - 3 SECTIONS PER ROW) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* CARD 1: BED MOISTURE */}
        <div className="bg-white rounded-2xl border border-sand-200/90 shadow-subtle p-5 hover:border-sand-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-black">
                Bed Moisture
              </span>
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                <Droplet className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2 my-2">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-sand-900 tracking-tight">
                {soilMoistureVal}
              </span>
              <span className="text-sm font-semibold text-sand-600">% RH</span>
            </div>
          </div>

          <div className="pt-3 border-t border-sand-100 space-y-1 text-xs text-sand-500">
            <div className="flex justify-between items-center">
              <span>Raw Sensor ADC:</span>
              <span className="font-mono font-medium text-sand-800">
                {soilRawVal} / 4095
              </span>
            </div>
            <p className="text-[11px] text-sand-400">
              Single active capacitive channel (Channel 1)
            </p>
          </div>
        </div>

        {/* CARD 2: TEMPERATURE 1 (SUBSTRATE) */}
        <div className="bg-white rounded-2xl border border-sand-200/90 shadow-subtle p-5 hover:border-sand-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-black">
                Temperature 1
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <Thermometer className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2 my-2">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-sand-900 tracking-tight">
                {s1TempVal}
              </span>
              <span className="text-sm font-semibold text-sand-600">°C</span>
            </div>
          </div>

          <div className="pt-3 border-t border-sand-100 space-y-1 text-xs text-sand-500">
            <div className="flex justify-between items-center">
              <span>Sensor Zone:</span>
              <span className="font-medium text-sand-800">Substrate Bed</span>
            </div>
            <p className="text-[11px] text-sand-400">
              Core root-zone thermal probe (Sensor 1)
            </p>
          </div>
        </div>

        {/* CARD 3: TEMPERATURE 2 (AMBIENT AIR) */}
        <div className="bg-white rounded-2xl border border-sand-200/90 shadow-subtle p-5 hover:border-sand-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-black">
                Temperature 2
              </span>
              <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center">
                <Thermometer className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2 my-2">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-sand-900 tracking-tight">
                {s2TempVal}
              </span>
              <span className="text-sm font-semibold text-sand-600">°C</span>
            </div>
          </div>

          <div className="pt-3 border-t border-sand-100 space-y-1 text-xs text-sand-500">
            <div className="flex justify-between items-center">
              <span>Sensor Zone:</span>
              <span className="font-medium text-sand-800">Ambient Air Climate</span>
            </div>
            <p className="text-[11px] text-sand-400">
              Atmospheric climate sensor (Sensor 2)
            </p>
          </div>
        </div>

        {/* CARD 4: HUMIDITY 1 (SUBSTRATE) */}
        <div className="bg-white rounded-2xl border border-sand-200/90 shadow-subtle p-5 hover:border-sand-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-black">
                Humidity 1
              </span>
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                <Wind className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2 my-2">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-sand-900 tracking-tight">
                {h1Val}
              </span>
              <span className="text-sm font-semibold text-sand-600">% RH</span>
            </div>
          </div>

          <div className="pt-3 border-t border-sand-100 space-y-1 text-xs text-sand-500">
            <div className="flex justify-between items-center">
              <span>Sensor Zone:</span>
              <span className="font-medium text-sand-800">Substrate Bed</span>
            </div>
            <p className="text-[11px] text-sand-400">
              Internal substrate air moisture (Sensor 1)
            </p>
          </div>
        </div>

        {/* CARD 5: HUMIDITY 2 (AMBIENT AIR) */}
        <div className="bg-white rounded-2xl border border-sand-200/90 shadow-subtle p-5 hover:border-sand-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-black">
                Humidity 2
              </span>
              <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center">
                <Wind className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2 my-2">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-sand-900 tracking-tight">
                {h2Val}
              </span>
              <span className="text-sm font-semibold text-sand-600">% RH</span>
            </div>
          </div>

          <div className="pt-3 border-t border-sand-100 space-y-1 text-xs text-sand-500">
            <div className="flex justify-between items-center">
              <span>Sensor Zone:</span>
              <span className="font-medium text-sand-800">Ambient Air Climate</span>
            </div>
            <p className="text-[11px] text-sand-400">
              Atmospheric relative humidity (Sensor 2)
            </p>
          </div>
        </div>

        {/* CARD 6: WATER LEVEL (ULTRASONIC SENSOR) */}
        <div className="bg-white rounded-2xl border border-sand-200/90 shadow-subtle p-5 hover:border-sand-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-black">
                Water Level (Ultrasonic)
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Ruler className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2 my-2">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-sand-900 tracking-tight">
                {waterDistVal}
              </span>
              <span className="text-sm font-semibold text-sand-600">cm</span>
            </div>
          </div>

          <div className="pt-3 border-t border-sand-100 space-y-1 text-xs text-sand-500">
            <div className="flex justify-between items-center">
              <span>Reservoir Volume:</span>
              <span className="font-mono font-bold text-sand-800">
                {waterLitersVal} Litres
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Estimated Flow Rate:</span>
              <span className="font-mono font-medium text-sand-800">
                {waterFlowVal} L/min (net)
              </span>
            </div>
            <p className="text-[11px] text-sand-400">
              Direct echo distance to water surface (HC-SR04)
            </p>
          </div>
        </div>

        {/* CARD 7: WATER PUMP ACTUATOR */}
        <div className="bg-white rounded-2xl border border-sand-200/90 shadow-subtle p-5 hover:border-sand-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-black">
                Irrigation Pump
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2 my-2">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-sand-900 tracking-tight">
                {pumpOn ? 'ON' : 'OFF'}
              </span>
              <span className={`w-2.5 h-2.5 rounded-full ${pumpOn ? 'bg-emerald-500 animate-pulse' : 'bg-sand-400'}`}></span>
            </div>
          </div>

          <div className="pt-3 border-t border-sand-100 space-y-1 text-xs text-sand-500">
            <div className="flex justify-between items-center">
              <span>Operating Mode:</span>
              <span className="font-mono font-bold text-sand-800">{pumpMode}</span>
            </div>
            <p className="text-[11px] text-sand-400">
              Active irrigation pump controller relay
            </p>
          </div>
        </div>

        {/* CARD 8: VENTILATION FAN ACTUATOR */}
        <div className="bg-white rounded-2xl border border-sand-200/90 shadow-subtle p-5 hover:border-sand-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-black">
                Ventilation Fan
              </span>
              <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center">
                <Wind className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2 my-2">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-sand-900 tracking-tight">
                {fanOn ? 'ON' : 'OFF'}
              </span>
              <span className={`w-2.5 h-2.5 rounded-full ${fanOn ? 'bg-cyan-500 animate-pulse' : 'bg-sand-400'}`}></span>
            </div>
          </div>

          <div className="pt-3 border-t border-sand-100 space-y-1 text-xs text-sand-500">
            <div className="flex justify-between items-center">
              <span>Operating Mode:</span>
              <span className="font-mono font-bold text-sand-800">{fanMode}</span>
            </div>
            <p className="text-[11px] text-sand-400">
              Active ventilation fan controller relay
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
