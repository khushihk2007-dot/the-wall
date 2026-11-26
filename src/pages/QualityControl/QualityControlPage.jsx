import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Plus, RotateCcw, Check } from 'lucide-react';

import { QualityKPIs } from './components/QualityKPIs';
import { GradingCriteriaSection } from './components/GradingCriteriaSection';
import { QualityDistributionChart } from './components/QualityDistributionChart';
import { QualityTestTable } from './components/QualityTestTable';
import { CreateTestModal } from './components/CreateTestModal';
import { TestDetailsModal } from './components/TestDetailsModal';

import { qualityService } from '../../services/qualityService';
import { criteriaService } from '../../services/criteriaService';
import { manufacturingService } from '../../services/manufacturingService';
import { DataSourceFilter } from '../../components/common/DataSourceFilter';
import { useDataSourceFilter } from '../../hooks/useDataSourceFilter';
import { DATA_SOURCES, SOURCE_TYPES } from '../../constants/dataSourceTypes';

export default function QualityControlPage() {
  const { filterRecords } = useDataSourceFilter();
  const [tests, setTests] = useState(() => qualityService.getTests());
  const [activeCriteria, setActiveCriteria] = useState(() => criteriaService.getActiveCriteria());
  const [selectedTest, setSelectedTest] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [batchesList, setBatchesList] = useState(() => manufacturingService.getCachedBatches());

  const displayedTests = useMemo(() => filterRecords(tests, 'qc'), [tests, filterRecords]);

  useEffect(() => {
    manufacturingService.getBatches().then((data) => setBatchesList(data)).catch(() => {});
  }, []);

  // Batches for selection in test creation
  const batches = useMemo(() => {
    if (!tests) return [];
    return qualityService.getAvailableBatches(batchesList);
  }, [tests, batchesList]);

  // Selected batch information for details modal
  const selectedBatchInfo = useMemo(() => {
    if (!selectedTest) return null;
    const allBatches = manufacturingService.getCachedBatches();
    return allBatches.find((b) => b.id === selectedTest.batchId) || null;
  }, [selectedTest]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleCreateTest = (data) => {
    const payload = {
      ...data,
      isUserCreated: true,
      dataSource: DATA_SOURCES.REAL,
      sourceType: SOURCE_TYPES.MANUAL_ENTRY,
    };
    const { test, all } = qualityService.createTest(payload);
    setTests(all);
    setSelectedTest(test);
    showToast(`QC Test record ${test.id} created for Bed ${data.bedId} (Batch: ${data.batchId}).`);
  };

  const handleSaveMeasurements = (testId, rawData, notes) => {
    try {
      const { test, all } = qualityService.updateMeasurements(testId, rawData, notes);
      setTests(all);
      setSelectedTest(test);
      showToast(`Physical measurements saved. Quality evaluated as "${test.grade}".`);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleTransitionStatus = (testId, newStatus, user, note) => {
    try {
      const { test, all } = qualityService.transitionStatus(testId, newStatus, user, note);
      setTests(all);
      setSelectedTest(test);
      showToast(`QC Record ${testId} transitioned to status "${newStatus}".`);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveCriteria = (newCriteria) => {
    const { criteria } = criteriaService.saveCriteria(newCriteria, true);
    setActiveCriteria(criteria);
    showToast(`Grading criteria version ${criteria.version} thresholds saved.`);
  };

  const handleResetCriteria = () => {
    const def = criteriaService.resetToDefault();
    setActiveCriteria(def);
    showToast('Grading criteria thresholds reset to baseline validated standards.');
  };

  const handleResetDemo = () => {
    if (window.confirm('Reset all QC records back to initial demonstration state?')) {
      const initial = qualityService.resetToDefault();
      setTests(initial);
      setSelectedTest(null);
      showToast('Quality Control records reset to default test dataset.');
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest-800 text-white shadow-elevated border border-forest-700 text-xs font-medium animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Quality Control & Testing"
        description="Standardized laboratory physical testing, automated threshold grading evaluation, and agronomic crop suitability verification for CocoPit growing beds."
        breadcrumbs={['The Wall', 'Quality Control']}
        badge={
          <div className="flex items-center gap-1.5">
            <Badge variant="forest" size="sm">
              Module 03
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
              onClick={handleResetDemo}
              title="Reset demonstration records"
            >
              Reset Records
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsCreateOpen(true)}
            >
              New Bed Test
            </Button>
          </div>
        }
      />

      {/* 1. Dynamic KPIs */}
      <QualityKPIs tests={displayedTests} />

      {/* 2. Grading Criteria & Thresholds (Outside the graph) */}
      <GradingCriteriaSection
        criteria={activeCriteria}
        onSaveCriteria={handleSaveCriteria}
        onResetDefault={handleResetCriteria}
      />

      {/* 3. Recharts Grade Distribution */}
      <QualityDistributionChart tests={displayedTests} />

      {/* 4. Searchable / Filterable Individual Bed Results Table */}
      <QualityTestTable
        tests={displayedTests}
        onSelectTest={(test) => setSelectedTest(test)}
      />

      {/* 5. Bed Test Creation Modal */}
      <CreateTestModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        batches={batches}
        onCreateTest={handleCreateTest}
      />

      {/* 6. Comprehensive Test Details & Review Modal */}
      <TestDetailsModal
        isOpen={!!selectedTest}
        onClose={() => setSelectedTest(null)}
        test={selectedTest}
        batch={selectedBatchInfo}
        onSaveMeasurements={handleSaveMeasurements}
        onTransitionStatus={handleTransitionStatus}
      />
    </div>
  );
}
