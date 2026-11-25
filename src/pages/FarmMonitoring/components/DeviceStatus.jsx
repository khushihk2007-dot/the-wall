import React, { useState } from 'react';
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

export function DeviceStatus({ devices = [], installations = [], farms = [] }) {
  const [selectedDevice, setSelectedDevice] = useState(devices[0] || null);
  const [pingStatus, setPingStatus] = useState(null);

  const handlePing = (deviceId) => {
    setPingStatus({ deviceId, message: 'Heartbeat acknowledged (24ms latency)' });
    setTimeout(() => {
      setPingStatus(null);
    }, 3500);
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
              <Badge variant="success" size="xs">PROTOTYPE READY</Badge>
              <Badge variant="neutral" size="xs">FIRMWARE v1.2.0-rc2</Badge>
            </div>
            <p className="text-xs text-sand-600 mt-0.5">
              Microcontroller gateways transmit sensor telemetry over Wi-Fi / MQTT. The current physical prototype connects one analog moisture probe. Expansion channels are reserved.
            </p>
          </div>
        </div>
      </div>

      {pingStatus && (
        <div className="p-3 bg-forest-50 border border-forest-200 text-forest-800 rounded-xl text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-forest-600" />
            <span>Pinged <strong>{pingStatus.deviceId}</strong>: {pingStatus.message}</span>
          </div>
          <span className="text-[10px] text-forest-600 uppercase tracking-wider font-semibold">Simulated Gateway Ping</span>
        </div>
      )}

      {/* Gateway Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Cards List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-sand-900 uppercase tracking-wider">Registered ESP32 Field Nodes</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {devices.map((device) => {
              const isSelected = selectedDevice?.id === device.id;
              const isConnected = device.connectionStatus === 'Connected';
              const isUnstable = device.connectionStatus === 'Unstable';

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
                      <span className="text-xs font-mono text-sand-500">{device.id}</span>
                    </div>
                    <Badge
                      variant={isConnected ? 'success' : isUnstable ? 'warning' : 'danger'}
                      size="xs"
                      dot
                    >
                      {device.connectionStatus}
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
                      <span className="text-sand-500">Signal (RSSI):</span>
                      <span className="font-mono text-sand-800 flex items-center gap-1">
                        {isConnected ? (
                          <>
                            <Wifi className="w-3 h-3 text-forest-600" />
                            {device.signalStrength || '-62 dBm'}
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
                      <span className="text-sand-500">Battery:</span>
                      <span className="text-sand-800">{device.batteryLevel || 'External 5V USB'}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-sand-100 flex items-center justify-between">
                    <span className="text-[11px] text-sand-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {device.lastCommunication}
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
            })}
          </div>
        </div>

        {/* Selected Gateway Detail & Pinout Specs */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-sand-900 uppercase tracking-wider">Gateway Configuration</h3>
          
          {selectedDevice ? (
            <Card
              title={selectedDevice.name}
              subtitle={`Node Architecture: ${selectedDevice.hardwareModel || 'ESP32-WROOM-32'}`}
            >
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-sand-50 rounded-lg space-y-1.5 border border-sand-200">
                  <div className="flex justify-between">
                    <span className="text-sand-500">Node ID:</span>
                    <span className="font-mono font-bold text-sand-800">{selectedDevice.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sand-500">Firmware:</span>
                    <span className="font-mono text-sand-800">{selectedDevice.firmwareVersion || 'v1.2.0-rc2'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sand-500">MAC Address:</span>
                    <span className="font-mono text-sand-800">{selectedDevice.macAddress || '24:6F:28:A1:8B:20'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sand-500">Uptime:</span>
                    <span className="text-sand-800">14 days, 6 hours</span>
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
