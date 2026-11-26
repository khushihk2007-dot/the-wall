import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Plus, AlertTriangle, Layers, Bed } from 'lucide-react';

export function CreateTestModal({ isOpen, onClose, batches, onCreateTest }) {
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [bedId, setBedId] = useState('');
  const [sampleQuantity, setSampleQuantity] = useState('1');
  const [testDate, setTestDate] = useState('2026-11-25');
  const [reviewer, setReviewer] = useState('Dr. K. Patel');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const selectedBatch = batches.find((b) => b.id === selectedBatchId);

  // Auto suggest next Bed ID when batch changes
  const handleBatchSelect = (batchId) => {
    setSelectedBatchId(batchId);
    setError('');
    const batch = batches.find((b) => b.id === batchId);
    if (batch) {
      const nextBedNum = (batch.testedBedsCount || 0) + 1;
      setBedId(`BED-${String(nextBedNum).padStart(2, '0')}`);
    } else {
      setBedId('');
    }
  };

  const handleClose = () => {
    setSelectedBatchId('');
    setBedId('');
    setSampleQuantity('1');
    setError('');
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedBatchId) {
      setError('Please select a manufacturing batch to test.');
      return;
    }
    if (!bedId || !bedId.trim()) {
      setError('Please provide a Bed / Sample ID (e.g. BED-01, BED-02).');
      return;
    }

    try {
      onCreateTest({
        batchId: selectedBatchId,
        bedId: bedId.trim().toUpperCase(),
        sampleQuantity: Number(sampleQuantity) || 1,
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
      title="Create Independent Growing Bed QC Record"
      subtitle="Associate an independent physical test requisition with a specific bed sample from a manufacturing batch"
      maxWidth="max-w-xl"
      footer={
        <div className="w-full flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={handleSubmit}
            disabled={!selectedBatchId || !bedId}
          >
            Create Bed QC Record
          </Button>
        </div>
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
            onChange={(e) => handleBatchSelect(e.target.value)}
            className="w-full rounded-lg border border-sand-300 bg-white px-3.5 py-2 text-xs text-sand-900 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-forest-600"
          >
            <option value="">-- Choose a Manufacturing Batch --</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.id} — {b.stage || 'Production'} ({b.quantity || 100} units)
                {b.testedBedsCount > 0 ? ` [${b.testedBedsCount} bed(s) already tested]` : ''}
              </option>
            ))}
          </select>
          {selectedBatch && (
            <p className="text-[11px] text-sand-500">
              Batches support multiple independently tested beds. Each bed maintains its own test measurements and quality grade.
            </p>
          )}
        </div>

        {/* Bed / Sample ID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block font-semibold text-sand-800">
              Bed / Sample ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={bedId}
              onChange={(e) => {
                setBedId(e.target.value);
                setError('');
              }}
              placeholder="e.g. BED-01, BED-02, SAMPLE-A"
              className="w-full rounded-lg border border-sand-300 bg-white px-3 py-2 text-xs font-mono font-bold text-sand-900 focus:outline-none focus:ring-2 focus:ring-forest-600"
            />
            <span className="text-[10px] text-sand-400">Unique sample identifier for this bed</span>
          </div>

          <div className="space-y-1.5">
            <label className="block font-semibold text-sand-800">
              Sample Quantity (Beds)
            </label>
            <input
              type="number"
              min="1"
              value={sampleQuantity}
              onChange={(e) => setSampleQuantity(e.target.value)}
              className="w-full rounded-lg border border-sand-300 bg-white px-3 py-2 text-xs font-mono text-sand-900 focus:outline-none focus:ring-2 focus:ring-forest-600"
            />
          </div>
        </div>

        {/* Date and Reviewer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block font-semibold text-sand-800">Test Requisition Date</label>
            <input
              type="date"
              value={testDate}
              onChange={(e) => setTestDate(e.target.value)}
              className="w-full rounded-lg border border-sand-300 bg-white px-3 py-2 text-xs font-mono text-sand-900 focus:outline-none focus:ring-2 focus:ring-forest-600"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block font-semibold text-sand-800">Assigned QC Scientist / Reviewer</label>
            <input
              type="text"
              value={reviewer}
              onChange={(e) => setReviewer(e.target.value)}
              placeholder="e.g. Dr. K. Patel"
              className="w-full rounded-lg border border-sand-300 bg-white px-3 py-2 text-xs text-sand-900 focus:outline-none focus:ring-2 focus:ring-forest-600"
            />
          </div>
        </div>

        {/* Requisition Notes */}
        <div className="space-y-1.5">
          <label className="block font-semibold text-sand-800">Sampling & Conditioning Notes</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Curing tunnel sample retrieved after 48h moisture stabilization..."
            className="w-full rounded-lg border border-sand-300 bg-white p-2.5 text-xs text-sand-900 placeholder:text-sand-400 focus:outline-none focus:ring-2 focus:ring-forest-600"
          />
        </div>
      </form>
    </Modal>
  );
}
