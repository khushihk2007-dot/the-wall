import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Plus, RotateCcw, Check, AlertTriangle, Loader2 } from 'lucide-react';

import { ManufacturingKpis } from './components/ManufacturingKpis';
import { BatchTable } from './components/BatchTable';
import { CreateBatchModal } from './components/CreateBatchModal';
import { BatchDetailsModal } from './components/BatchDetailsModal';

import { manufacturingService } from '../../services/manufacturingService';

export default function ManufacturingPage() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedBatch, setSelectedBatch] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);

  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');

  const showToast = (message, type = 'success') => {
    setToastType(type);
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const loadBatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await manufacturingService.getBatches();
      setBatches(data);
    } catch (err) {
      setError(err.message || 'Failed to connect to manufacturing API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  const handleCreateBatch = async (data) => {
    try {
      setIsCreating(true);
      const { batch, all } = await manufacturingService.createBatch(data);
      setBatches(all);
      setIsCreateOpen(false);
      showToast(`Batch ${batch.id} initialized and stored in database.`);
    } catch (err) {
      showToast(`Failed to create batch: ${err.message}`, 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleAdvanceBatch = async (batchId, customNote) => {
    try {
      setIsAdvancing(true);
      const { batch, all } = await manufacturingService.advanceStage(batchId, customNote);
      setBatches(all);

      if (selectedBatch && selectedBatch.id === batchId) {
        setSelectedBatch(batch);
      }

      showToast(`Batch ${batchId} advanced to "${batch.stage}".`);
    } catch (err) {
      showToast(`Stage advancement failed: ${err.message}`, 'error');
    } finally {
      setIsAdvancing(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-elevated border text-xs font-medium animate-in fade-in slide-in-from-bottom-2 ${
            toastType === 'error'
              ? 'bg-rose-900 text-white border-rose-700'
              : 'bg-forest-900 text-white border-forest-700'
          }`}
        >
          {toastType === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-rose-300 shrink-0" />
          ) : (
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <PageHeader
        title="Manufacturing Management"
        description="Digitally track the complete 6-stage lifecycle, raw material inputs, and production status of The Wall growing beds."
        breadcrumbs={['The Wall', 'Manufacturing']}
        badge={
          <div className="flex items-center gap-1.5">
            <Badge variant="forest" size="sm">
              Module 02
            </Badge>
            <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              Supabase Connected
            </span>
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RotateCcw}
              onClick={loadBatches}
              disabled={loading}
              title="Refresh batches from database"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsCreateOpen(true)}
            >
              Create New Batch
            </Button>
          </div>
        }
      />

      {/* Error Alert Banner with Retry Button */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-rose-900">
                Failed to load manufacturing batches
              </p>
              <p className="text-xs text-rose-700 mt-0.5">{error}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={RotateCcw}
            onClick={loadBatches}
            className="border-rose-300 text-rose-800 hover:bg-rose-100"
          >
            Retry Connection
          </Button>
        </div>
      )}

      {/* Loading state indicator */}
      {loading && batches.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-sand-200 shadow-card flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-forest-600 animate-spin mb-3" />
          <p className="text-sm font-medium text-sand-800">
            Loading manufacturing batches from Supabase...
          </p>
          <p className="text-xs text-sand-500 mt-1">
            Retrieving production records and stage histories
          </p>
        </div>
      ) : (
        <>
          {/* 1. Manufacturing Overview KPI cards */}
          <ManufacturingKpis batches={batches} />

          {/* 2. Production Batch Table */}
          <BatchTable
            batches={batches}
            onSelectBatch={(batch) => setSelectedBatch(batch)}
            onAdvanceBatch={(batchId) => handleAdvanceBatch(batchId)}
          />
        </>
      )}

      {/* 3. Batch Creation Modal */}
      <CreateBatchModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreateBatch={handleCreateBatch}
        isSubmitting={isCreating}
      />

      {/* 4. Batch Details & History Modal */}
      <BatchDetailsModal
        isOpen={!!selectedBatch}
        onClose={() => setSelectedBatch(null)}
        batch={selectedBatch}
        onAdvanceStage={handleAdvanceBatch}
        isAdvancing={isAdvancing}
      />
    </div>
  );
}
