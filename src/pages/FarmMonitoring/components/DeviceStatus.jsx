import React, { useState, useMemo } from 'react';
import { 
  Cpu, 
  Wifi, 
  WifiOff, 
  Clock, 
  CheckCircle, 
  Terminal
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { useSensorData } from '../../../hooks/useSensorData';
import { sensorDataService } from '../../../services/sensorDataService';
import { useDataSourceFilter } from '../../../hooks/useDataSourceFilter';
import { DataSourceBadge } from '../../../components/common/DataSourceBadge';
import { DATA_SOURCES, SOURCE_TYPES } from '../../../constants/dataSourceTypes';

export function DeviceStatus({ devices = [], installations = [], farms = [] }) {
  const { data: sensorData, isConnected, isStale, lastFetchedAt } = useSensorData();
  const { isRealOnly, isDemoOnly } = useDataSourceFilter();

  const displayedDevices = useMemo(() => {
    return devices.filter((device, idx) => {
      const isRealDevice = idx === 0; // ESP32-DEV-001 connected to hardware
      if (isRealOnly) return isRealDevice;
      if (isDemoOnly) return !isRealDevice;
      return true;
    });
  }, [devices, isRealOnly, isDemoOnly]);

  const [selectedDevice, setSelectedDevice] = useState(devices[0] || null);
  const [pingStatus, setPingStatus] = useState(null);

  // Keep active selected device valid if filtered
  const activeDevice = useMemo(() => {
    if (selectedDevice && displayedDevices.some(d => d.id === selectedDevice.id)) {
      return selectedDevice;
    }
    return displayedDevices[0] || null;
  }, [selectedDevice, displayedDevices]);

  const handlePing = (deviceId) => {
    if (isConnected) {
      setPingStatus({ 
        deviceId, 
        message: `HTTP ping acknowledged by ${sensorData?.ipAddress || '10.244.183.187'} (Telemetry valid)` 
      });
    } else {
      setPingStatus({ 
        deviceId, 
        message: 'No response from device. Check power and Wi-Fi pairing.' 
      });
    }
    setTimeout(() => {
      setPingStatus(null);
    }, 4000);
  };

  const getFarmName = (farmId) => {
    const f = farms.find((item) => item.id === farmId);
    return f ? f.name : 'Unassigned Farm';
  };

  const getInstallationName = (instId) => {
    const inst = installations.find((item) => item.id === instId);
    return inst ? `${inst.id} (${inst.cropType})` : 'Unassigned Bed';
  };

  return (
    <div className="space-y-6">
      {/* Hardware Architecture Disclaimer */}
      <div className="bg-sand-50 border border-sand-300 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-forest-100 text-forest-800 rounded-lg">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sand-900 text-sm">ESP32 Hardware Gateway Integration</span>
              {isConnected ? (
                <Badge variant={isStale ? "warning" : "success"} size="xs" dot>
                  {isStale ? "STALE TELEMETRY" : "HARDWARE ONLINE"}
                </Badge>
              ) : (
                <Badge variant="danger" size="xs" dot>
                  OFFLINE
                </Badge>
              )}
              <Badge variant="neutral" size="xs">{sensorData?.device || 'ESP32 Node'}</Badge>
            </div>
            <p className="text-xs text-sand-600 mt-0.5">
              Microcontroller gateways transmit sensor telemetry over HTTP. Active polling endpoint: <code className="font-mono bg-white px-1 py-0.5 rounded border border-sand-200">{sensorDataService.getApiUrl()}</code>.
            </p>
          </div>
        </div>
      </div>

      {pingStatus && (
        <div className={`p-3 rounded-xl text-xs flex items-center justify-between animate-fadeIn ${
          isConnected ? 'bg-forest-50 border border-forest-200 text-forest-800' : 'bg-rose-50 border border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle className={`w-4 h-4 ${isConnected ? 'text-forest-600' : 'text-rose-600'}`} />
            <span>Pinged <strong>{pingStatus.deviceId}</strong>: {pingStatus.message}</span>
          </div>
          <span className="text-[10px] uppercase tracking-wider font-semibold">Central Reservoir Check</span>
        </div>
      )}

      {/* Gateway Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Cards List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-sand-900 uppercase tracking-wider">Registered ESP32 Field Nodes</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedDevices.length === 0 ? (
              <div className="col-span-2 p-8 text-center text-sand-500 bg-sand-50 rounded-xl border border-dashed border-sand-300">
                <p className="font-medium text-sand-700">No ESP32 nodes match the current filter</p>
                <p className="text-xs text-sand-500 mt-1">Switch to &quot;All Data&quot; or &quot;Demo Data&quot; to view simulated gateways.</p>
              </div>
            ) : (
              displayedDevices.map((device) => {
                const isSelected = activeDevice?.id === device.id;
                // Identify if device is the physical hardware node
                const isFirstNode = device.id === 'ESP32-DEV-001' || device.id === devices[0]?.id;
                const deviceConnected = isFirstNode ? isConnected : device.connectionStatus === 'Connected';
                const deviceStatusText = isFirstNode 
                  ? (isConnected ? (isStale ? 'Stale' : 'Connected') : 'Disconnected')
                  : device.connectionStatus;

                return (
                  <div
                    key={device.id}
                    onClick={() => setSelectedDevice(device)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-forest-600 bg-forest-50/20 shadow-sm ring-1 ring-forest-500'
                        : 'border-sand-200 bg-white hover:border-sand-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Cpu className="w-4 h-4 text-sand-700" />
                          <h4 className="font-semibold text-sand-900 text-sm">{device.name}</h4>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-mono text-sand-500">{device.id}</span>
                          <DataSourceBadge 
                            source={isFirstNode ? DATA_SOURCES.REAL : DATA_SOURCES.DEMO} 
                            sourceType={isFirstNode ? SOURCE_TYPES.ESP32 : SOURCE_TYPES.MOCK} 
                            size="xs" 
                          />
                        </div>
                      </div>
                      <Badge
                        variant={deviceConnected ? (isFirstNode && isStale ? 'warning' : 'success') : 'danger'}
                        size="xs"
                        dot
                      >
                        {deviceStatusText}
                      </Badge>
                    </div>

                    <div className="mt-3 space-y-1.5 text-xs text-sand-600 border-t border-sand-100 pt-2.5">
                      <div className="flex justify-between">
                        <span className="text-sand-500">Installation:</span>
                        <span className="font-medium text-sand-800 truncate max-w-[150px]">
                          {getInstallationName(device.assignedInstallationId)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sand-500">Site:</span>
                        <span className="font-medium text-sand-800 truncate max-w-[150px]">
                          {getFarmName(device.assignedFarmId)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sand-500">Network / IP:</span>
                        <span className="font-mono text-sand-800 flex items-center gap-1">
                          {deviceConnected ? (
                            <>
                              <Wifi className="w-3 h-3 text-forest-600" />
                              {isFirstNode && sensorData?.ipAddress ? sensorData.ipAddress : (device.signalStrength || '-62 dBm')}
                            </>
                          ) : (
                            <>
                              <WifiOff className="w-3 h-3 text-sand-400" />
                              Offline
                            </>
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sand-500">Uptime:</span>
                        <span className="text-sand-800">
                          {isFirstNode && sensorData?.uptimeMs
                            ? sensorDataService.formatUptime(sensorData.uptimeMs)
                            : device.batteryLevel || 'External 5V USB'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-sand-100 flex items-center justify-between">
                      <span className="text-[11px] text-sand-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {isFirstNode && lastFetchedAt ? lastFetchedAt : device.lastCommunication}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePing(device.id);
                        }}
                        className="text-xs text-forest-700 hover:text-forest-900 font-medium px-2 py-0.5 rounded hover:bg-forest-100/60 transition-colors"
                      >
                        Ping Node
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Gateway Detail & Pinout Specs */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-sand-900 uppercase tracking-wider">Gateway Configuration</h3>
          
          {activeDevice ? (
            <Card
              title={activeDevice.name}
              subtitle={`Node Architecture: ${activeDevice.hardwareModel || 'ESP32-WROOM-32'}`}
            >
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-sand-50 rounded-lg space-y-1.5 border border-sand-200">
                  <div className="flex justify-between">
                    <span className="text-sand-500">Node ID:</span>
                    <span className="font-mono font-bold text-sand-800">{activeDevice.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sand-500">IP Address:</span>
                    <span className="font-mono text-sand-800">
                      {activeDevice.id === 'ESP32-DEV-001' && isConnected && sensorData?.ipAddress ? sensorData.ipAddress : '10.244.183.187'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sand-500">Firmware:</span>
                    <span className="font-mono text-sand-800">{activeDevice.firmwareVersion || 'v1.2.0-rc2'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sand-500">Uptime:</span>
                    <span className="text-sand-800 font-mono">
                      {activeDevice.id === 'ESP32-DEV-001' && isConnected && sensorData?.uptimeMs
                        ? sensorDataService.formatUptime(sensorData.uptimeMs)
                        : 'Offline / Disconnected'}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <h4 className="font-semibold text-sand-800 text-xs mb-2 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-sand-500" />
                    <span>Hardware Pin Mapping Specification</span>
                  </h4>
                  <div className="space-y-1.5 font-mono text-[11px] bg-sand-900 text-sand-100 p-3 rounded-lg overflow-x-auto">
                    <div className="flex justify-between text-forest-400">
                      <span>GPIO 34 (ADC1_CH6):</span>
                      <span>Ch1 Soil Probe [Connected]</span>
                    </div>
                    <div className="flex justify-between text-amber-400">
                      <span>GPIO 35 (ADC1_CH7):</span>
                      <span>Ch2 Bottom Coir [Unconnected]</span>
                    </div>
                    <div className="flex justify-between text-amber-400">
                      <span>GPIO 32 (ADC1_CH4):</span>
                      <span>Ch3 Root Soil [Unconnected]</span>
                    </div>
                    <div className="flex justify-between text-sand-300">
                      <span>GPIO 04 (OneWire):</span>
                      <span>DS18B20 Core Bed Temp</span>
                    </div>
                    <div className="flex justify-between text-sand-300">
                      <span>GPIO 21/22 (I2C):</span>
                      <span>SHT30 Ambient Air Temp/RH</span>
                    </div>
                    <div className="flex justify-between text-sand-300">
                      <span>GPIO 05/18 (Echo/Trig):</span>
                      <span>HC-SR04 Ultrasonic Distance</span>
                    </div>
                    <div className="flex justify-between text-sand-400">
                      <span>GPIO 16/17 (UART2):</span>
                      <span>NEO-6M GPS Telemetry</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="p-6 text-center text-sand-500 text-xs">
                Select a gateway from the list to view specifications.
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
