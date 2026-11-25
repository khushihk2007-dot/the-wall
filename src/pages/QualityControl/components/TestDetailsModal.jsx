import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { TestMeasurementsForm } from './TestMeasurementsForm';
import { GradingPanel } from './GradingPanel';
import { CropSuitability } from './CropSuitability';
import {
  FileText,
  Award,
  Sprout,
  History,
  Layers,
} from 'lucide-react';

export function TestDetailsModal({
  isOpen,
  onClose,
  test,
  batch,
  onSaveMeasurements,
  onTransitionStatus,
}) {
  const [activeTab, setActiveTab] = useState('measurements');

  if (!test) return null;

  const isApproved = test.status === 'Approved';

  const tabs = [
    { id: 'measurements', label: 'Test Measurements', icon: FileText },
    { id: 'grading', label: 'Quality Grading & Review', icon: Award },
    { id: 'crops', label: 'Crop Suitability', icon: Sprout },
    { id: 'history', label: 'Batch Specs & Audit Log', icon: History },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`QC Dossier: ${test.id}`}
      subtitle={`Associated with Manufacturing Batch ${test.batchId} • Tested: ${test.testDate}`}
      maxWidth="max-w-4xl"
      footer={
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={isApproved ? 'success' : 'neutral'} size="md" dot>
              {test.status}
            </Badge>
            <Badge variant="forest" size="md">
              {test.grade}
            </Badge>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Dossier
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-sand-200 pb-px">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 -mb-px ${
                  isActive
                    ? 'border-forest-700 text-forest-800 bg-sand-50/70'
                    : 'border-transparent text-sand-500 hover:text-sand-800 hover:bg-sand-50/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        {activeTab === 'measurements' && (
          <TestMeasurementsForm
            test={test}
            onSaveMeasurements={onSaveMeasurements}
          />
        )}

        {activeTab === 'grading' && (
          <GradingPanel
            test={test}
            onTransitionStatus={onTransitionStatus}
          />
        )}

        {activeTab === 'crops' && (
          <CropSuitability test={test} />
        )}

        {activeTab === 'history' && (
          <div className="space-y-6 text-xs">
            {/* Batch Manufacturing Context */}
            {batch ? (
              <div className="p-4 rounded-xl bg-sand-50 border border-sand-200 space-y-3">
                <span className="font-bold text-sand-900 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <Layers className="w-4 h-4 text-forest-700" />
                  Origin Batch Specifications: {batch.id}
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sand-700 pt-1 border-t border-sand-200">
                  <div>
                    <span className="text-sand-400 block">Manufacturing Stage:</span>
                    <span className="font-semibold text-sand-900">{batch.stage}</span>
                  </div>
                  <div>
                    <span className="text-sand-400 block">Total Lot Output:</span>
                    <span className="font-mono font-semibold">{batch.quantity} Beds</span>
                  </div>
                  <div>
                    <span className="text-sand-400 block">Cotton / Coir:</span>
                    <span className="font-mono font-semibold">
                      {batch.materials?.cottonKg}kg / {batch.materials?.coirKg}kg
                    </span>
                  </div>
                  <div>
                    <span className="text-sand-400 block">Sample Draw:</span>
                    <span className="font-mono font-semibold">{test.sampleQuantity} Beds Tested</span>
                  </div>
                </div>

                {batch.notes && (
                  <p className="text-[11px] text-sand-500 italic pt-1 border-t border-sand-200">
                    Production Note: {batch.notes}
                  </p>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-sand-50 text-sand-500">
                Batch manufacturing record not directly linked.
              </div>
            )}

            {/* Audit History Log */}
            <div>
              <span className="font-bold uppercase tracking-wider text-sand-500 text-[11px] flex items-center gap-1.5 mb-3">
                <History className="w-3.5 h-3.5 text-forest-700" />
                QC Workflow State Transitions & Audit Log
              </span>

              <div className="space-y-2.5">
                {test.history && test.history.length > 0 ? (
                  test.history.map((h, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-white border border-sand-200 flex items-start gap-3"
                    >
                      <div className="w-6 h-6 rounded bg-sand-100 flex items-center justify-center font-mono font-bold text-[10px] text-forest-800 shrink-0">
                        0{idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-sand-900">
                            {h.previousStatus} &rarr; {h.newStatus}
                          </span>
                          <span className="font-mono text-sand-400 text-[10px]">{h.timestamp}</span>
                        </div>
                        <p className="text-sand-600 mt-0.5">{h.note}</p>
                        <span className="text-[10px] text-forest-700 font-medium block mt-1">
                          Actioned by: {h.user}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sand-500 italic">No transition events recorded.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
