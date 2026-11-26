import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Settings, CheckCircle2, AlertTriangle, ShieldCheck, Save, RotateCcw } from 'lucide-react';

export function ConfigureCriteriaModal({
  isOpen,
  onClose,
  activeCriteria,
  onSaveCriteria,
  onResetDefault,
}) {
  const [formData, setFormData] = useState(() => JSON.parse(JSON.stringify(activeCriteria)));
  const [adminKey, setAdminKey] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleTestChange = (testKey, field, value) => {
    setFormData((prev) => ({
      ...prev,
      tests: {
        ...prev.tests,
        [testKey]: {
          ...prev.tests[testKey],
          [field]: value,
        },
      },
    }));
  };

  const handleRangeChange = (testKey, gradeKey, bound, value) => {
    setFormData((prev) => ({
      ...prev,
      tests: {
        ...prev.tests,
        [testKey]: {
          ...prev.tests[testKey],
          [gradeKey]: {
            ...prev.tests[testKey][gradeKey],
            [bound]: Number(value),
          },
        },
      },
    }));
  };

  const handleToggleValidation = () => {
    const isCurrentlyValidated = formData.validationStatus === 'Validated';
    setFormData((prev) => ({
      ...prev,
      isValidated: !isCurrentlyValidated,
      validationStatus: !isCurrentlyValidated ? 'Validated' : 'Awaiting Experimental Validation',
      validatedBy: !isCurrentlyValidated ? (prev.validatedBy || 'Authorized QC Admin') : null,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Ensure valid version
    if (!formData.version || !formData.version.trim()) {
      setError('Criteria version identifier is required.');
      return;
    }

    try {
      onSaveCriteria(formData);
      setSuccess('Criteria thresholds successfully updated.');
      setTimeout(() => {
        setSuccess('');
        onClose();
      }, 900);
    } catch (err) {
      setError(err.message || 'Failed to update criteria thresholds.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configure Grading Criteria & Thresholds"
      subtitle="Authorized administrator configuration for CocoPit laboratory test thresholds and validation status"
      maxWidth="max-w-3xl"
      footer={
        <div className="w-full flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            icon={RotateCcw}
            onClick={() => {
              if (window.confirm('Reset all grading criteria thresholds back to factory validated baseline?')) {
                onResetDefault();
                onClose();
              }
            }}
          >
            Reset Defaults
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" icon={Save} onClick={handleSubmit}>
              Save Thresholds
            </Button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <p className="font-medium">{success}</p>
          </div>
        )}

        {/* Version & Validation Status Controls */}
        <div className="p-4 rounded-xl bg-sand-50/80 border border-sand-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-sand-500 block font-mono">
                Criteria Version & Validation State
              </span>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => setFormData((p) => ({ ...p, version: e.target.value }))}
                  className="px-2.5 py-1 rounded border border-sand-300 font-mono font-bold text-sand-900 text-xs w-36 bg-white"
                  placeholder="e.g. 1.1-VALIDATED"
                />
                <Badge
                  variant={formData.validationStatus === 'Validated' ? 'forest' : 'warning'}
                  size="md"
                  dot
                >
                  {formData.validationStatus}
                </Badge>
              </div>
            </div>

            <Button
              type="button"
              variant={formData.validationStatus === 'Validated' ? 'outline' : 'primary'}
              size="sm"
              icon={ShieldCheck}
              onClick={handleToggleValidation}
            >
              {formData.validationStatus === 'Validated'
                ? 'Mark as Awaiting Validation'
                : 'Mark as Validated'}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-[11px]">
            <div>
              <label className="text-sand-600 font-medium block">Validated Authority</label>
              <input
                type="text"
                value={formData.validatedBy || ''}
                onChange={(e) => setFormData((p) => ({ ...p, validatedBy: e.target.value }))}
                className="w-full mt-1 px-2.5 py-1.5 rounded border border-sand-300 bg-white text-sand-800 text-xs"
                placeholder="e.g. Agronomic Testing Board"
              />
            </div>
            <div>
              <label className="text-sand-600 font-medium block">Validation Notes</label>
              <input
                type="text"
                value={formData.validationNotes || ''}
                onChange={(e) => setFormData((p) => ({ ...p, validationNotes: e.target.value }))}
                className="w-full mt-1 px-2.5 py-1.5 rounded border border-sand-300 bg-white text-sand-800 text-xs"
                placeholder="Calibration protocol details"
              />
            </div>
          </div>
        </div>

        {/* 1. Water Absorption Thresholds */}
        <div className="p-4 rounded-xl border border-sand-200 bg-white space-y-3">
          <div className="flex items-center justify-between border-b border-sand-100 pb-2">
            <div>
              <h4 className="font-bold text-sand-900 text-sm">1. Water Absorption Rate (%)</h4>
              <p className="text-[11px] text-sand-500">Formula: ((Wet Weight - Dry Weight) / Dry Weight) × 100 • Higher is better</p>
            </div>
            <Badge variant="forest" size="xs">Direction: Min Target</Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-forest-700 font-semibold block text-[11px]">Grade A Min (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.tests.absorption.gradeA}
                onChange={(e) => handleTestChange('absorption', 'gradeA', Number(e.target.value))}
                className="w-full mt-1 px-2 py-1.5 rounded border border-sand-300 bg-sand-50/50 font-mono text-sand-900"
              />
            </div>
            <div>
              <label className="text-earth-700 font-semibold block text-[11px]">Grade B Min (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.tests.absorption.gradeB}
                onChange={(e) => handleTestChange('absorption', 'gradeB', Number(e.target.value))}
                className="w-full mt-1 px-2 py-1.5 rounded border border-sand-300 bg-sand-50/50 font-mono text-sand-900"
              />
            </div>
            <div>
              <label className="text-amber-700 font-semibold block text-[11px]">Grade C Min (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.tests.absorption.gradeC}
                onChange={(e) => handleTestChange('absorption', 'gradeC', Number(e.target.value))}
                className="w-full mt-1 px-2 py-1.5 rounded border border-sand-300 bg-sand-50/50 font-mono text-sand-900"
              />
            </div>
            <div>
              <label className="text-rose-700 font-semibold block text-[11px]">Critical Min Fail (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.tests.absorption.criticalMin}
                onChange={(e) => handleTestChange('absorption', 'criticalMin', Number(e.target.value))}
                className="w-full mt-1 px-2 py-1.5 rounded border border-rose-300 bg-rose-50/30 font-mono text-rose-900"
              />
            </div>
          </div>
        </div>

        {/* 2. Water Retention Thresholds */}
        <div className="p-4 rounded-xl border border-sand-200 bg-white space-y-3">
          <div className="flex items-center justify-between border-b border-sand-100 pb-2">
            <div>
              <h4 className="font-bold text-sand-900 text-sm">2. Water Retention Capacity (%)</h4>
              <p className="text-[11px] text-sand-500">Formula: (Retained Water / Absorbed Water) × 100 • Higher is better</p>
            </div>
            <Badge variant="forest" size="xs">Direction: Min Target</Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-forest-700 font-semibold block text-[11px]">Grade A Min (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.tests.retention.gradeA}
                onChange={(e) => handleTestChange('retention', 'gradeA', Number(e.target.value))}
                className="w-full mt-1 px-2 py-1.5 rounded border border-sand-300 bg-sand-50/50 font-mono text-sand-900"
              />
            </div>
            <div>
              <label className="text-earth-700 font-semibold block text-[11px]">Grade B Min (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.tests.retention.gradeB}
                onChange={(e) => handleTestChange('retention', 'gradeB', Number(e.target.value))}
                className="w-full mt-1 px-2 py-1.5 rounded border border-sand-300 bg-sand-50/50 font-mono text-sand-900"
              />
            </div>
            <div>
              <label className="text-amber-700 font-semibold block text-[11px]">Grade C Min (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.tests.retention.gradeC}
                onChange={(e) => handleTestChange('retention', 'gradeC', Number(e.target.value))}
                className="w-full mt-1 px-2 py-1.5 rounded border border-sand-300 bg-sand-50/50 font-mono text-sand-900"
              />
            </div>
            <div>
              <label className="text-rose-700 font-semibold block text-[11px]">Critical Min Fail (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.tests.retention.criticalMin}
                onChange={(e) => handleTestChange('retention', 'criticalMin', Number(e.target.value))}
                className="w-full mt-1 px-2 py-1.5 rounded border border-rose-300 bg-rose-50/30 font-mono text-rose-900"
              />
            </div>
          </div>
        </div>

        {/* 3. Moisture Distribution Thresholds */}
        <div className="p-4 rounded-xl border border-sand-200 bg-white space-y-3">
          <div className="flex items-center justify-between border-b border-sand-100 pb-2">
            <div>
              <h4 className="font-bold text-sand-900 text-sm">3. Moisture Distribution Variation (%)</h4>
              <p className="text-[11px] text-sand-500">Formula: ((Highest - Lowest Moisture) / Average Moisture) × 100 • Lower variation is better</p>
            </div>
            <Badge variant="earth" size="xs">Direction: Max Tolerance</Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-forest-700 font-semibold block text-[11px]">Grade A Max Var (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.tests.moistureDist.gradeA}
                onChange={(e) => handleTestChange('moistureDist', 'gradeA', Number(e.target.value))}
                className="w-full mt-1 px-2 py-1.5 rounded border border-sand-300 bg-sand-50/50 font-mono text-sand-900"
              />
            </div>
            <div>
              <label className="text-earth-700 font-semibold block text-[11px]">Grade B Max Var (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.tests.moistureDist.gradeB}
                onChange={(e) => handleTestChange('moistureDist', 'gradeB', Number(e.target.value))}
                className="w-full mt-1 px-2 py-1.5 rounded border border-sand-300 bg-sand-50/50 font-mono text-sand-900"
              />
            </div>
            <div>
              <label className="text-amber-700 font-semibold block text-[11px]">Grade C Max Var (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.tests.moistureDist.gradeC}
                onChange={(e) => handleTestChange('moistureDist', 'gradeC', Number(e.target.value))}
                className="w-full mt-1 px-2 py-1.5 rounded border border-sand-300 bg-sand-50/50 font-mono text-sand-900"
              />
            </div>
            <div>
              <label className="text-rose-700 font-semibold block text-[11px]">Critical Max Fail (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.tests.moistureDist.criticalMax}
                onChange={(e) => handleTestChange('moistureDist', 'criticalMax', Number(e.target.value))}
                className="w-full mt-1 px-2 py-1.5 rounded border border-rose-300 bg-rose-50/30 font-mono text-rose-900"
              />
            </div>
          </div>
        </div>

        {/* 4. Structural Stability Thresholds & Test Parameters */}
        <div className="p-4 rounded-xl border border-sand-200 bg-white space-y-3">
          <div className="flex items-center justify-between border-b border-sand-100 pb-2">
            <div>
              <h4 className="font-bold text-sand-900 text-sm">4. Structural Stability / Compressive Deformation (%)</h4>
              <p className="text-[11px] text-sand-500">Formula: ((Initial Thickness - Final Thickness) / Initial Thickness) × 100 • Lower deformation is better</p>
            </div>
            <Badge variant="earth" size="xs">Direction: Max Tolerance</Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs bg-sand-50 p-2.5 rounded-lg border border-sand-200">
            <div>
              <label className="text-sand-700 font-semibold block text-[11px]">Standard Test Load (Newtons)</label>
              <input
                type="number"
                value={formData.tests.stability.standardLoadN || 450}
                onChange={(e) => handleTestChange('stability', 'standardLoadN', Number(e.target.value))}
                className="w-full mt-1 px-2 py-1.5 rounded border border-sand-300 bg-white font-mono text-sand-900"
              />
            </div>
            <div>
              <label className="text-sand-700 font-semibold block text-[11px]">Test Duration (Hours)</label>
              <input
                type="number"
                value={formData.tests.stability.standardDurationH || 24}
                onChange={(e) => handleTestChange('stability', 'standardDurationH', Number(e.target.value))}
                className="w-full mt-1 px-2 py-1.5 rounded border border-sand-300 bg-white font-mono text-sand-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-forest-700 font-semibold block text-[11px]">Grade A Max Deform (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.tests.stability.gradeA}
                onChange={(e) => handleTestChange('stability', 'gradeA', Number(e.target.value))}
                className="w-full mt-1 px-2 py-1.5 rounded border border-sand-300 bg-sand-50/50 font-mono text-sand-900"
              />
            </div>
            <div>
              <label className="text-earth-700 font-semibold block text-[11px]">Grade B Max Deform (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.tests.stability.gradeB}
                onChange={(e) => handleTestChange('stability', 'gradeB', Number(e.target.value))}
                className="w-full mt-1 px-2 py-1.5 rounded border border-sand-300 bg-sand-50/50 font-mono text-sand-900"
              />
            </div>
            <div>
              <label className="text-amber-700 font-semibold block text-[11px]">Grade C Max Deform (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.tests.stability.gradeC}
                onChange={(e) => handleTestChange('stability', 'gradeC', Number(e.target.value))}
                className="w-full mt-1 px-2 py-1.5 rounded border border-sand-300 bg-sand-50/50 font-mono text-sand-900"
              />
            </div>
            <div>
              <label className="text-rose-700 font-semibold block text-[11px]">Critical Max Fail (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.tests.stability.criticalMax}
                onChange={(e) => handleTestChange('stability', 'criticalMax', Number(e.target.value))}
                className="w-full mt-1 px-2 py-1.5 rounded border border-rose-300 bg-rose-50/30 font-mono text-rose-900"
              />
            </div>
          </div>
        </div>

        {/* 5. Drying Behaviour Target Ranges & Duration */}
        <div className="p-4 rounded-xl border border-sand-200 bg-white space-y-3">
          <div className="flex items-center justify-between border-b border-sand-100 pb-2">
            <div>
              <h4 className="font-bold text-sand-900 text-sm">5. Drying Behaviour Weight Loss (%)</h4>
              <p className="text-[11px] text-sand-500">Formula: ((Initial Wet - Final Weight) / Initial Wet) × 100 • Evaluated against balanced target release range</p>
            </div>
            <Badge variant="sand" size="xs">Direction: Target Range</Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs bg-sand-50 p-2.5 rounded-lg border border-sand-200">
            <div>
              <label className="text-sand-700 font-semibold block text-[11px]">Target Drying Duration (Hours)</label>
              <input
                type="number"
                value={formData.tests.drying.targetDurationH || 24}
                onChange={(e) => handleTestChange('drying', 'targetDurationH', Number(e.target.value))}
                className="w-full mt-1 px-2 py-1.5 rounded border border-sand-300 bg-white font-mono text-sand-900"
              />
            </div>
            <div>
              <label className="text-sand-700 font-semibold block text-[11px]">Target Temperature (°C)</label>
              <input
                type="number"
                value={formData.tests.drying.targetTemperatureC || 32}
                onChange={(e) => handleTestChange('drying', 'targetTemperatureC', Number(e.target.value))}
                className="w-full mt-1 px-2 py-1.5 rounded border border-sand-300 bg-white font-mono text-sand-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-2.5 rounded border border-forest-200 bg-forest-50/30 space-y-1">
              <span className="font-bold text-forest-800 text-[11px] block">Grade A Range (%)</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.1"
                  value={formData.tests.drying.gradeA.min}
                  onChange={(e) => handleRangeChange('drying', 'gradeA', 'min', e.target.value)}
                  className="w-16 px-1.5 py-1 rounded border border-sand-300 bg-white font-mono text-xs"
                />
                <span className="text-sand-400">to</span>
                <input
                  type="number"
                  step="0.1"
                  value={formData.tests.drying.gradeA.max}
                  onChange={(e) => handleRangeChange('drying', 'gradeA', 'max', e.target.value)}
                  className="w-16 px-1.5 py-1 rounded border border-sand-300 bg-white font-mono text-xs"
                />
              </div>
            </div>

            <div className="p-2.5 rounded border border-earth-200 bg-earth-50/30 space-y-1">
              <span className="font-bold text-earth-800 text-[11px] block">Grade B Range (%)</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.1"
                  value={formData.tests.drying.gradeB.min}
                  onChange={(e) => handleRangeChange('drying', 'gradeB', 'min', e.target.value)}
                  className="w-16 px-1.5 py-1 rounded border border-sand-300 bg-white font-mono text-xs"
                />
                <span className="text-sand-400">to</span>
                <input
                  type="number"
                  step="0.1"
                  value={formData.tests.drying.gradeB.max}
                  onChange={(e) => handleRangeChange('drying', 'gradeB', 'max', e.target.value)}
                  className="w-16 px-1.5 py-1 rounded border border-sand-300 bg-white font-mono text-xs"
                />
              </div>
            </div>

            <div className="p-2.5 rounded border border-amber-200 bg-amber-50/30 space-y-1">
              <span className="font-bold text-amber-800 text-[11px] block">Grade C Range (%)</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.1"
                  value={formData.tests.drying.gradeC.min}
                  onChange={(e) => handleRangeChange('drying', 'gradeC', 'min', e.target.value)}
                  className="w-16 px-1.5 py-1 rounded border border-sand-300 bg-white font-mono text-xs"
                />
                <span className="text-sand-400">to</span>
                <input
                  type="number"
                  step="0.1"
                  value={formData.tests.drying.gradeC.max}
                  onChange={(e) => handleRangeChange('drying', 'gradeC', 'max', e.target.value)}
                  className="w-16 px-1.5 py-1 rounded border border-sand-300 bg-white font-mono text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2 rounded bg-rose-50/60 border border-rose-200 text-rose-900 text-[11px]">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">Critical Limits:</span>
              <span>Fail if &lt;</span>
              <input
                type="number"
                step="0.1"
                value={formData.tests.drying.criticalMin}
                onChange={(e) => handleTestChange('drying', 'criticalMin', Number(e.target.value))}
                className="w-14 px-1.5 py-0.5 rounded border border-rose-300 bg-white font-mono text-xs"
              />
              <span>% (anaerobic) or &gt;</span>
              <input
                type="number"
                step="0.1"
                value={formData.tests.drying.criticalMax}
                onChange={(e) => handleTestChange('drying', 'criticalMax', Number(e.target.value))}
                className="w-14 px-1.5 py-0.5 rounded border border-rose-300 bg-white font-mono text-xs"
              />
              <span>% (desiccation)</span>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}
