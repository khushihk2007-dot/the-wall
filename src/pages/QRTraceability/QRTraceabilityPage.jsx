import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { RotateCcw, Check } from 'lucide-react';

import { TraceabilityTable } from './components/TraceabilityTable';
import { QRCodeModal } from './components/QRCodeModal';
import { QRPrintLabel } from './components/QRPrintLabel';

import { traceabilityService } from '../../services/traceabilityService';
import { DataSourceFilter } from '../../components/common/DataSourceFilter';
import { useDataSourceFilter } from '../../hooks/useDataSourceFilter';

export default function QRTraceabilityPage() {
  const { filterRecords } = useDataSourceFilter();
  const [records, setRecords] = useState(() => traceabilityService.getAllBatchesTraceability());
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [printRecord, setPrintRecord] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const displayedRecords = React.useMemo(() => {
    return filterRecords(records.map(r => ({ ...r, id: r.batchId })), 'batch');
  }, [records, filterRecords]);

  useEffect(() => {
    let isMounted = true;
    traceabilityService.ensureInitialQrRecords().then(() => {
      if (isMounted) {
        setRecords(traceabilityService.getAllBatchesTraceability());
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const loadData = async () => {
    await traceabilityService.ensureInitialQrRecords();
    const all = traceabilityService.getAllBatchesTraceability();
    setRecords(all);
    return all;
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleGenerateQr = async (batchId) => {
    try {
      await traceabilityService.generateQrForBatch(batchId);
      const updated = await loadData();
      const updatedItem = updated.find((r) => r.batchId === batchId);
      if (updatedItem) {
        setSelectedRecord(updatedItem);
      }
      showToast(`QR Passport generated successfully for batch ${batchId}.`);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRegenerateQr = async (batchId) => {
    try {
      await traceabilityService.generateQrForBatch(batchId);
      const updated = await loadData();
      const updatedItem = updated.find((r) => r.batchId === batchId);
      if (updatedItem) {
        setSelectedRecord(updatedItem);
      }
      showToast(`QR Passport regenerated for batch ${batchId}. Stable ID preserved.`);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleResetDemo = async () => {
    if (window.confirm('Reset all QR traceability registries back to default demonstration records?')) {
      traceabilityService.resetRegistry();
      await loadData();
      setSelectedRecord(null);
      setPrintRecord(null);
      showToast('Traceability records reset to default demo dataset.');
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
        title="QR Product Traceability"
        description="Generate and manage permanent digital product passports linking physical growing beds directly to manufacturing and laboratory records."
        breadcrumbs={['The Wall', 'QR Traceability']}
        badge={
          <div className="flex items-center gap-1.5">
            <Badge variant="forest" size="sm">
              Module 04
            </Badge>
            <span className="text-[11px] font-mono text-sand-500 bg-sand-100 px-2 py-0.5 rounded">
              Demo Mode
            </span>
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
              title="Reset demonstration registries"
            >
              Reset
            </Button>
          </div>
        }
      />

      {/* 1. Searchable / Filterable Traceability Register Table */}
      <TraceabilityTable
        records={displayedRecords}
        onSelectRecord={(rec) => setSelectedRecord(rec)}
        onGenerateQr={handleGenerateQr}
      />

      {/* 3. QR Passport Modal */}
      {selectedRecord && (
        <QRCodeModal
          isOpen={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
          record={selectedRecord}
          onRegenerateQr={handleRegenerateQr}
          onOpenPrintLabel={() => {
            setPrintRecord(selectedRecord);
          }}
        />
      )}

      {/* 4. Dedicated Print Label View */}
      {printRecord && (
        <QRPrintLabel
          record={printRecord}
          onClose={() => setPrintRecord(null)}
        />
      )}
    </div>
  );
}
