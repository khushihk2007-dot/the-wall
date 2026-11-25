import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Plus, RotateCcw, Check } from 'lucide-react';

import { QualityKPIs } from './components/QualityKPIs';
import { QualityDistributionChart } from './components/QualityDistributionChart';
import { QualityTestTable } from './components/QualityTestTable';
import { CreateTestModal } from './components/CreateTestModal';
import { TestDetailsModal } from './components/TestDetailsModal';

import { qualityService } from '../../services/qualityService';
import { manufacturingService } from '../../services/manufacturingService';

export default function QualityControlPage() {
  const [tests, setTests] = useState(() => qualityService.getTests());
  const [selectedTest, setSelectedTest] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [batchesList, setBatchesList] = useState(() => manufacturingService.getCachedBatches());

  useEffect(() => {
    manufacturingService.getBatches().then((data) => setBatchesList(data)).catch(() => {});
  }, []);

  // Batches for selection in test creation
  const batches = useMemo(() => {
    // Re-evaluates available batches when tests change
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
    const { test, all } = qualityService.createTest(data);
    setTests(all);
    setSelectedTest(test);
    showToast(`QC Test requisition ${test.id} initialized for batch ${data.batchId}.`);
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

  const handleResetDemo = () => {
    if (window.confirm('Reset all QC records back to initial demonstration state?')) {
      const initial = qualityService.resetToDefault();
      setTests(initial);
      setSelectedTest(null);
      showToast('Quality Control records reset to default demo dataset.');
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
        description="Standardized laboratory physical testing, automated grading evaluation, and agronomic crop suitability verification."
        breadcrumbs={['The Wall', 'Quality Control']}
        badge={
          <div className="flex items-center gap-1.5">
            <Badge variant="forest" size="sm">
              Module 03
            </Badge>
            <span className="text-[11px] font-mono text-sand-500 bg-sand-100 px-2 py-0.5 rounded">
              Demo Data
            </span>
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RotateCcw}
              onClick={handleResetDemo}
              title="Reset demonstration records"
            >
              Reset
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsCreateOpen(true)}
            >
              New QC Test
            </Button>
          </div>
        }
      />

      {/* 1. Dynamic KPIs */}
      <QualityKPIs tests={tests} />

      {/* 2. Recharts Grade Distribution */}
      <QualityDistributionChart tests={tests} />

      {/* 3. Searchable / Filterable QC Test Table */}
      <QualityTestTable
        tests={tests}
        onSelectTest={(test) => setSelectedTest(test)}
      />

      {/* 4. Test Creation Modal */}
      <CreateTestModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        batches={batches}
        onCreateTest={handleCreateTest}
      />

      {/* 5. Comprehensive Test Details & Review Modal */}
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
