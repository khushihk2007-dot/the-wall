import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Select } from '../../../components/ui/Select';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Info, ArrowRightCircle } from 'lucide-react';
import { OBSERVATION_STATUSES } from '../../../constants/mockBiodegradationData';

export function StatusChangeModal({ isOpen, onClose, sample, onConfirm }) {
  const [newStatus, setNewStatus] = useState(() => sample?.status || 'Under Observation');
  const [reasonNotes, setReasonNotes] = useState('');
  const [updatedBy, setUpdatedBy] = useState(() => sample?.responsibleObserver || 'QC Observer');
  const [error, setError] = useState('');

  if (!sample) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reasonNotes.trim()) {
      setError('Please provide a scientific or operational justification for this status transition.');
      return;
    }

    onConfirm(sample.id, newStatus, reasonNotes, updatedBy);
    onClose();
  };

  const statusOptions = OBSERVATION_STATUSES.map((st) => ({
    value: st,
    label: st,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Update Status: ${sample.id}`}
      subtitle={`Transition lifecycle state for ${sample.sampleName}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
            {error}
          </div>
        )}

        <div className="p-3 bg-sand-50 rounded-xl border border-sand-200 text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-sand-500">Current Status:</span>
            <span className="font-bold text-sand-800">{sample.status}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sand-500">Environment:</span>
            <span className="text-sand-800">{sample.environment}</span>
          </div>
        </div>

        <Select
          label="New Observation Status"
          value={newStatus}
          onChange={(e) => {
            setNewStatus(e.target.value);
            if (error) setError('');
          }}
          options={statusOptions}
          required
        />

        <Input
          label="Authorized Observer"
          value={updatedBy}
          onChange={(e) => setUpdatedBy(e.target.value)}
          required
        />

        <div>
          <label className="block text-xs font-semibold text-sand-700 mb-1">
            Status Transition Justification &amp; Notes
          </label>
          <textarea
            value={reasonNotes}
            onChange={(e) => {
              setReasonNotes(e.target.value);
              if (error) setError('');
            }}
            placeholder="Document scientific rationale, external conditions, or conclusion reason..."
            rows={3}
            className="w-full text-xs p-2.5 rounded-lg border border-sand-300 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-forest-600"
            required
          />
        </div>

        {/* Scientific Transparency Alert */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <strong>Standard Scientific Requirement:</strong> Marking an observation as <em>Observation Completed</em> indicates the monitoring duration has concluded. It does not establish certification of complete compostability without accredited ISO testing.
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-sand-200">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            icon={ArrowRightCircle}
          >
            Update Lifecycle Status
          </Button>
        </div>
      </form>
    </Modal>
  );
}
