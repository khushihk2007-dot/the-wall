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
  Layers,
  Droplets,
  Activity,
  Weight,
  Wind,
  ShieldCheck,
} from 'lucide-react';
import { criteriaService } from '../../../services/criteriaService';

export function GradingPanel({ test, onTransitionStatus }) {
  const [reviewNote, setReviewNote] = useState('');
  const [actionConfirm, setActionConfirm] = useState(null); // 'Approve' | 'Reject' | null

  const isApproved = test.status === 'Approved';
  const isRejected = test.status === 'Rejected';
  const isComplete = test.grade !== 'Insufficient Test Data' && test.grade !== 'Criteria Not Configured';
  const canApprove = isComplete && test.grade !== 'Failed' && !isApproved;

  const criteria = criteriaService.getCriteriaByVersion(test.criteriaVersion);
  const cTests = criteria?.tests || {};
  const tr = test.testResults || {};

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
          desc: 'All five standardized physical tests meet Grade A premium criteria.',
          icon: CheckCircle2,
        };
      case 'Grade B':
        return {
          variant: 'earth',
          title: 'Grade B — Good Quality',
          desc: 'All five tests meet at least Grade B standard criteria, with minor performance limitations.',
          icon: CheckCircle2,
        };
      case 'Grade C':
        return {
          variant: 'warning',
          title: 'Grade C — Basic Quality',
          desc: 'At least one test falls to Grade C usability criteria with no critical failure. Usable for non-critical crop stages.',
          icon: AlertTriangle,
        };
      case 'Failed':
        return {
          variant: 'danger',
          title: 'Failed — Critical Rejection',
          desc: 'A critical structural, safety, or usability condition is violated. Critical failure cannot be compensated by other results.',
          icon: XCircle,
        };
      case 'Criteria Not Configured':
        return {
          variant: 'warning',
          title: 'Criteria Not Configured',
          desc: 'Active grading criteria is awaiting experimental validation by authorized agricultural standards committee.',
          icon: AlertTriangle,
        };
      case 'Insufficient Test Data':
      default:
        return {
          variant: 'neutral',
          title: 'Insufficient Test Data',
          desc: 'One or more required physical laboratory suites have not been completed for this growing bed.',
          icon: HelpCircle,
        };
    }
  };

  const gradeInfo = getGradeDisplay(test.grade);
  const GradeIcon = gradeInfo.icon;

  const testCards = [
    {
      key: 'absorption',
      name: '1. Water Absorption',
      icon: Droplets,
      color: 'text-blue-600',
      formula: '((Wet - Dry) / Dry) × 100',
      unit: '%',
      res: tr.absorption,
      cfg: cTests.absorption,
    },
    {
      key: 'retention',
      name: '2. Water Retention',
      icon: Activity,
      color: 'text-teal-600',
      formula: '(Retained / Absorbed) × 100',
      unit: '%',
      res: tr.retention,
      cfg: cTests.retention,
    },
    {
      key: 'moistureDist',
      name: '3. Moisture Distribution',
      icon: Layers,
      color: 'text-indigo-600',
      formula: '((Max - Min) / Avg) × 100',
      unit: '% variation',
      res: tr.moistureDist,
      cfg: cTests.moistureDist,
    },
    {
      key: 'stability',
      name: '4. Structural Stability',
      icon: Weight,
      color: 'text-amber-700',
      formula: '((Initial - Final) / Initial) × 100',
      unit: '% deformation',
      res: tr.stability,
      cfg: cTests.stability,
    },
    {
      key: 'drying',
      name: '5. Drying Behaviour',
      icon: Wind,
      color: 'text-orange-600',
      formula: '((Initial - Final) / Initial) × 100',
      unit: '% weight loss',
      res: tr.drying,
      cfg: cTests.drying,
    },
  ];

  return (
    <div className="space-y-6 text-xs">
      {/* Bed & Criteria Header */}
      <div className="p-3.5 rounded-xl bg-sand-100/70 border border-sand-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-bold text-sand-500 uppercase">Tested Bed:</span>
          <span className="font-mono font-bold text-sm text-forest-900 bg-white px-2.5 py-0.5 rounded border border-sand-300">
            {test.bedId || 'BED-01'}
          </span>
          <span className="text-sand-600 font-medium">
            (Batch: <strong className="font-mono text-sand-900">{test.batchId}</strong>)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-sand-500">Grading Version:</span>
          <Badge variant="forest" size="xs">
            {test.criteriaVersion || criteria?.version || '1.0-VALIDATED'}
          </Badge>
          <Badge
            variant={criteria?.isValidated ? 'success' : 'warning'}
            size="xs"
            dot
          >
            {criteria?.validationStatus || 'Validated'}
          </Badge>
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

        {/* 5-Test Results Grid Breakdown */}
        <div className="space-y-2 pt-2">
          <span className="font-bold text-sand-800 block text-xs">
            Individual Bed Test Breakdown (5 Standardized Tests):
          </span>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
            {testCards.map((tc) => {
              const Icon = tc.icon;
              const hasResult = tc.res && tc.res.value !== null && tc.res.value !== undefined;
              const isCrit = tc.res?.isCriticalFail || tc.res?.grade === 'Failed';
              const grade = tc.res?.grade || '—';

              return (
                <div
                  key={tc.key}
                  className={`p-3 rounded-xl border ${
                    isCrit
                      ? 'border-rose-300 bg-rose-50/40'
                      : grade === 'Grade A'
                      ? 'border-forest-200 bg-forest-50/20'
                      : grade === 'Grade B'
                      ? 'border-sand-300 bg-sand-50/50'
                      : 'border-sand-200 bg-white'
                  } space-y-2 flex flex-col justify-between`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Icon className={`w-3.5 h-3.5 ${tc.color}`} />
                      {hasResult ? (
                        <span
                          className={`font-mono font-bold text-[10px] px-1.5 py-0.2 rounded ${
                            isCrit
                              ? 'bg-rose-200 text-rose-900'
                              : grade === 'Grade A'
                              ? 'bg-forest-100 text-forest-800'
                              : grade === 'Grade B'
                              ? 'bg-earth-100 text-earth-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {grade}
                        </span>
                      ) : (
                        <span className="text-[10px] text-sand-400">Missing</span>
                      )}
                    </div>
                    <h5 className="font-bold text-[11px] text-sand-900 leading-tight">{tc.name}</h5>
                    <div className="font-mono text-[9px] text-sand-500 break-words">{tc.formula}</div>
                  </div>

                  <div className="pt-2 border-t border-sand-200/60">
                    <span className="text-[9px] text-sand-400 uppercase font-semibold block">Measured Value</span>
                    <span className="font-mono font-bold text-sm text-sand-900">
                      {hasResult ? `${tc.res.value} ${tc.unit}` : '—'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Reasons Breakdown */}
        {test.evaluationReasons && test.evaluationReasons.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-sand-200">
            <span className="font-bold text-sand-800 block text-xs">
              Evaluation Criteria Details:
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
              Current Certification Workflow State
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm font-bold text-sand-900">{test.status}</span>
              {isApproved && <Badge variant="success" size="sm" dot>Certified Bed</Badge>}
              {isRejected && <Badge variant="danger" size="sm" dot>Lot Rejected</Badge>}
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
            <div className="flex items-center justify-between">
              <span className="font-medium text-sand-700">Audit Actions:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActionConfirm('Reject')}
                  className="text-rose-700 border-rose-300 hover:bg-rose-50"
                >
                  Reject Bed Lot
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={ShieldCheck}
                  disabled={!canApprove}
                  onClick={() => setActionConfirm('Approve')}
                  title={!canApprove ? 'All 5 tests must be completed and passing to approve' : 'Certify this bed'}
                >
                  Certify & Approve Bed
                </Button>
              </div>
            </div>

            {actionConfirm && (
              <div className="p-3 rounded-lg bg-white border border-sand-300 space-y-2 animate-in fade-in">
                <p className="font-semibold text-sand-800">
                  Confirm transition to <span className="font-bold underline">{actionConfirm}</span>?
                </p>
                <textarea
                  rows={2}
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="Optional review sign-off notes for quality audit trail..."
                  className="w-full p-2 rounded border border-sand-300 text-xs text-sand-900"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="xs" onClick={() => setActionConfirm(null)}>
                    Cancel
                  </Button>
                  <Button
                    variant={actionConfirm === 'Approve' ? 'primary' : 'danger'}
                    size="xs"
                    onClick={() => handleAction(actionConfirm === 'Approve' ? 'Approved' : 'Rejected')}
                  >
                    Confirm {actionConfirm}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
