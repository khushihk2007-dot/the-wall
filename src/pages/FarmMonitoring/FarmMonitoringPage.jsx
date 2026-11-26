import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  Layers, 
  Cpu, 
  RotateCcw, 
  CheckCircle2 
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { farmService } from '../../services/farmService';
import { useSensorData } from '../../hooks/useSensorData';
import { DataSourceFilter } from '../../components/common/DataSourceFilter';

import { InstallationList } from './components/InstallationList';
import { InstallationModal } from './components/InstallationModal';
import { SensorOverview } from './components/SensorOverview';
import { SensorCharts } from './components/SensorCharts';
import { DeviceStatus } from './components/DeviceStatus';

export default function FarmMonitoringPage() {
  const { isConnected, isStale, lastFetchedAt } = useSensorData();
  const [farms, setFarms] = useState(() => farmService.getFarms());
  const [installations, setInstallations] = useState(() => farmService.getInstallations());
  const [devices, setDevices] = useState(() => farmService.getDevices());
  const [alerts, setAlerts] = useState(() => farmService.getAlerts());
  const [calibrations, setCalibrations] = useState(() => farmService.getCalibrations());

  // Active sub-tab
  const [activeTab, setActiveTab] = useState('telemetry');

  // Selected installation for live monitoring
  const [selectedInstallationId, setSelectedInstallationId] = useState(
    () => installations[0]?.id || 'INST-001'
  );

  // Modals state
  const [isInstModalOpen, setIsInstModalOpen] = useState(false);
  const [editingInst, setEditingInst] = useState(null);
  const [noticeMessage, setNoticeMessage] = useState(null);

  // Selected installation and device details
  const selectedInstallation = useMemo(() => {
    return installations.find((i) => i.id === selectedInstallationId) || installations[0];
  }, [installations, selectedInstallationId]);

  const selectedDevice = useMemo(() => {
    if (!selectedInstallation || !selectedInstallation.deviceId) return null;
    return devices.find((d) => d.id === selectedInstallation.deviceId) || null;
  }, [selectedInstallation, devices]);

  // Selected snapshot
  const liveSnapshot = useMemo(() => {
    if (!selectedInstallation) return null;
    return farmService.getLiveSnapshot(selectedInstallation.id, selectedInstallation.deviceId);
  }, [selectedInstallation]);

  // Selected farm details
  const currentFarm = useMemo(() => {
    if (!selectedInstallation) return null;
    return farms.find((f) => f.id === selectedInstallation.farmId);
  }, [selectedInstallation, farms]);

  // Handlers for Installations
  const handleOpenCreateInst = () => {
    setEditingInst(null);
    setIsInstModalOpen(true);
  };

  const handleEditInst = (inst) => {
    setEditingInst(inst);
    setIsInstModalOpen(true);
  };

  const handleSaveInst = (data) => {
    if (editingInst) {
      const res = farmService.updateInstallation(editingInst.id, data);
      setInstallations(res.all);
      showNotice(`Installation ${res.installation.id} updated.`);
    } else {
      const res = farmService.createInstallation(data);
      setInstallations(res.all);
      showNotice(`Growing bed ${res.installation.id} registered.`);
    }
  };

  const showNotice = (msg) => {
    setNoticeMessage(msg);
    setTimeout(() => setNoticeMessage(null), 4000);
  };

  const handleResetDemoData = () => {
    if (window.confirm('Reset all farm, installation, device, and alert records to factory demo defaults?')) {
      const fresh = farmService.resetAllDemoData();
      setFarms(fresh.farms);
      setInstallations(fresh.installations);
      setDevices(fresh.devices);
      setAlerts(fresh.alerts);
      setCalibrations(fresh.calibrations);
      setSelectedInstallationId(fresh.installations[0]?.id || 'INST-001');
      showNotice('All Farm Monitoring demo records reset to initial state.');
    }
  };

  const tabs = [
    { id: 'telemetry', label: 'Live Telemetry & Trends', icon: Activity },
    { id: 'installations', label: 'Bed Deployments', icon: Layers, count: installations.length },
    { id: 'devices', label: 'ESP32 Gateways', icon: Cpu, count: devices.length },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Smart Farm Monitoring"
        description="Multi-zone growing-bed telemetry, microclimate trends, ESP32 gateway health, and post-deployment farm operations."
        breadcrumbs={['The Wall', 'Smart Farm Monitoring']}
        badge={
          <div className="flex items-center gap-1.5">
            <Badge variant={isConnected ? (isStale ? "warning" : "success") : "danger"} size="sm" dot>
              {isConnected ? (isStale ? `Stale (${lastFetchedAt || 'Check node'})` : "ESP32 Online") : "ESP32 Offline"}
            </Badge>
          </div>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <DataSourceFilter size="sm" />
            <Button
              variant="outline"
              size="sm"
              icon={RotateCcw}
              onClick={handleResetDemoData}
              title="Reset simulated records to factory defaults"
            >
              Reset Demo Data
            </Button>
          </div>
        }
      />

      {/* Notification Toast */}
      {noticeMessage && (
        <div className="p-3 bg-forest-50 border border-forest-200 text-forest-800 rounded-xl text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-forest-600" />
            <span>{noticeMessage}</span>
          </div>
        </div>
      )}

      {/* Sub-navigation Tabs */}
      <div className="border-b border-sand-200">
        <nav className="flex space-x-1 sm:space-x-3 overflow-x-auto pb-1" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-forest-800 text-white shadow-xs font-semibold'
                    : 'text-sand-600 hover:text-sand-900 hover:bg-sand-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-forest-700 text-white'
                        : tab.isAlert
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-sand-200 text-sand-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'telemetry' && (
          <div className="space-y-6">
            <SensorOverview
              snapshot={liveSnapshot}
              installation={selectedInstallation}
              device={selectedDevice}
            />
            <SensorCharts
              installation={selectedInstallation}
              device={selectedDevice}
            />
          </div>
        )}

        {activeTab === 'installations' && (
          <InstallationList
            installations={installations}
            farms={farms}
            onSelectInstallation={(inst) => {
              setSelectedInstallationId(inst.id);
              setActiveTab('telemetry');
            }}
            onEditInstallation={handleEditInst}
            onOpenCreateInstallation={handleOpenCreateInst}
          />
        )}

        {activeTab === 'devices' && (
          <DeviceStatus
            devices={devices}
            installations={installations}
            farms={farms}
          />
        )}
      </div>

      {/* Installation Modal */}
      {isInstModalOpen && (
        <InstallationModal
          key={editingInst?.id || 'new-inst'}
          isOpen={isInstModalOpen}
          onClose={() => setIsInstModalOpen(false)}
          onSave={handleSaveInst}
          installation={editingInst}
          farms={farms}
          devices={devices}
        />
      )}
    </div>
  );
}
