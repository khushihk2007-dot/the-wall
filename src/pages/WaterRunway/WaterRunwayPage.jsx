import React, { useState, useMemo } from 'react';
import { 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle,
  Plus,
  Sliders
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { waterService } from '../../services/waterService';
import { farmService } from '../../services/farmService';

import { WaterStorageVisualizer } from './components/WaterStorageVisualizer';
import { WaterRunwaySummary } from './components/WaterRunwaySummary';
import { WaterUsageTable } from './components/WaterUsageTable';
import { RecordUsageModal } from './components/RecordUsageModal';
import { TankConfigModal } from './components/TankConfigModal';

export default function WaterRunwayPage() {
  const [tanks, setTanks] = useState(() => waterService.getTanks());
  const [usageRecords, setUsageRecords] = useState(() => waterService.getUsageRecords());
  const [selectedTankId, setSelectedTankId] = useState(() => {
    const list = waterService.getTanks();
    return list.length > 0 ? list[0].id : 'TANK-001';
  });

  const [farms] = useState(() => farmService.getFarms());
  const [installations] = useState(() => farmService.getInstallations());

  // Modal states
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState(null);

  const showNotice = (msg) => {
    setNoticeMessage(msg);
    setTimeout(() => setNoticeMessage(null), 3500);
  };

  // Currently selected tank
  const selectedTank = useMemo(() => {
    return tanks.find((t) => t.id === selectedTankId) || tanks[0] || null;
  }, [tanks, selectedTankId]);

  // Filtered usage records for selected tank
  const selectedTankUsage = useMemo(() => {
    if (!selectedTank) return [];
    return usageRecords.filter((r) => r.tankId === selectedTank.id);
  }, [usageRecords, selectedTank]);

  // Metrics and runway calculation for selected tank
  const metrics = useMemo(() => {
    if (!selectedTank) {
      return {
        isCalibrated: false,
        telemetry: { isConnected: false, deviceStatus: 'None', distanceCm: null, lastUpdated: 'Never' },
        rawDistanceCm: null,
        waterDepthCm: null,
        waterLevelPct: null,
        availableLitres: null,
        totalCapacityLitres: 0,
        status: 'Uncalibrated',
        averageDailyConsumptionLitres: 0,
        totalRecordedUsageLitres: 0,
        runwayDays: null,
        isInsufficientData: true,
        activeDaysCount: 0,
        usageCount: 0,
        statusMessage: '',
      };
    }
    return waterService.calculateTankMetrics(selectedTank, selectedTankUsage);
  }, [selectedTank, selectedTankUsage]);

  // Handlers
  const handleSaveUsage = (data) => {
    const res = waterService.addUsageRecord(data);
    setUsageRecords(res.all);
    showNotice(`Recorded ${data.amountLitres} L for ${data.purpose}.`);
  };

  const handleClearUsageHistory = () => {
    if (window.confirm(`Clear all consumption history for ${selectedTank.name}? This will demonstrate the 'Insufficient data' state.`)) {
      const updated = waterService.clearUsageRecords(selectedTank.id);
      setUsageRecords(updated);
      showNotice(`Usage history cleared for ${selectedTank.name}.`);
    }
  };

  const handleSaveTankConfig = (updatedData) => {
    const res = waterService.updateTank(selectedTank.id, updatedData);
    setTanks(res.all);
    showNotice(`Geometry and thresholds updated for ${res.tank.name}.`);
  };

  const handleResetDemoData = () => {
    if (window.confirm('Reset all water tanks, calibration states, and manual usage logs to factory defaults?')) {
      const fresh = waterService.resetAllDemoData();
      setTanks(fresh.tanks);
      setUsageRecords(fresh.usage);
      setSelectedTankId(fresh.tanks[0]?.id || 'TANK-001');
      showNotice('All Water Runway demo data reset.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Water Runway"
        description="Monitor reservoir storage, track manual water usage, and calculate estimated remaining days of water supply."
        breadcrumbs={['The Wall', 'Water Runway']}
        badge={<Badge variant="forest" size="sm" dot>Water Management v1.0</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RotateCcw}
              onClick={handleResetDemoData}
              title="Reset all water demo data"
            >
              Reset Demo Data
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsRecordModalOpen(true)}
            >
              Record Water Usage
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

      {/* Status Alert Banner (When Low or Critical) with Conservation Recommendations */}
      {selectedTank && (metrics.status === 'Critical' || metrics.status === 'Critical Water') && (
        <div className="p-4 bg-red-50 border-l-4 border-red-600 rounded-xl text-red-900 shadow-xs space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold">Critical – Water Scarcity Alert</h4>
                  <Badge variant="danger" size="xs">Scarcity Protocol Active</Badge>
                </div>
                <p className="text-xs text-red-700 mt-0.5">
                  {selectedTank.name} is currently at <strong>{metrics.waterLevelPct}%</strong> ({metrics.availableLitres?.toLocaleString()} L), falling below the configured critical threshold of {selectedTank.criticalThresholdPct || 15}%.
                </p>
              </div>
            </div>
            <Button
              size="xs"
              variant="outline"
              icon={Sliders}
              onClick={() => setIsConfigModalOpen(true)}
              className="border-red-300 text-red-800 hover:bg-red-100 shrink-0"
            >
              Adjust Thresholds
            </Button>
          </div>

          {/* Conservation Recommendations */}
          {metrics.recommendations && metrics.recommendations.length > 0 && (
            <div className="pt-2 border-t border-red-200/80">
              <span className="text-xs font-semibold text-red-950 block mb-1">
                Water Conservation Recommendations:
              </span>
              <ul className="text-xs text-red-800 space-y-1 list-disc list-inside">
                {metrics.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {selectedTank && (metrics.status === 'Low' || metrics.status === 'Low Water') && (
        <div className="p-4 bg-amber-50 border-l-4 border-amber-600 rounded-xl text-amber-900 shadow-xs space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold">Low – Water Conservation Warning</h4>
                  <Badge variant="warning" size="xs">Conservation Advised</Badge>
                </div>
                <p className="text-xs text-amber-800 mt-0.5">
                  {selectedTank.name} is at <strong>{metrics.waterLevelPct}%</strong> capacity ({metrics.availableLitres?.toLocaleString()} L), reaching the low water threshold of {selectedTank.lowThresholdPct || 30}%.
                </p>
              </div>
            </div>
            <Button
              size="xs"
              variant="outline"
              icon={Sliders}
              onClick={() => setIsConfigModalOpen(true)}
              className="border-amber-300 text-amber-800 hover:bg-amber-100 shrink-0"
            >
              Adjust Thresholds
            </Button>
          </div>

          {/* Conservation Recommendations */}
          {metrics.recommendations && metrics.recommendations.length > 0 && (
            <div className="pt-2 border-t border-amber-200/80">
              <span className="text-xs font-semibold text-amber-950 block mb-1">
                Water Conservation Recommendations:
              </span>
              <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
                {metrics.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Main Focus: 2 Balanced Cards */}
      {selectedTank && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left Card: Storage & Level Visualisation */}
          <WaterStorageVisualizer
            tank={selectedTank}
            metrics={metrics}
            onOpenConfigModal={() => setIsConfigModalOpen(true)}
          />

          {/* Right Card: Water Runway Projection */}
          <WaterRunwaySummary
            metrics={metrics}
            onOpenRecordModal={() => setIsRecordModalOpen(true)}
            onClearUsageHistory={handleClearUsageHistory}
          />
        </div>
      )}

      {/* Bottom Section: Water Consumption History Table */}
      <WaterUsageTable
        usageRecords={selectedTankUsage}
        totalUsageLitres={metrics.totalRecordedUsageLitres}
      />

      {/* Record Usage Modal */}
      {isRecordModalOpen && selectedTank && (
        <RecordUsageModal
          key={`${selectedTank.id}-record-modal`}
          isOpen={isRecordModalOpen}
          onClose={() => setIsRecordModalOpen(false)}
          tank={selectedTank}
          farms={farms}
          installations={installations}
          onSave={handleSaveUsage}
        />
      )}

      {/* Tank Geometry & Thresholds Config Modal */}
      {isConfigModalOpen && selectedTank && (
        <TankConfigModal
          key={`${selectedTank.id}-config-modal`}
          isOpen={isConfigModalOpen}
          onClose={() => setIsConfigModalOpen(false)}
          tank={selectedTank}
          onSave={handleSaveTankConfig}
        />
      )}
    </div>
  );
}
