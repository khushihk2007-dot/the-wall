import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Plus, AlertTriangle, Layers } from 'lucide-react';

export function CreateTestModal({ isOpen, onClose, batches, onCreateTest }) {
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [sampleQuantity, setSampleQuantity] = useState('3');
  const [testDate, setTestDate] = useState('2026-11-25');
  const [reviewer, setReviewer] = useState('Dr. K. Patel');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const selectedBatch = batches.find((b) => b.id === selectedBatchId);

  const handleClose = () => {
    setSelectedBatchId('');
    setSampleQuantity('3');
    setError('');
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedBatchId) {
      setError('Please select a manufacturing batch to test.');
      return;
    }
    if (selectedBatch?.hasActiveQc) {
      setError('This batch already has an active QC test underway.');
      return;
    }
    if (!sampleQuantity || Number(sampleQuantity) <= 0) {
      setError('Sample quantity must be at least 1 bed.');
      return;
    }

    try {
      onCreateTest({
        batchId: selectedBatchId,
        sampleQuantity: Number(sampleQuantity),
        testDate,
        reviewer,
        notes,
      });
      handleClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Quality Control Test"
      subtitle="Associate physical laboratory testing requisition with a registered manufacturing batch"
      maxWidth="max-w-xl"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={handleSubmit}
            disabled={!selectedBatchId || selectedBatch?.hasActiveQc}
          >
            Create QC Record
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Manufacturing Batch Selector */}
        <div className="space-y-1.5">
          <label className="block font-semibold text-sand-800">
            Select Manufacturing Batch <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedBatchId}
            onChange={(e) => {
              setSelectedBatchId(e.target.value);
              setError('');
            }}
            className="w-full rounded-lg border border-sand-300 bg-white px-3.5 py-2 text-sm text-sand-900 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-forest-600"
          >
            <option value="">-- Choose a Manufacturing Batch --</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.id} — Stage: {b.stage} ({b.quantity} beds) {b.hasActiveQc ? '[Active QC Underway]' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Selected Batch Summary Box */}
        {selectedBatch && (
          <div className="p-3.5 rounded-xl bg-sand-50 border border-sand-200 space-y-2">
            <div className="flex items-center justify-between text-sand-700">
              <span className="font-bold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-forest-700" />
                Batch Details: {selectedBatch.id}
              </span>
              <span className="font-mono text-sand-500">Total Lot: {selectedBatch.quantity} Beds</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-sand-600 pt-1 border-t border-sand-200">
              <div>
                <span className="text-sand-400">Current Stage:</span>{' '}
                <span className="font-semibold text-sand-800">{selectedBatch.stage}</span>
              </div>
              <div>
                <span className="text-sand-400">Manufactured:</span>{' '}
                <span className="font-mono">{selectedBatch.createdAt}</span>
              </div>
              <div>
                <span className="text-sand-400">Cotton / Coir:</span>{' '}
                <span className="font-mono">{selectedBatch.materials?.cottonKg}kg / {selectedBatch.materials?.coirKg}kg</span>
              </div>
              <div>
                <span className="text-sand-400">Binder:</span>{' '}
                <span className="truncate block">{selectedBatch.materials?.binder || 'Standard starch'}</span>
              </div>
            </div>

            {selectedBatch.hasActiveQc && (
              <p className="text-[11px] text-amber-700 font-semibold bg-amber-50 p-2 rounded border border-amber-200 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                This batch has an active test pending. Multiple concurrent active tests are prohibited.
              </p>
            )}
          </div>
        )}

        {/* Sample Quantity & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Sample Tested Quantity (Beds)"
            type="number"
            min="1"
            max={selectedBatch?.quantity || 100}
            value={sampleQuantity}
            onChange={(e) => setSampleQuantity(e.target.value)}
            helperText="Standard ASTM sample size: 3-5 beds"
            required
          />

          <Input
            label="Testing Date"
            type="date"
            value={testDate}
            onChange={(e) => setTestDate(e.target.value)}
            required
          />
        </div>

        {/* Reviewer / Operator */}
        <Input
          label="Lead QA Engineer / Reviewer"
          type="text"
          value={reviewer}
          onChange={(e) => setReviewer(e.target.value)}
          placeholder="e.g. Dr. K. Patel"
          required
        />

        {/* Initial Notes */}
        <div className="space-y-1">
          <label className="block font-semibold text-sand-800">
            Requisition Notes & Laboratory Objective
          </label>
          <textarea
            rows="2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Standard physical quality testing for nursery delivery compliance..."
            className="w-full rounded-lg border border-sand-300 bg-white px-3.5 py-2 text-xs text-sand-900 placeholder:text-sand-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-forest-600"
          />
        </div>
      </form>
    </Modal>
  );
}
