import React, { useState } from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { gradingService } from '../../../services/gradingService';
import { Save, Lock } from 'lucide-react';

export function TestMeasurementsForm({ test, onSaveMeasurements }) {
  const isLocked = test.status === 'Approved';

  // State initialized with current values if available
  const [formData, setFormData] = useState({
    // 1. Water Absorption
    dryWeight: test.measurements?.absorption?.dryWeight || '',
    wetWeight: test.measurements?.absorption?.wetWeight || '',

    // 2. Water Retention
    waterAbsorbed: test.measurements?.retention?.waterAbsorbed || '',
    waterRetained: test.measurements?.retention?.waterRetained || '',
    drainageDuration: test.measurements?.retention?.durationMinutes || '30',

    // 3. Moisture Distribution
    topLayerMoisture: test.measurements?.moistureDist?.topLayer || '',
    midLayerMoisture: test.measurements?.moistureDist?.middleLayer || '',
    bottomLayerMoisture: test.measurements?.moistureDist?.bottomLayer || '',

    // 4. Structural Stability
    initialThickness: test.measurements?.stability?.initialThickness || '35',
    finalThickness: test.measurements?.stability?.finalThickness || '',
    compressionForce: test.measurements?.stability?.compressionForceN || '450',
    structuralObservations: test.measurements?.stability?.observations || '',

    // 5. Drying Behaviour
    dryingInitialWet: test.measurements?.drying?.initialWetWeight || '',
    dryingFinalWeight: test.measurements?.drying?.finalWeight || '',
    dryingDuration: test.measurements?.drying?.durationHours || '24',
    dryingTemp: test.measurements?.drying?.temperatureC || '32',
    dryingObservations: test.measurements?.drying?.observations || '',
  });

  const [reviewerNotes, setReviewerNotes] = useState(test.reviewerNotes || '');

  // Live Calculations
  const absCalc = gradingService.calculateAbsorption(formData.dryWeight, formData.wetWeight);
  const retCalc = gradingService.calculateRetention(formData.waterAbsorbed, formData.waterRetained);
  const moistCalc = gradingService.calculateMoistureDistribution(
    formData.topLayerMoisture,
    formData.midLayerMoisture,
    formData.bottomLayerMoisture
  );
  const stabCalc = gradingService.calculateDeformation(formData.initialThickness, formData.finalThickness);
  const dryCalc = gradingService.calculateDryingWeightLoss(formData.dryingInitialWet, formData.dryingFinalWeight);

  const handleChange = (field, value) => {
    if (isLocked) return;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (isLocked) return;
    onSaveMeasurements(test.id, formData, reviewerNotes);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {isLocked && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="font-semibold">
              This QC record has been certified and Approved. Physical measurements are permanently locked against modifications.
            </span>
          </div>
          <Badge variant="success" size="sm">Locked</Badge>
        </div>
      )}

      {/* 1. Water Absorption Test */}
      <div className="p-4 rounded-xl bg-sand-50/70 border border-sand-200 space-y-3">
        <div className="flex items-center justify-between border-b border-sand-200 pb-2">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-sand-800">
              Test A: Water Absorption (% Dry Basis)
            </h4>
            <p className="text-[11px] text-sand-500 font-mono">
              Formula: ((Wet Weight - Dry Weight) / Dry Weight) × 100
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-sand-400 block font-mono">Calculated Output</span>
            <span className="text-base font-bold font-mono text-forest-800">
              {absCalc.isValid ? `${absCalc.value}%` : '—'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Initial Dry Weight (g)"
            type="number"
            step="1"
            min="1"
            disabled={isLocked}
            value={formData.dryWeight}
            onChange={(e) => handleChange('dryWeight', e.target.value)}
            placeholder="e.g. 250"
            required
          />
          <Input
            label="Final Wet Weight (g)"
            type="number"
            step="1"
            min="1"
            disabled={isLocked}
            value={formData.wetWeight}
            onChange={(e) => handleChange('wetWeight', e.target.value)}
            error={!absCalc.isValid && formData.wetWeight ? absCalc.error : null}
            placeholder="e.g. 1300"
            required
          />
        </div>
      </div>

      {/* 2. Water Retention Test */}
      <div className="p-4 rounded-xl bg-sand-50/70 border border-sand-200 space-y-3">
        <div className="flex items-center justify-between border-b border-sand-200 pb-2">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-sand-800">
              Test B: Water Retention Post-Drainage (%)
            </h4>
            <p className="text-[11px] text-sand-500 font-mono">
              Formula: (Water Retained / Water Absorbed) × 100
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-sand-400 block font-mono">Calculated Output</span>
            <span className="text-base font-bold font-mono text-forest-800">
              {retCalc.isValid ? `${retCalc.value}%` : '—'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Water Absorbed (g)"
            type="number"
            step="1"
            min="1"
            disabled={isLocked}
            value={formData.waterAbsorbed}
            onChange={(e) => handleChange('waterAbsorbed', e.target.value)}
            placeholder="e.g. 1050"
            required
          />
          <Input
            label="Water Retained (g)"
            type="number"
            step="1"
            min="0"
            disabled={isLocked}
            value={formData.waterRetained}
            onChange={(e) => handleChange('waterRetained', e.target.value)}
            error={!retCalc.isValid && formData.waterRetained ? retCalc.error : null}
            placeholder="e.g. 840"
            required
          />
          <Input
            label="Drainage Time (min)"
            type="number"
            min="1"
            disabled={isLocked}
            value={formData.drainageDuration}
            onChange={(e) => handleChange('drainageDuration', e.target.value)}
            placeholder="30"
            required
          />
        </div>
      </div>

      {/* 3. Moisture Distribution Test */}
      <div className="p-4 rounded-xl bg-sand-50/70 border border-sand-200 space-y-3">
        <div className="flex items-center justify-between border-b border-sand-200 pb-2">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-sand-800">
              Test C: Moisture Distribution Profile
            </h4>
            <p className="text-[11px] text-sand-500 font-mono">
              Evaluates top, middle and bottom layer consistency
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-sand-400 block font-mono">Layer Spread (Max - Min)</span>
            <span className="text-base font-bold font-mono text-forest-800">
              {moistCalc.isValid ? `Δ ${moistCalc.spread}% (Avg: ${moistCalc.average}%)` : '—'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Top Layer Moisture (%)"
            type="number"
            step="0.1"
            min="0"
            max="100"
            disabled={isLocked}
            value={formData.topLayerMoisture}
            onChange={(e) => handleChange('topLayerMoisture', e.target.value)}
            placeholder="e.g. 68.0"
            required
          />
          <Input
            label="Middle Layer Moisture (%)"
            type="number"
            step="0.1"
            min="0"
            max="100"
            disabled={isLocked}
            value={formData.midLayerMoisture}
            onChange={(e) => handleChange('midLayerMoisture', e.target.value)}
            placeholder="e.g. 63.5"
            required
          />
          <Input
            label="Bottom Layer Moisture (%)"
            type="number"
            step="0.1"
            min="0"
            max="100"
            disabled={isLocked}
            value={formData.bottomLayerMoisture}
            onChange={(e) => handleChange('bottomLayerMoisture', e.target.value)}
            placeholder="e.g. 59.0"
            required
          />
        </div>
      </div>

      {/* 4. Structural Stability Test */}
      <div className="p-4 rounded-xl bg-sand-50/70 border border-sand-200 space-y-3">
        <div className="flex items-center justify-between border-b border-sand-200 pb-2">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-sand-800">
              Test D: Structural Compressive Deformation
            </h4>
            <p className="text-[11px] text-sand-500 font-mono">
              Formula: ((Initial Thickness - Final Thickness) / Initial Thickness) × 100
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-sand-400 block font-mono">Deformation Output</span>
            <span className="text-base font-bold font-mono text-forest-800">
              {stabCalc.isValid ? `${stabCalc.value}%` : '—'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Initial Thickness (mm)"
            type="number"
            step="0.1"
            min="1"
            disabled={isLocked}
            value={formData.initialThickness}
            onChange={(e) => handleChange('initialThickness', e.target.value)}
            placeholder="e.g. 35.0"
            required
          />
          <Input
            label="Final Thickness (mm)"
            type="number"
            step="0.1"
            min="0"
            disabled={isLocked}
            value={formData.finalThickness}
            onChange={(e) => handleChange('finalThickness', e.target.value)}
            error={!stabCalc.isValid && formData.finalThickness ? stabCalc.error : null}
            placeholder="e.g. 32.2"
            required
          />
          <Input
            label="Applied Force (N)"
            type="number"
            min="10"
            disabled={isLocked}
            value={formData.compressionForce}
            onChange={(e) => handleChange('compressionForce', e.target.value)}
            placeholder="450"
            required
          />
        </div>

        <Input
          label="Structural Observations / Fiber Delamination Remarks"
          type="text"
          disabled={isLocked}
          value={formData.structuralObservations}
          onChange={(e) => handleChange('structuralObservations', e.target.value)}
          placeholder="e.g. Elastic restoration verified; no lateral splitting observed under load."
        />
      </div>

      {/* 5. Drying Behaviour Test */}
      <div className="p-4 rounded-xl bg-sand-50/70 border border-sand-200 space-y-3">
        <div className="flex items-center justify-between border-b border-sand-200 pb-2">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-sand-800">
              Test E: Drying Behaviour & Weight Loss
            </h4>
            <p className="text-[11px] text-sand-500 font-mono">
              Formula: ((Initial Wet Weight - Final Weight) / Initial Wet Weight) × 100
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-sand-400 block font-mono">Drying Weight Loss</span>
            <span className="text-base font-bold font-mono text-forest-800">
              {dryCalc.isValid ? `${dryCalc.value}%` : '—'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Input
            label="Initial Wet Weight (g)"
            type="number"
            step="1"
            min="1"
            disabled={isLocked}
            value={formData.dryingInitialWet}
            onChange={(e) => handleChange('dryingInitialWet', e.target.value)}
            placeholder="e.g. 1300"
            required
          />
          <Input
            label="Weight After Drying (g)"
            type="number"
            step="1"
            min="0"
            disabled={isLocked}
            value={formData.dryingFinalWeight}
            onChange={(e) => handleChange('dryingFinalWeight', e.target.value)}
            error={!dryCalc.isValid && formData.dryingFinalWeight ? dryCalc.error : null}
            placeholder="e.g. 450"
            required
          />
          <Input
            label="Duration (Hours)"
            type="number"
            min="1"
            disabled={isLocked}
            value={formData.dryingDuration}
            onChange={(e) => handleChange('dryingDuration', e.target.value)}
            placeholder="24"
            required
          />
          <Input
            label="Test Chamber Temp (°C)"
            type="number"
            disabled={isLocked}
            value={formData.dryingTemp}
            onChange={(e) => handleChange('dryingTemp', e.target.value)}
            placeholder="32"
            required
          />
        </div>

        <Input
          label="Drying Rate & Shrinkage Observations"
          type="text"
          disabled={isLocked}
          value={formData.dryingObservations}
          onChange={(e) => handleChange('dryingObservations', e.target.value)}
          placeholder="e.g. Smooth linear evaporation; negligible edge curling."
        />
      </div>

      {/* Reviewer Notes & Action button */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-sand-800">
          Reviewer Remarks & Laboratory Findings
        </label>
        <textarea
          rows="2"
          disabled={isLocked}
          value={reviewerNotes}
          onChange={(e) => setReviewerNotes(e.target.value)}
          placeholder="Add comments on fiber density, germination channel uniformity, and batch compliance..."
          className="w-full rounded-lg border border-sand-300 bg-white px-3.5 py-2 text-xs text-sand-900 placeholder:text-sand-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-forest-600 disabled:bg-sand-100"
        />
      </div>

      {!isLocked && (
        <div className="flex justify-end pt-2">
          <Button variant="primary" size="md" icon={Save} onClick={handleSave}>
            Save Measurements & Evaluate Grade
          </Button>
        </div>
      )}
    </form>
  );
}
