import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { 
  Scale, 
  Ruler, 
  CloudRain, 
  Camera, 
  Info, 
  AlertTriangle, 
  Check,
  Radio
} from 'lucide-react';
import { 
  PHYSICAL_APPEARANCES, 
  STRUCTURAL_INTEGRITIES 
} from '../../../constants/mockBiodegradationData';
import { useSensorData } from '../../../hooks/useSensorData';

export function ObservationFormModal({ isOpen, onClose, sample, onSave }) {
  const { data: sensorData, isConnected, lastFetchedAt } = useSensorData();
  const [formData, setFormData] = useState(() => {
    const initMass = sample?.initialDryMass || 450;
    const initDims = sample?.initialDimensions || { lengthMm: 300, widthMm: 150, thicknessMm: 35 };
    return {
      observationDate: new Date().toISOString().split('T')[0],
      currentDryMass: String(initMass),
      isMeasurementCorrection: false,
      physicalAppearance: 'No visible change',
      structuralIntegrity: 'Intact',
      photoUrl: '',
      lengthMm: String(initDims.lengthMm),
      widthMm: String(initDims.widthMm),
      thicknessMm: String(initDims.thicknessMm),
      temperatureC: '22.0',
      relativeHumidityPct: '65.0',
      soilMoisturePct: '55.0',
      soilPh: '6.8',
      measurementMethod: 'Oven-dried at 60°C for 24h & analytical balance',
      notes: '',
      observer: sample?.responsibleObserver || 'QC Observer',
    };
  });

  const [error, setError] = useState('');

  if (!sample) return null;

  const initialMass = sample.initialDryMass || 450;
  const initialDims = sample.initialDimensions || { lengthMm: 300, widthMm: 150, thicknessMm: 35 };

  // Live calculation of Mass Loss %
  const currentMassNum = parseFloat(formData.currentDryMass);
  const isValidMass = !isNaN(currentMassNum) && currentMassNum >= 0;
  const liveMassLossPct = isValidMass && initialMass > 0
    ? Number((((initialMass - currentMassNum) / initialMass) * 100).toFixed(1))
    : 0.0;

  const isCurrentExceedingInitial = isValidMass && currentMassNum > initialMass;

  // Live calculation of dimensional change
  const curL = parseFloat(formData.lengthMm) || initialDims.lengthMm;
  const curW = parseFloat(formData.widthMm) || initialDims.widthMm;
  const curT = parseFloat(formData.thicknessMm) || initialDims.thicknessMm;
  const deltaL = curL - initialDims.lengthMm;
  const deltaW = curW - initialDims.widthMm;
  const deltaT = curT - initialDims.thicknessMm;

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (error) setError('');
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({ ...prev, photoUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValidMass) {
      setError('Please enter a valid non-negative current dry mass.');
      return;
    }

    if (isCurrentExceedingInitial && !formData.isMeasurementCorrection) {
      setError(
        `Current dry mass (${currentMassNum}g) cannot be greater than initial dry mass (${initialMass}g) unless flagged as a measurement correction.`
      );
      return;
    }

    onSave({
      ...formData,
      currentDryMass: currentMassNum,
      lengthMm: curL,
      widthMm: curW,
      thicknessMm: curT,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Biodegradation Observation"
      subtitle={`Specimen: ${sample.id} (${sample.sampleName}) • Initial Dry Mass: ${initialMass}g`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
            {error}
          </div>
        )}

        {/* Section 1: Mass Change */}
        <div className="p-4 bg-forest-50/40 rounded-xl border border-forest-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-forest-700" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-sand-900">
                A. Dry Mass Measurement &amp; Calculated Mass Loss
              </h4>
            </div>
            <Badge variant="forest" size="xs">
              Formula: ((M₀ - M₁) / M₀) × 100
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div>
              <Input
                label="Observation Date"
                type="date"
                value={formData.observationDate}
                onChange={(e) => handleChange('observationDate', e.target.value)}
                required
              />
            </div>

            <div>
              <Input
                label="Current Dry Mass (g)"
                type="number"
                step="0.1"
                min="0"
                value={formData.currentDryMass}
                onChange={(e) => handleChange('currentDryMass', e.target.value)}
                required
              />
            </div>

            <div className="p-2.5 bg-white rounded-lg border border-forest-200 flex flex-col justify-center">
              <span className="text-[10px] text-sand-500 font-semibold uppercase">Calculated Mass Loss:</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className={`text-xl font-bold font-mono ${
                  liveMassLossPct < 0 ? 'text-amber-700' : 'text-forest-900'
                }`}>
                  {liveMassLossPct}%
                </span>
                <span className="text-xs text-sand-500">
                  (-{(initialMass - (currentMassNum || initialMass)).toFixed(1)} g)
                </span>
              </div>
            </div>
          </div>

          {isCurrentExceedingInitial && (
            <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 flex items-center justify-between text-xs text-amber-900">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Current mass exceeds initial mass. Mark as measurement correction?</span>
              </div>
              <label className="flex items-center gap-1.5 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isMeasurementCorrection}
                  onChange={(e) => handleChange('isMeasurementCorrection', e.target.checked)}
                  className="rounded text-forest-600 focus:ring-forest-500"
                />
                <span>Correction / Re-calibration</span>
              </label>
            </div>
          )}
        </div>

        {/* Section 2: Physical Appearance & Structural Integrity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3 p-3.5 bg-white rounded-xl border border-sand-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sand-800">
              B. Physical Appearance
            </h4>
            <Select
              label="Visual Breakdown Stage"
              value={formData.physicalAppearance}
              onChange={(e) => handleChange('physicalAppearance', e.target.value)}
              options={PHYSICAL_APPEARANCES.map((p) => ({ value: p, label: p }))}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-sand-700 mb-1 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-sand-500" />
                <span>Optional Specimen Photograph</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="text-xs text-sand-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border file:border-sand-300 file:text-xs file:bg-sand-50 file:text-sand-700 hover:file:bg-sand-100 cursor-pointer"
              />
              {formData.photoUrl && (
                <div className="mt-2 relative w-16 h-16 rounded-lg overflow-hidden border border-sand-300">
                  <img src={formData.photoUrl} alt="Specimen observation" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3 p-3.5 bg-white rounded-xl border border-sand-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sand-800">
              C. Structural Integrity
            </h4>
            <Select
              label="Mechanical Cohesion State"
              value={formData.structuralIntegrity}
              onChange={(e) => handleChange('structuralIntegrity', e.target.value)}
              options={STRUCTURAL_INTEGRITIES.map((s) => ({ value: s, label: s }))}
              required
            />

            <Input
              label="Measurement Method / Conditioning"
              value={formData.measurementMethod}
              onChange={(e) => handleChange('measurementMethod', e.target.value)}
              placeholder="e.g. Oven dried at 60°C, 24h desiccator"
            />
          </div>
        </div>

        {/* Section 3: Dimensional Change */}
        <div className="p-3.5 bg-white rounded-xl border border-sand-200 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Ruler className="w-4 h-4 text-earth-700" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-sand-800">
                D. Dimensional Measurements (mm)
              </h4>
            </div>
            <span className="text-[11px] text-sand-500">
              Initial: {initialDims.lengthMm} × {initialDims.widthMm} × {initialDims.thicknessMm} mm
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Input
                label={`Length (mm) [${deltaL >= 0 ? `+${deltaL}` : deltaL}mm]`}
                type="number"
                value={formData.lengthMm}
                onChange={(e) => handleChange('lengthMm', e.target.value)}
              />
            </div>
            <div>
              <Input
                label={`Width (mm) [${deltaW >= 0 ? `+${deltaW}` : deltaW}mm]`}
                type="number"
                value={formData.widthMm}
                onChange={(e) => handleChange('widthMm', e.target.value)}
              />
            </div>
            <div>
              <Input
                label={`Thickness (mm) [${deltaT >= 0 ? `+${deltaT}` : deltaT}mm]`}
                type="number"
                value={formData.thicknessMm}
                onChange={(e) => handleChange('thicknessMm', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Section 4: Environmental Conditions (Optional) */}
        <div className="p-3.5 bg-sand-50/60 rounded-xl border border-sand-200 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CloudRain className="w-4 h-4 text-blue-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-sand-800">
                E. Environmental Conditions (Optional where available)
              </h4>
            </div>
            {isConnected && (
              <button
                type="button"
                onClick={() => {
                  const temp = sensorData?.dht2Valid && sensorData?.temperature2 != null 
                    ? String(sensorData.temperature2) 
                    : sensorData?.dht1Valid && sensorData?.temperature1 != null 
                      ? String(sensorData.temperature1) 
                      : formData.temperatureC;
                  const hum = sensorData?.dht2Valid && sensorData?.humidity2 != null 
                    ? String(sensorData.humidity2) 
                    : sensorData?.dht1Valid && sensorData?.humidity1 != null 
                      ? String(sensorData.humidity1) 
                      : formData.relativeHumidityPct;
                  const moist = sensorData?.soilValid && sensorData?.soilMoisturePercent != null 
                    ? String(sensorData.soilMoisturePercent) 
                    : formData.soilMoisturePct;

                  setFormData((prev) => ({
                    ...prev,
                    temperatureC: temp,
                    relativeHumidityPct: hum,
                    soilMoisturePct: moist,
                  }));
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded bg-forest-700 text-white hover:bg-forest-800 transition-colors"
                title="Populate live environmental telemetry from connected ESP32"
              >
                <Radio className="w-3 h-3 animate-pulse" />
                <span>Import Live ESP32 Telemetry</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Input
              label="Temperature (°C)"
              type="number"
              step="0.1"
              value={formData.temperatureC}
              onChange={(e) => handleChange('temperatureC', e.target.value)}
              placeholder="e.g. 24.5"
            />
            <Input
              label="Relative Humidity (%)"
              type="number"
              step="0.1"
              value={formData.relativeHumidityPct}
              onChange={(e) => handleChange('relativeHumidityPct', e.target.value)}
              placeholder="e.g. 68"
            />
            <Input
              label="Soil / Compost Moisture (%)"
              type="number"
              step="0.1"
              value={formData.soilMoisturePct}
              onChange={(e) => handleChange('soilMoisturePct', e.target.value)}
              placeholder="e.g. 58"
            />
            <Input
              label="Soil / Compost pH"
              type="number"
              step="0.1"
              value={formData.soilPh}
              onChange={(e) => handleChange('soilPh', e.target.value)}
              placeholder="e.g. 6.8"
            />
          </div>
        </div>

        {/* Observer & Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Input
              label="Observer Name"
              value={formData.observer}
              onChange={(e) => handleChange('observer', e.target.value)}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-sand-700 mb-1">
              Observation Notes &amp; Biological Markers
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={2}
              placeholder="Fungal mycelium growth, color shifts, invertebrate activity, root intrusion..."
              className="w-full text-xs p-2 rounded-lg border border-sand-300 focus:outline-none focus:ring-1 focus:ring-forest-600"
            />
          </div>
        </div>

        {/* Scientific Disclaimer */}
        <div className="p-2.5 bg-sand-100 rounded-lg text-[11px] text-sand-600 flex items-center gap-2">
          <Info className="w-4 h-4 text-sand-500 shrink-0" />
          <span>Observation record only. Does not establish automatic compliance with compostability standards.</span>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-sand-200">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" icon={Check}>
            Save Observation Record
          </Button>
        </div>
      </form>
    </Modal>
  );
}
