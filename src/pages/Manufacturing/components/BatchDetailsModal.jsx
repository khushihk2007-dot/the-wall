import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { BatchWorkflowStepper } from './BatchWorkflowStepper';
import {
  Layers,
  ChevronRight,
  History,
  FileText,
  Loader2,
} from 'lucide-react';
import { MANUFACTURING_STAGES } from '../../../constants/mockManufacturingData';

export function BatchDetailsModal({ isOpen, onClose, batch, onAdvanceStage, isAdvancing = false }) {
  const [advanceNote, setAdvanceNote] = useState('');
  const [showAdvancePrompt, setShowAdvancePrompt] = useState(false);

  if (!batch) return null;

  const isCompleted = batch.stage === 'Completed';
  const currentStageIdx = MANUFACTURING_STAGES.indexOf(batch.stage);
  const nextStage = !isCompleted ? MANUFACTURING_STAGES[currentStageIdx + 1] : null;

  const totalMaterialKg =
    (batch.materials?.cottonKg || 0) +
    (batch.materials?.coirKg || 0) +
    (batch.materials?.mediumKg || 0);

  const cottonPct =
    totalMaterialKg > 0
      ? (((batch.materials?.cottonKg || 0) / totalMaterialKg) * 100).toFixed(1)
      : 0;
  const coirPct =
    totalMaterialKg > 0
      ? (((batch.materials?.coirKg || 0) / totalMaterialKg) * 100).toFixed(1)
      : 0;
  const mediumPct =
    totalMaterialKg > 0
      ? (((batch.materials?.mediumKg || 0) / totalMaterialKg) * 100).toFixed(1)
      : 0;

  const handleAdvance = async () => {
    if (isAdvancing) return;
    await onAdvanceStage(batch.id, advanceNote);
    setShowAdvancePrompt(false);
    setAdvanceNote('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isAdvancing ? undefined : onClose}
      title={`Batch Details: ${batch.id}`}
      subtitle={`Created on ${batch.createdAt} • Target completion ${batch.expectedCompletion}`}
      maxWidth="max-w-3xl"
      footer={
        <div className="w-full flex items-center justify-between">
          <Badge variant={isCompleted ? 'success' : 'warning'} size="md" dot>
            {batch.status}
          </Badge>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} disabled={isAdvancing}>
              Close
            </Button>

            {!isCompleted && !showAdvancePrompt && (
              <Button
                variant="primary"
                size="sm"
                icon={isAdvancing ? Loader2 : ChevronRight}
                iconPosition="right"
                onClick={() => setShowAdvancePrompt(true)}
                disabled={isAdvancing}
              >
                {isAdvancing ? 'Advancing...' : `Advance to ${nextStage}`}
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Workflow Stepper */}
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-sand-500 block mb-2">
            Current Lifecycle Progress
          </span>
          <BatchWorkflowStepper currentStage={batch.stage} />
        </div>

        {/* Advance Stage Prompt (inline within modal) */}
        {showAdvancePrompt && (
          <div className="p-4 rounded-xl bg-forest-50 border border-forest-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-forest-900 flex items-center gap-1.5">
                <ChevronRight className="w-4 h-4 text-forest-700" />
                Transitioning to: {nextStage}
              </span>
              <button
                type="button"
                onClick={() => setShowAdvancePrompt(false)}
                disabled={isAdvancing}
                className="text-xs text-sand-500 hover:text-sand-800 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
            <input
              type="text"
              value={advanceNote}
              onChange={(e) => setAdvanceNote(e.target.value)}
              disabled={isAdvancing}
              placeholder="Add optional operator remarks for this transition..."
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-forest-300 bg-white focus:outline-none focus:ring-2 focus:ring-forest-600 disabled:bg-sand-50"
            />
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAdvancePrompt(false)}
                disabled={isAdvancing}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={handleAdvance}
                disabled={isAdvancing}
                icon={isAdvancing ? Loader2 : undefined}
              >
                {isAdvancing ? 'Advancing...' : 'Confirm Stage Transition'}
              </Button>
            </div>
          </div>
        )}

        {/* Quantities & Material Consumed */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Output Info */}
          <div className="p-4 rounded-xl bg-sand-50 border border-sand-200">
            <div className="flex items-center justify-between text-xs font-semibold text-sand-700 mb-2">
              <span>Production Target</span>
              <Layers className="w-4 h-4 text-earth-700" />
            </div>
            <p className="text-3xl font-bold font-mono text-sand-900">
              {batch.quantity}{' '}
              <span className="text-xs font-normal text-sand-500">Beds</span>
            </p>
            <div className="mt-3 pt-2 border-t border-sand-200 text-xs text-sand-600 space-y-1">
              <div>
                <span className="text-sand-400">Binder:</span>{' '}
                <span className="font-medium text-sand-800">
                  {batch.materials?.binder || 'Standard starch bio-binder'}
                </span>
              </div>
              <div>
                <span className="text-sand-400">Total Material:</span>{' '}
                <span className="font-mono font-semibold text-sand-800">
                  {totalMaterialKg.toFixed(1)} kg
                </span>
              </div>
            </div>
          </div>

          {/* Material Ratio Card */}
          <div className="p-4 rounded-xl bg-sand-50 border border-sand-200">
            <span className="text-xs font-semibold text-sand-700 block mb-2">
              Material Proportion
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-sand-600">Cotton Fiber:</span>
                <span className="font-mono font-semibold">
                  {batch.materials?.cottonKg} kg ({cottonPct}%)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sand-600">Coconut Coir:</span>
                <span className="font-mono font-semibold">
                  {batch.materials?.coirKg} kg ({coirPct}%)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sand-600">Growing Medium:</span>
                <span className="font-mono font-semibold">
                  {batch.materials?.mediumKg} kg ({mediumPct}%)
                </span>
              </div>
            </div>

            <div className="mt-3 w-full h-2 rounded-full bg-sand-200 overflow-hidden flex">
              <div style={{ width: `${cottonPct}%` }} className="bg-sand-400" />
              <div style={{ width: `${coirPct}%` }} className="bg-earth-600" />
              <div style={{ width: `${mediumPct}%` }} className="bg-forest-600" />
            </div>
          </div>
        </div>

        {/* Notes */}
        {batch.notes && (
          <div className="p-3.5 rounded-xl bg-white border border-sand-200 text-xs">
            <span className="font-semibold text-sand-700 flex items-center gap-1.5 mb-1">
              <FileText className="w-3.5 h-3.5 text-forest-700" />
              Batch Engineering Notes
            </span>
            <p className="text-sand-600 leading-relaxed">{batch.notes}</p>
          </div>
        )}

        {/* Manufacturing Stage History */}
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-sand-500 flex items-center gap-1.5 mb-3">
            <History className="w-3.5 h-3.5 text-forest-700" />
            Manufacturing Stage Audit Log
          </span>

          <div className="space-y-3">
            {batch.history && batch.history.length > 0 ? (
              batch.history.map((hist, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg bg-white border border-sand-200 text-xs"
                >
                  <div className="w-6 h-6 rounded-md bg-forest-50 border border-forest-200 flex items-center justify-center font-mono font-bold text-[10px] text-forest-700 shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sand-900">
                        {hist.stage}
                      </span>
                      <span className="text-[10px] text-sand-400 font-mono">
                        {hist.timestamp}
                      </span>
                    </div>
                    <p className="text-sand-600 mt-0.5 leading-relaxed">
                      {hist.note}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-sand-500 italic">No stage history recorded.</p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
