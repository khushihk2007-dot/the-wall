import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  Layers, 
  Sprout, 
  Cpu, 
  Sliders, 
  Bell, 
  RotateCcw, 
  CheckCircle2 
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { farmService } from '../../services/farmService';

import { FarmList } from './components/FarmList';
import { FarmFormModal } from './components/FarmFormModal';
import { InstallationList } from './components/InstallationList';
import { InstallationModal } from './components/InstallationModal';
import { SensorOverview } from './components/SensorOverview';
import { SensorCharts } from './components/SensorCharts';
import { DeviceStatus } from './components/DeviceStatus';
import { CompactDeviceStatus } from './components/CompactDeviceStatus';
import { ThresholdSettings } from './components/ThresholdSettings';
import { CalibrationPanel } from './components/CalibrationPanel';
import { FarmAlerts } from './components/FarmAlerts';

export default function FarmMonitoringPage() {
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
  const [isFarmModalOpen, setIsFarmModalOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState(null);
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

  // Handlers for Farms
  const handleOpenCreateFarm = () => {
    setEditingFarm(null);
    setIsFarmModalOpen(true);
  };

  const handleEditFarm = (farm) => {
    setEditingFarm(farm);
    setIsFarmModalOpen(true);
  };

  const handleSaveFarm = (data) => {
    if (editingFarm) {
      const res = farmService.updateFarm(editingFarm.id, data);
      setFarms(res.all);
      showNotice(`Farm ${res.farm.name} updated successfully.`);
    } else {
      const res = farmService.createFarm(data);
      setFarms(res.all);
      showNotice(`New farm ${res.farm.name} registered.`);
    }
  };

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

  const activeAlertsCount = alerts.filter((a) => a.status === 'Active').length;

  const tabs = [
    { id: 'telemetry', label: 'Live Telemetry & Trends', icon: Activity },
    { id: 'installations', label: 'Bed Deployments', icon: Layers, count: installations.length },
    { id: 'farms', label: 'Farms & Sites', icon: Sprout, count: farms.length },
    { id: 'devices', label: 'ESP32 Gateways', icon: Cpu, count: devices.length },
    { id: 'thresholds', label: 'Thresholds & Calibration', icon: Sliders },
    { id: 'alerts', label: 'Field Alerts', icon: Bell, count: activeAlertsCount, isAlert: activeAlertsCount > 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Smart Farm Monitoring"
        description="Multi-zone growing-bed telemetry, microclimate trends, ESP32 gateway health, and post-deployment farm operations."
        breadcrumbs={['The Wall', 'Smart Farm Monitoring']}
        badge={<Badge variant="success" size="sm" dot>Telemetry Active</Badge>}
        actions={
          <div className="flex items-center gap-2">
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

      {/* Target Bed Selector & Compact Device Status Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        {/* Active Bed Target Selector */}
        <div className="bg-white border border-sand-200 rounded-xl p-3.5 shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-forest-100 flex items-center justify-center text-forest-800 shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-sand-900">Active Bed Target</div>
              <div className="text-[11px] text-sand-500">
                Site: <span className="font-medium text-sand-800">{currentFarm?.name || 'Local Farm'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <label htmlFor="bed-selector" className="text-xs font-medium text-sand-600 whitespace-nowrap">
              Select Bed:
            </label>
            <select
              id="bed-selector"
              value={selectedInstallationId}
              onChange={(e) => setSelectedInstallationId(e.target.value)}
              className="w-full text-xs font-medium py-1.5 px-3 rounded-lg border border-sand-300 bg-sand-50/50 text-sand-900 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-forest-600"
            >
              {installations.map((inst) => {
                const farm = farms.find((f) => f.id === inst.farmId);
                return (
                  <option key={inst.id} value={inst.id}>
                    {inst.id} — {inst.cropType} ({farm ? farm.name : 'Farm'}) [{inst.deviceId || 'No Gateway'}]
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Compact Device Status Card */}
        <CompactDeviceStatus
          device={selectedDevice}
          snapshot={liveSnapshot}
          installation={selectedInstallation}
        />
      </div>

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

        {activeTab === 'farms' && (
          <FarmList
            farms={farms}
            installations={installations}
            onSelectFarm={(farm) => {
              // Find first installation of this farm
              const firstInst = installations.find((i) => i.farmId === farm.id);
              if (firstInst) setSelectedInstallationId(firstInst.id);
              setActiveTab('telemetry');
            }}
            onEditFarm={handleEditFarm}
            onOpenCreateFarm={handleOpenCreateFarm}
          />
        )}

        {activeTab === 'devices' && (
          <DeviceStatus
            devices={devices}
            installations={installations}
            farms={farms}
          />
        )}

        {activeTab === 'thresholds' && (
          <div className="space-y-6">
            <ThresholdSettings />
            <CalibrationPanel
              calibrations={calibrations}
              onCalibrationAdded={(newCal) => {
                setCalibrations((prev) => [newCal, ...prev]);
                showNotice(`Calibration entry ${newCal.id} logged.`);
              }}
            />
          </div>
        )}

        {activeTab === 'alerts' && (
          <FarmAlerts
            alerts={alerts}
            onAlertUpdated={(updatedList) => {
              setAlerts(updatedList);
              showNotice('Alert status updated.');
            }}
          />
        )}
      </div>

      {/* Farm Form Modal */}
      {isFarmModalOpen && (
        <FarmFormModal
          key={editingFarm?.id || 'new-farm'}
          isOpen={isFarmModalOpen}
          onClose={() => setIsFarmModalOpen(false)}
          onSave={handleSaveFarm}
          farm={editingFarm}
        />
      )}

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
