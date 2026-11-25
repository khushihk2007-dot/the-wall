import React, { useState } from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FileCheck,
  Send,
  Lock,
} from 'lucide-react';
import { QUALITY_CRITERIA_METADATA } from '../../../constants/qualityCriteria';

export function GradingPanel({ test, onTransitionStatus }) {
  const [reviewNote, setReviewNote] = useState('');
  const [actionConfirm, setActionConfirm] = useState(null); // 'Approve' | 'Reject' | null

  const isApproved = test.status === 'Approved';
  const isRejected = test.status === 'Rejected';
  const isComplete = test.grade !== 'Insufficient Test Data';
  const canApprove = isComplete && test.grade !== 'Failed' && !isApproved;

  const handleAction = (status) => {
    onTransitionStatus(test.id, status, test.reviewer || 'Dr. K. Patel', reviewNote);
    setActionConfirm(null);
    setReviewNote('');
  };

  const getGradeDisplay = (grade) => {
    switch (grade) {
      case 'Grade A':
        return {
          variant: 'forest',
          title: 'Grade A — Premium Quality',
          desc: 'All critical physical baseline metrics and premium structural criteria are satisfied.',
          icon: CheckCircle2,
        };
      case 'Grade B':
        return {
          variant: 'earth',
          title: 'Grade B — Acceptable Standard',
          desc: 'Meets all mandatory minimum physical thresholds with minor performance limitations.',
          icon: CheckCircle2,
        };
      case 'Grade C':
        return {
          variant: 'warning',
          title: 'Grade C — Low Quality',
          desc: 'Fails at least one critical minimum requirement. Usable only for non-critical applications.',
          icon: AlertTriangle,
        };
      case 'Failed':
        return {
          variant: 'danger',
          title: 'Failed — Rejected Lot',
          desc: 'Critical structural or moisture requirements failed. Batch cannot be released.',
          icon: XCircle,
        };
      case 'Insufficient Test Data':
      default:
        return {
          variant: 'neutral',
          title: 'Insufficient Test Data',
          desc: 'One or more required physical laboratory suites have not been completed.',
          icon: HelpCircle,
        };
    }
  };

  const gradeInfo = getGradeDisplay(test.grade);
  const GradeIcon = gradeInfo.icon;

  return (
    <div className="space-y-6 text-xs">
      {/* Criteria Metadata Disclaimer */}
      <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-amber-900 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-bold">Evaluation Engine: {test.criteriaVersion || QUALITY_CRITERIA_METADATA.version}</span>
            <Badge variant="warning" size="sm">EXPERIMENTAL / PROVISIONAL</Badge>
          </div>
          <p className="text-[11px] leading-relaxed text-amber-800">
            {QUALITY_CRITERIA_METADATA.note} Physical grades are calculated against experimental bench targets.
          </p>
        </div>
      </div>

      {/* Grade Result Card */}
      <div className="p-5 rounded-xl border border-sand-200 bg-white shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sand-100 flex items-center justify-center text-forest-700">
              <GradeIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-sand-400 font-mono">
                Automated Quality Classification
              </span>
              <h3 className="text-base font-bold text-sand-900">{gradeInfo.title}</h3>
            </div>
          </div>
          <Badge variant={gradeInfo.variant} size="md">
            {test.grade}
          </Badge>
        </div>

        <p className="text-xs text-sand-600 bg-sand-50 p-3 rounded-lg border border-sand-200 leading-relaxed">
          {test.evaluationSummary || gradeInfo.desc}
        </p>

        {/* Reasons Breakdown */}
        {test.evaluationReasons && test.evaluationReasons.length > 0 && (
          <div className="space-y-1.5 pt-2">
            <span className="font-bold text-sand-800 block">
              Parameter Evaluation Breakdown:
            </span>
            <ul className="space-y-1 text-sand-600 pl-4 list-disc">
              {test.evaluationReasons.map((r, idx) => (
                <li key={idx} className="leading-tight">{r}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Workflow State & Actions */}
      <div className="p-4 rounded-xl bg-sand-50/80 border border-sand-200 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-sand-500">
              Current Workflow State
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm font-bold text-sand-900">{test.status}</span>
              {isApproved && <Badge variant="success" size="sm" dot>Permanently Certified</Badge>}
              {isRejected && <Badge variant="danger" size="sm" dot>Batch Rejected</Badge>}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-sand-400 block font-mono">Evaluation Timestamp</span>
            <span className="font-mono text-sand-700">{test.evaluationDate || 'Pending Finalization'}</span>
          </div>
        </div>

        {/* Approval / Rejection Action Controls */}
        {!isApproved && !isRejected && (
          <div className="pt-3 border-t border-sand-200 space-y-3">
            {actionConfirm ? (
              <div className="p-3 rounded-lg bg-white border border-sand-300 space-y-2">
                <p className="font-bold text-sand-900">
                  Confirm {actionConfirm === 'Approved' ? 'Batch Quality Approval' : 'Batch Quality Rejection'}
                </p>
                <input
                  type="text"
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder={`Enter required ${actionConfirm.toLowerCase()} rationale / QA signature remarks...`}
                  className="w-full px-3 py-1.5 rounded-lg border border-sand-300 text-xs focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => setActionConfirm(null)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant={actionConfirm === 'Approved' ? 'primary' : 'danger'}
                    onClick={() => handleAction(actionConfirm)}
                  >
                    Confirm {actionConfirm}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                {test.status !== 'Awaiting Review' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Send}
                    onClick={() => onTransitionStatus(test.id, 'Awaiting Review', test.reviewer, 'Submitted for final QA approval.')}
                  >
                    Submit for Final Review
                  </Button>
                ) : (
                  <span className="text-sand-500 font-medium">
                    Test dossier queued for supervisor review.
                  </span>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    icon={XCircle}
                    onClick={() => setActionConfirm('Rejected')}
                  >
                    Reject Batch
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    icon={FileCheck}
                    disabled={!canApprove}
                    title={
                      !isComplete
                        ? 'Cannot approve: All 5 physical tests must be completed.'
                        : test.grade === 'Failed'
                        ? 'Cannot approve: Quality evaluation evaluated to Failed.'
                        : 'Certify and approve this QC record'
                    }
                    onClick={() => setActionConfirm('Approved')}
                  >
                    Certify & Approve
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {isApproved && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              Certified by <strong>{test.reviewer}</strong> on {test.evaluationDate}. Batch is approved for agricultural distribution and QR generation.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
