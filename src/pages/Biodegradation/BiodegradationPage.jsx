import React, { useState, useMemo } from 'react';
import { 
  FlaskConical, 
  TrendingDown, 
  RotateCcw, 
  CheckCircle2 
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { biodegradationService } from '../../services/biodegradationService';
import { DataSourceFilter } from '../../components/common/DataSourceFilter';
import { useDataSourceFilter } from '../../hooks/useDataSourceFilter';
import { DATA_SOURCES, SOURCE_TYPES } from '../../constants/dataSourceTypes';

import { SampleList } from './components/SampleList';
import { SampleFormModal } from './components/SampleFormModal';
import { StatusChangeModal } from './components/StatusChangeModal';
import { SampleDetails } from './components/SampleDetails';
import { ObservationFormModal } from './components/ObservationFormModal';
import { BiodegradationCharts } from './components/BiodegradationCharts';

export default function BiodegradationPage() {
  const { filterRecords } = useDataSourceFilter();
  const [samples, setSamples] = useState(() => biodegradationService.getSamples());
  const [observations, setObservations] = useState(() => biodegradationService.getAllObservations());
  const [activeTab, setActiveTab] = useState('samples');

  const displayedSamples = useMemo(() => filterRecords(samples, 'bio_sample'), [samples, filterRecords]);

  // Currently focused sample for details view
  const [selectedSampleId, setSelectedSampleId] = useState(null);

  // Modals state
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);
  const [editingSample, setEditingSample] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusTargetSample, setStatusTargetSample] = useState(null);
  const [isObsModalOpen, setIsObsModalOpen] = useState(false);
  const [obsTargetSample, setObsTargetSample] = useState(null);

  const [noticeMessage, setNoticeMessage] = useState(null);

  // Selected sample object
  const selectedSample = useMemo(() => {
    if (!selectedSampleId) return null;
    return samples.find((s) => s.id === selectedSampleId) || null;
  }, [samples, selectedSampleId]);

  // Observations for selected sample
  const selectedSampleObservations = useMemo(() => {
    if (!selectedSampleId) return [];
    return observations.filter((o) => o.sampleId === selectedSampleId);
  }, [observations, selectedSampleId]);

  const showNotice = (msg) => {
    setNoticeMessage(msg);
    setTimeout(() => setNoticeMessage(null), 3500);
  };

  // Sample Handlers
  const handleOpenCreateSample = () => {
    setEditingSample(null);
    setIsSampleModalOpen(true);
  };

  const handleEditSample = (sample) => {
    setEditingSample(sample);
    setIsSampleModalOpen(true);
  };

  const handleSaveSample = (data) => {
    if (editingSample) {
      const res = biodegradationService.updateSample(editingSample.id, data);
      setSamples(res.all);
      showNotice(`Specimen ${res.sample.id} updated.`);
    } else {
      const payload = {
        ...data,
        isUserCreated: true,
        dataSource: DATA_SOURCES.REAL,
        sourceType: SOURCE_TYPES.MANUAL_ENTRY,
      };
      const res = biodegradationService.createSample(payload);
      setSamples(res.all);
      // Refresh observations as baseline observation was automatically generated
      setObservations(biodegradationService.getAllObservations());
      showNotice(`Specimen ${res.sample.id} registered with baseline Day 0 measurement.`);
    }
  };

  // Status Lifecycle Handlers
  const handleOpenStatusModal = (sample) => {
    setStatusTargetSample(sample);
    setIsStatusModalOpen(true);
  };

  const handleConfirmStatus = (sampleId, newStatus, reasonNotes, updatedBy) => {
    const res = biodegradationService.updateSampleStatus(sampleId, newStatus, reasonNotes, updatedBy);
    setSamples(res.all);
    showNotice(`Specimen ${sampleId} transitioned to ${newStatus}.`);
  };

  // Observation Handlers
  const handleOpenRecordObs = (sample) => {
    setObsTargetSample(sample || selectedSample);
    setIsObsModalOpen(true);
  };

  const handleSaveObservation = (data) => {
    if (!obsTargetSample) return;
    const res = biodegradationService.addObservation(obsTargetSample.id, data);
    setObservations(biodegradationService.getAllObservations());
    showNotice(`New observation logged for ${obsTargetSample.id} (${res.observation.massLossPct}% mass loss).`);
  };

  // Reset Demo Data
  const handleResetDemoData = () => {
    if (window.confirm('Reset all biodegradation specimens and measurement logs to factory defaults?')) {
      const fresh = biodegradationService.resetAllDemoData();
      setSamples(fresh.samples);
      setObservations(fresh.observations);
      setSelectedSampleId(null);
      showNotice('All Biodegradation monitoring demo records reset.');
    }
  };

  const tabs = [
    { id: 'samples', label: 'Specimen Registry & Observations', icon: FlaskConical, count: samples.length },
    { id: 'analytics', label: 'Degradation Analytics', icon: TrendingDown },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Biodegradation Monitoring"
        description="Empirical laboratory and field mass-loss tracking comparing natural fibre decomposition kinetics over time."
        breadcrumbs={['The Wall', 'Biodegradation']}
        badge={<Badge variant="forest" size="sm" dot>Empirical Research v1.0</Badge>}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <DataSourceFilter size="sm" />
            <Button
              variant="outline"
              size="sm"
              icon={RotateCcw}
              onClick={handleResetDemoData}
              title="Reset all demo research records"
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
                onClick={() => {
                  setActiveTab(tab.id);
                }}
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
        {/* TAB 1: SPECIMEN REGISTRY & OBSERVATIONS */}
        {activeTab === 'samples' && (
          <div>
            {selectedSampleId && selectedSample ? (
              <SampleDetails
                sample={selectedSample}
                observations={selectedSampleObservations}
                onBack={() => setSelectedSampleId(null)}
                onOpenRecordObs={() => handleOpenRecordObs(selectedSample)}
                onOpenStatusModal={() => handleOpenStatusModal(selectedSample)}
                onOpenEditModal={() => handleEditSample(selectedSample)}
              />
            ) : (
              <SampleList
                samples={displayedSamples}
                onSelectSample={(sample) => setSelectedSampleId(sample.id)}
                onOpenRegisterModal={handleOpenCreateSample}
              />
            )}
          </div>
        )}

        {/* TAB 2: CHARTS & ANALYTICS */}
        {activeTab === 'analytics' && (
          <BiodegradationCharts
            samples={displayedSamples}
            observations={observations}
          />
        )}
      </div>

      {/* Sample Form Modal */}
      {isSampleModalOpen && (
        <SampleFormModal
          key={editingSample?.id || 'new-sample'}
          isOpen={isSampleModalOpen}
          onClose={() => setIsSampleModalOpen(false)}
          sample={editingSample}
          onSave={handleSaveSample}
        />
      )}

      {/* Status Lifecycle Modal */}
      {isStatusModalOpen && statusTargetSample && (
        <StatusChangeModal
          key={statusTargetSample.id}
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          sample={statusTargetSample}
          onConfirm={handleConfirmStatus}
        />
      )}

      {/* Record Observation Modal */}
      {isObsModalOpen && obsTargetSample && (
        <ObservationFormModal
          key={`${obsTargetSample.id}-new-obs`}
          isOpen={isObsModalOpen}
          onClose={() => setIsObsModalOpen(false)}
          sample={obsTargetSample}
          onSave={handleSaveObservation}
        />
      )}
    </div>
  );
}
