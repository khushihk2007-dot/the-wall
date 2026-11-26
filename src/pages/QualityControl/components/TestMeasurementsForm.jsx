import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { gradingService } from '../../../services/gradingService';
import { criteriaService } from '../../../services/criteriaService';
import { Save, Lock, Radio, CloudSun, CheckCircle2, AlertTriangle, Layers, Droplets, Activity, Weight, Wind } from 'lucide-react';
import { useSensorData } from '../../../hooks/useSensorData';

export function TestMeasurementsForm({ test, onSaveMeasurements }) {
  const isLocked = test.status === 'Approved';
  const { data: sensorData, isConnected, lastFetchedAt } = useSensorData();
  const criteria = criteriaService.getCriteriaByVersion(test.criteriaVersion);
  const cTests = criteria?.tests || {};

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
    loadDurationHours: test.measurements?.stability?.durationHours || '24',
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

  // Live single-test evaluations against active criteria
  const absEval = absCalc.isValid && cTests.absorption
    ? gradingService.evaluateSingleTest('absorption', absCalc.value, cTests.absorption)
    : null;
  const retEval = retCalc.isValid && cTests.retention
    ? gradingService.evaluateSingleTest('retention', retCalc.value, cTests.retention)
    : null;
  const moistEval = moistCalc.isValid && cTests.moistureDist
    ? gradingService.evaluateSingleTest('moistureDist', moistCalc.variationPct, cTests.moistureDist)
    : null;
  const stabEval = stabCalc.isValid && cTests.stability
    ? gradingService.evaluateSingleTest('stability', stabCalc.value, cTests.stability)
    : null;
  const dryEval = dryCalc.isValid && cTests.drying
    ? gradingService.evaluateSingleTest('drying', dryCalc.value, cTests.drying)
    : null;

  const handleChange = (field, value) => {
    if (isLocked) return;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCaptureSensorConditions = () => {
    if (!sensorData || isLocked) return;
    const temp = sensorData.dht1Valid && sensorData.temperature1 != null 
      ? String(sensorData.temperature1) 
      : sensorData.dht2Valid && sensorData.temperature2 != null 
        ? String(sensorData.temperature2) 
        : formData.dryingTemp;
    const hum = sensorData.dht1Valid && sensorData.humidity1 != null 
      ? `${sensorData.humidity1}% RH` 
      : sensorData.dht2Valid && sensorData.humidity2 != null 
        ? `${sensorData.humidity2}% RH` 
        : '';
    const ultra = sensorData.ultrasonicValid && sensorData.ultrasonicDistanceCm != null
      ? `${sensorData.ultrasonicDistanceCm} cm`
      : '';
    const obsNote = `Ambient lab context recorded at ${lastFetchedAt || 'Live'}: Temp ${temp}°C${hum ? `, Humidity ${hum}` : ''}${ultra ? `, Ultrasonic ${ultra}` : ''}.`;

    setFormData((prev) => ({
      ...prev,
      dryingTemp: temp,
      dryingObservations: prev.dryingObservations ? `${prev.dryingObservations} | ${obsNote}` : obsNote,
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (isLocked) return;
    onSaveMeasurements(test.id, formData, reviewerNotes);
  };

  const getPill = (evaluation) => {
    if (!evaluation) return null;
    if (evaluation.isCriticalFail || evaluation.grade === 'Failed') {
      return <Badge variant="danger" size="xs">Critical Fail</Badge>;
    }
    if (evaluation.grade === 'Grade A') {
      return <Badge variant="forest" size="xs">Grade A (Premium)</Badge>;
    }
    if (evaluation.grade === 'Grade B') {
      return <Badge variant="earth" size="xs">Grade B (Good)</Badge>;
    }
    if (evaluation.grade === 'Grade C') {
      return <Badge variant="warning" size="xs">Grade C (Basic)</Badge>;
    }
    return <Badge variant="neutral" size="xs">{evaluation.grade}</Badge>;
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {isLocked && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="font-semibold">
              This bed record has been certified and Approved. Physical measurements are permanently locked against modifications.
            </span>
          </div>
          <Badge variant="success" size="sm">Locked</Badge>
        </div>
      )}

      {/* Bed Identification Bar */}
      <div className="p-3 rounded-xl bg-sand-100/70 border border-sand-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-sand-500 font-mono text-[10px] uppercase">Bed Under Test:</span>
          <span className="font-mono font-bold text-sm text-forest-900 bg-white px-2.5 py-0.5 rounded border border-sand-300">
            {test.bedId || 'BED-01'}
          </span>
          <span className="text-sand-600 font-medium">
            (Batch: <strong className="font-mono text-sand-900">{test.batchId}</strong>)
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-sand-500">Grading Version:</span>
          <span className="font-mono font-bold text-sand-800 bg-white px-2 py-0.5 rounded border border-sand-200">
            {test.criteriaVersion || '1.0-VALIDATED'}
          </span>
        </div>
      </div>

      {/* Supporting Environmental Context from Central ESP32 */}
      <div className="p-3.5 rounded-xl bg-forest-50/50 border border-forest-200 space-y-2.5 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-forest-900 font-semibold">
            <Radio className="w-3.5 h-3.5 text-forest-700 animate-pulse" />
            <span>ESP32 Laboratory Environmental Context</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? 'success' : 'neutral'} size="xs" dot>
              {isConnected ? 'Live Telemetry' : 'Hardware Offline'}
            </Badge>
            {!isLocked && isConnected && (
              <button
                type="button"
                onClick={handleCaptureSensorConditions}
                className="px-2 py-0.5 rounded text-[11px] font-semibold bg-forest-700 text-white hover:bg-forest-800 transition-colors"
                title="Fill ambient conditions into drying and observation inputs"
              >
                Capture Sensor Conditions
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] font-mono">
          <div className="p-2 rounded bg-white border border-forest-100">
            <span className="text-sand-500 block text-[9px] uppercase font-sans">Substrate Moisture</span>
            <span className="font-bold text-forest-900">
              {sensorData?.soilValid && sensorData?.soilMoisturePercent !== null 
                ? `${sensorData.soilMoisturePercent}%` 
                : sensorData?.soilRaw === 0 ? '0/4095 (Zero)' : 'Unavailable'}
            </span>
          </div>
          <div className="p-2 rounded bg-white border border-forest-100">
            <span className="text-sand-500 block text-[9px] uppercase font-sans">Substrate Temp 1</span>
            <span className="font-bold text-forest-900">
              {sensorData?.dht1Valid && sensorData?.temperature1 != null ? `${sensorData.temperature1}°C` : 'Unavailable'}
            </span>
          </div>
          <div className="p-2 rounded bg-white border border-forest-100">
            <span className="text-sand-500 block text-[9px] uppercase font-sans">Ambient Temp 2</span>
            <span className="font-bold text-forest-900">
              {sensorData?.dht2Valid && sensorData?.temperature2 != null ? `${sensorData.temperature2}°C` : 'Unavailable'}
            </span>
          </div>
          <div className="p-2 rounded bg-white border border-forest-100">
            <span className="text-sand-500 block text-[9px] uppercase font-sans">Relative Humidity</span>
            <span className="font-bold text-forest-900">
              {sensorData?.dht1Valid && sensorData?.humidity1 != null 
                ? `${sensorData.humidity1}%` 
                : sensorData?.dht2Valid && sensorData?.humidity2 != null 
                  ? `${sensorData.humidity2}%` 
                  : 'Unavailable'}
            </span>
          </div>
          <div className="p-2 rounded bg-white border border-forest-100">
            <span className="text-sand-500 block text-[9px] uppercase font-sans">Ultrasonic Height</span>
            <span className="font-bold text-forest-900">
              {sensorData?.ultrasonicValid && sensorData?.ultrasonicDistanceCm != null ? `${sensorData.ultrasonicDistanceCm} cm` : 'Unavailable'}
            </span>
          </div>
        </div>
      </div>

      {/* 1. Water Absorption Test */}
      <div className="p-4 rounded-xl border border-sand-200 bg-white space-y-3">
        <div className="flex items-center justify-between border-b border-sand-100 pb-2">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-blue-600" />
            <h4 className="font-bold text-sand-900 text-xs uppercase tracking-wide">
              1. Water Absorption Test
            </h4>
          </div>
          <div className="flex items-center gap-2">
            {getPill(absEval)}
            <span className="font-mono text-xs font-bold text-forest-800 bg-forest-50 px-2 py-0.5 rounded border border-forest-200">
              Formula: ((Wet - Dry) / Dry) × 100
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-sand-700 font-semibold block text-[11px] mb-1">
              Initial Dry Weight (g) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              disabled={isLocked}
              value={formData.dryWeight}
              onChange={(e) => handleChange('dryWeight', e.target.value)}
              placeholder="e.g. 250"
              className="w-full px-3 py-1.5 rounded-lg border border-sand-300 font-mono text-xs focus:ring-2 focus:ring-forest-600"
            />
          </div>

          <div>
            <label className="text-sand-700 font-semibold block text-[11px] mb-1">
              Final Saturated Wet Weight (g) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              disabled={isLocked}
              value={formData.wetWeight}
              onChange={(e) => handleChange('wetWeight', e.target.value)}
              placeholder="e.g. 1305"
              className="w-full px-3 py-1.5 rounded-lg border border-sand-300 font-mono text-xs focus:ring-2 focus:ring-forest-600"
            />
          </div>

          <div className="p-2.5 rounded-lg bg-sand-50 border border-sand-200 flex flex-col justify-center">
            <span className="text-[10px] text-sand-500 font-semibold uppercase">Calculated Absorption</span>
            <div className="flex items-center justify-between mt-0.5">
              <span className="font-mono font-bold text-base text-sand-900">
                {absCalc.isValid ? `${absCalc.value}%` : '—'}
              </span>
              <span className="text-[11px] text-sand-500 font-medium">Target: ≥ 400%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Water Retention Test */}
      <div className="p-4 rounded-xl border border-sand-200 bg-white space-y-3">
        <div className="flex items-center justify-between border-b border-sand-100 pb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-600" />
            <h4 className="font-bold text-sand-900 text-xs uppercase tracking-wide">
              2. Water Retention Test
            </h4>
          </div>
          <div className="flex items-center gap-2">
            {getPill(retEval)}
            <span className="font-mono text-xs font-bold text-forest-800 bg-forest-50 px-2 py-0.5 rounded border border-forest-200">
              Formula: (Retained / Absorbed) × 100
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-sand-700 font-semibold block text-[11px] mb-1">
              Water Absorbed (g or mL) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              disabled={isLocked}
              value={formData.waterAbsorbed}
              onChange={(e) => handleChange('waterAbsorbed', e.target.value)}
              placeholder="e.g. 1055"
              className="w-full px-3 py-1.5 rounded-lg border border-sand-300 font-mono text-xs focus:ring-2 focus:ring-forest-600"
            />
          </div>

          <div>
            <label className="text-sand-700 font-semibold block text-[11px] mb-1">
              Water Retained (g or mL) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              disabled={isLocked}
              value={formData.waterRetained}
              onChange={(e) => handleChange('waterRetained', e.target.value)}
              placeholder="e.g. 839"
              className="w-full px-3 py-1.5 rounded-lg border border-sand-300 font-mono text-xs focus:ring-2 focus:ring-forest-600"
            />
          </div>

          <div>
            <label className="text-sand-700 font-semibold block text-[11px] mb-1">
              Drainage Duration (min)
            </label>
            <input
              type="number"
              disabled={isLocked}
              value={formData.drainageDuration}
              onChange={(e) => handleChange('drainageDuration', e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-sand-300 font-mono text-xs focus:ring-2 focus:ring-forest-600"
            />
          </div>

          <div className="p-2.5 rounded-lg bg-sand-50 border border-sand-200 flex flex-col justify-center">
            <span className="text-[10px] text-sand-500 font-semibold uppercase">Calculated Retention</span>
            <div className="flex items-center justify-between mt-0.5">
              <span className="font-mono font-bold text-base text-sand-900">
                {retCalc.isValid ? `${retCalc.value}%` : '—'}
              </span>
              <span className="text-[11px] text-sand-500 font-medium">Target: ≥ 78%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Moisture Distribution Test */}
      <div className="p-4 rounded-xl border border-sand-200 bg-white space-y-3">
        <div className="flex items-center justify-between border-b border-sand-100 pb-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h4 className="font-bold text-sand-900 text-xs uppercase tracking-wide">
              3. Moisture Distribution Test
            </h4>
          </div>
          <div className="flex items-center gap-2">
            {getPill(moistEval)}
            <span className="font-mono text-xs font-bold text-forest-800 bg-forest-50 px-2 py-0.5 rounded border border-forest-200">
              Formula: ((Max - Min) / Avg) × 100 (% variation)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <div>
            <label className="text-sand-700 font-semibold block text-[11px] mb-1">
              Top Layer Moisture (%)
            </label>
            <input
              type="number"
              step="0.1"
              disabled={isLocked}
              value={formData.topLayerMoisture}
              onChange={(e) => handleChange('topLayerMoisture', e.target.value)}
              placeholder="e.g. 68.0"
              className="w-full px-3 py-1.5 rounded-lg border border-sand-300 font-mono text-xs focus:ring-2 focus:ring-forest-600"
            />
          </div>

          <div>
            <label className="text-sand-700 font-semibold block text-[11px] mb-1">
              Mid Layer Moisture (%)
            </label>
            <input
              type="number"
              step="0.1"
              disabled={isLocked}
              value={formData.midLayerMoisture}
              onChange={(e) => handleChange('midLayerMoisture', e.target.value)}
              placeholder="e.g. 63.5"
              className="w-full px-3 py-1.5 rounded-lg border border-sand-300 font-mono text-xs focus:ring-2 focus:ring-forest-600"
            />
          </div>

          <div>
            <label className="text-sand-700 font-semibold block text-[11px] mb-1">
              Bottom Layer Moisture (%)
            </label>
            <input
              type="number"
              step="0.1"
              disabled={isLocked}
              value={formData.bottomLayerMoisture}
              onChange={(e) => handleChange('bottomLayerMoisture', e.target.value)}
              placeholder="e.g. 59.0"
              className="w-full px-3 py-1.5 rounded-lg border border-sand-300 font-mono text-xs focus:ring-2 focus:ring-forest-600"
            />
          </div>

          <div className="p-2.5 rounded-lg bg-sand-50 border border-sand-200 flex flex-col justify-center">
            <span className="text-[10px] text-sand-500 font-semibold uppercase">Layer Average</span>
            <span className="font-mono font-bold text-sm text-sand-800 mt-0.5">
              {moistCalc.isValid ? `${moistCalc.average}%` : '—'}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-sand-50 border border-sand-200 flex flex-col justify-center">
            <span className="text-[10px] text-sand-500 font-semibold uppercase">Relative Variation</span>
            <div className="flex items-center justify-between mt-0.5">
              <span className="font-mono font-bold text-base text-sand-900">
                {moistCalc.isValid ? `${moistCalc.variationPct}%` : '—'}
              </span>
              <span className="text-[10px] text-sand-500 font-medium">Target: ≤ 15%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Structural Stability Test */}
      <div className="p-4 rounded-xl border border-sand-200 bg-white space-y-3">
        <div className="flex items-center justify-between border-b border-sand-100 pb-2">
          <div className="flex items-center gap-2">
            <Weight className="w-4 h-4 text-amber-700" />
            <h4 className="font-bold text-sand-900 text-xs uppercase tracking-wide">
              4. Structural Stability Test
            </h4>
          </div>
          <div className="flex items-center gap-2">
            {getPill(stabEval)}
            <span className="font-mono text-xs font-bold text-forest-800 bg-forest-50 px-2 py-0.5 rounded border border-forest-200">
              Formula: ((Initial - Final) / Initial) × 100 (% deformation)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <div>
            <label className="text-sand-700 font-semibold block text-[11px] mb-1">
              Initial Thickness (mm) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              disabled={isLocked}
              value={formData.initialThickness}
              onChange={(e) => handleChange('initialThickness', e.target.value)}
              placeholder="e.g. 35.0"
              className="w-full px-3 py-1.5 rounded-lg border border-sand-300 font-mono text-xs focus:ring-2 focus:ring-forest-600"
            />
          </div>

          <div>
            <label className="text-sand-700 font-semibold block text-[11px] mb-1">
              Final Thickness Under Load (mm) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              disabled={isLocked}
              value={formData.finalThickness}
              onChange={(e) => handleChange('finalThickness', e.target.value)}
              placeholder="e.g. 32.2"
              className="w-full px-3 py-1.5 rounded-lg border border-sand-300 font-mono text-xs focus:ring-2 focus:ring-forest-600"
            />
          </div>

          <div>
            <label className="text-sand-700 font-semibold block text-[11px] mb-1">
              Test Load (N / kg)
            </label>
            <input
              type="number"
              disabled={isLocked}
              value={formData.compressionForce}
              onChange={(e) => handleChange('compressionForce', e.target.value)}
              placeholder="450"
              className="w-full px-3 py-1.5 rounded-lg border border-sand-300 font-mono text-xs focus:ring-2 focus:ring-forest-600"
            />
          </div>

          <div>
            <label className="text-sand-700 font-semibold block text-[11px] mb-1">
              Load Duration (h)
            </label>
            <input
              type="number"
              disabled={isLocked}
              value={formData.loadDurationHours}
              onChange={(e) => handleChange('loadDurationHours', e.target.value)}
              placeholder="24"
              className="w-full px-3 py-1.5 rounded-lg border border-sand-300 font-mono text-xs focus:ring-2 focus:ring-forest-600"
            />
          </div>

          <div className="p-2.5 rounded-lg bg-sand-50 border border-sand-200 flex flex-col justify-center">
            <span className="text-[10px] text-sand-500 font-semibold uppercase">Deformation (%)</span>
            <div className="flex items-center justify-between mt-0.5">
              <span className="font-mono font-bold text-base text-sand-900">
                {stabCalc.isValid ? `${stabCalc.value}%` : '—'}
              </span>
              <span className="text-[10px] text-sand-500 font-medium">Target: ≤ 10%</span>
            </div>
          </div>
        </div>

        <div>
          <label className="text-sand-700 font-semibold block text-[11px] mb-1">
            Structural Observations
          </label>
          <input
            type="text"
            disabled={isLocked}
            value={formData.structuralObservations}
            onChange={(e) => handleChange('structuralObservations', e.target.value)}
            placeholder="e.g. No delamination, resilient recovery observed under 450N load over 24h"
            className="w-full px-3 py-1.5 rounded-lg border border-sand-300 text-xs focus:ring-2 focus:ring-forest-600"
          />
        </div>
      </div>

      {/* 5. Drying Behaviour Test */}
      <div className="p-4 rounded-xl border border-sand-200 bg-white space-y-3">
        <div className="flex items-center justify-between border-b border-sand-100 pb-2">
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-orange-600" />
            <h4 className="font-bold text-sand-900 text-xs uppercase tracking-wide">
              5. Drying Behaviour Test
            </h4>
          </div>
          <div className="flex items-center gap-2">
            {getPill(dryEval)}
            <span className="font-mono text-xs font-bold text-forest-800 bg-forest-50 px-2 py-0.5 rounded border border-forest-200">
              Formula: ((Initial - Final) / Initial) × 100 (% weight loss)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <div>
            <label className="text-sand-700 font-semibold block text-[11px] mb-1">
              Initial Wet Weight (g) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              disabled={isLocked}
              value={formData.dryingInitialWet}
              onChange={(e) => handleChange('dryingInitialWet', e.target.value)}
              placeholder="e.g. 1305"
              className="w-full px-3 py-1.5 rounded-lg border border-sand-300 font-mono text-xs focus:ring-2 focus:ring-forest-600"
            />
          </div>

          <div>
            <label className="text-sand-700 font-semibold block text-[11px] mb-1">
              Final Weight After Drying (g) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              disabled={isLocked}
              value={formData.dryingFinalWeight}
              onChange={(e) => handleChange('dryingFinalWeight', e.target.value)}
              placeholder="e.g. 450"
              className="w-full px-3 py-1.5 rounded-lg border border-sand-300 font-mono text-xs focus:ring-2 focus:ring-forest-600"
            />
          </div>

          <div>
            <label className="text-sand-700 font-semibold block text-[11px] mb-1">
              Target Duration (h)
            </label>
            <input
              type="number"
              disabled={isLocked}
              value={formData.dryingDuration}
              onChange={(e) => handleChange('dryingDuration', e.target.value)}
              placeholder="24"
              className="w-full px-3 py-1.5 rounded-lg border border-sand-300 font-mono text-xs focus:ring-2 focus:ring-forest-600"
            />
          </div>

          <div>
            <label className="text-sand-700 font-semibold block text-[11px] mb-1">
              Chamber Temp (°C)
            </label>
            <input
              type="number"
              disabled={isLocked}
              value={formData.dryingTemp}
              onChange={(e) => handleChange('dryingTemp', e.target.value)}
              placeholder="32"
              className="w-full px-3 py-1.5 rounded-lg border border-sand-300 font-mono text-xs focus:ring-2 focus:ring-forest-600"
            />
          </div>

          <div className="p-2.5 rounded-lg bg-sand-50 border border-sand-200 flex flex-col justify-center">
            <span className="text-[10px] text-sand-500 font-semibold uppercase">Weight Loss (%)</span>
            <div className="flex items-center justify-between mt-0.5">
              <span className="font-mono font-bold text-base text-sand-900">
                {dryCalc.isValid ? `${dryCalc.value}%` : '—'}
              </span>
              <span className="text-[10px] text-sand-500 font-medium">Target: 55%–75%</span>
            </div>
          </div>
        </div>

        <div>
          <label className="text-sand-700 font-semibold block text-[11px] mb-1">
            Drying & Surface Texture Observations
          </label>
          <input
            type="text"
            disabled={isLocked}
            value={formData.dryingObservations}
            onChange={(e) => handleChange('dryingObservations', e.target.value)}
            placeholder="e.g. Uniform drying curve, no crusting or warped edges observed"
            className="w-full px-3 py-1.5 rounded-lg border border-sand-300 text-xs focus:ring-2 focus:ring-forest-600"
          />
        </div>
      </div>

      {/* Reviewer Notes & Action Buttons */}
      <div className="p-4 rounded-xl border border-sand-200 bg-sand-50/50 space-y-3">
        <label className="text-sand-700 font-semibold block text-xs">
          Technician / Reviewer Laboratory Field Notes
        </label>
        <textarea
          rows={2}
          disabled={isLocked}
          value={reviewerNotes}
          onChange={(e) => setReviewerNotes(e.target.value)}
          placeholder="Detailed observations on fiber matrix texture, bulk density, or test anomalies..."
          className="w-full p-2.5 rounded-lg border border-sand-300 text-xs text-sand-900 focus:outline-none focus:ring-2 focus:ring-forest-600"
        />

        {!isLocked && (
          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" size="sm" icon={Save}>
              Save Measurements & Auto-Grade Bed
            </Button>
          </div>
        )}
      </div>
    </form>
  );
}
