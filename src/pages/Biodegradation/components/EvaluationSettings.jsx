import React, { useState } from 'react';
import { 
  Check, 
  Info, 
  ShieldAlert, 
  Save, 
  Layers 
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { biodegradationService } from '../../../services/biodegradationService';

export function EvaluationSettings({ onCriteriaUpdated }) {
  const [criteria, setCriteria] = useState(() => biodegradationService.getEvaluationCriteria());
  const [formData, setFormData] = useState({
    version: criteria.version || 'v1.2-EXP',
    observationDurationDays: String(criteria.observationDurationDays || 180),
    measurementFrequencyDays: String(criteria.measurementFrequencyDays || 30),
    minMassLossThresholdPct: criteria.minMassLossThresholdPct !== null && criteria.minMassLossThresholdPct !== undefined ? String(criteria.minMassLossThresholdPct) : '',
    criteriaDescription: criteria.criteriaDescription || '',
    soilBurialNote: criteria.environmentalNotes?.soilBurial || '',
    compostingNote: criteria.environmentalNotes?.composting || '',
    openAirNote: criteria.environmentalNotes?.openAir || '',
    laboratoryNote: criteria.environmentalNotes?.laboratory || '',
  });

  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    setIsSaved(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updated = biodegradationService.updateEvaluationCriteria({
      version: formData.version,
      observationDurationDays: parseInt(formData.observationDurationDays, 10) || 180,
      measurementFrequencyDays: parseInt(formData.measurementFrequencyDays, 10) || 30,
      minMassLossThresholdPct: formData.minMassLossThresholdPct ? parseFloat(formData.minMassLossThresholdPct) : null,
      criteriaDescription: formData.criteriaDescription,
      environmentalNotes: {
        soilBurial: formData.soilBurialNote,
        composting: formData.compostingNote,
        openAir: formData.openAirNote,
        laboratory: formData.laboratoryNote,
      },
    });

    setCriteria(updated);
    setIsSaved(true);
    if (onCriteriaUpdated) onCriteriaUpdated(updated);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <Card
      title="Configurable Evaluation Criteria &amp; Observation Protocols"
      subtitle="Standardized parameters governing empirical observation duration, cadence, and scientific boundaries."
      action={
        <Badge variant="neutral" size="sm">
          Protocol Version: {criteria.version}
        </Badge>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6 pt-2">
        {isSaved && (
          <div className="p-3 bg-forest-50 border border-forest-200 text-forest-800 rounded-xl text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-forest-600" />
              <span>Evaluation criteria updated and stored in platform memory (Version: {criteria.version}).</span>
            </div>
            <Badge variant="success" size="xs">Updated</Badge>
          </div>
        )}

        {/* Essential Scientific Notice */}
        <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2 text-xs text-amber-900">
          <div className="flex items-center gap-2 font-bold text-amber-800">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Scientific Standard &amp; Certification Governance</span>
          </div>
          <p className="text-[11px] leading-relaxed text-amber-900">
            {criteria.certificationDisclaimer}
          </p>
          <div className="text-[10px] text-amber-800 font-mono pt-1 border-t border-amber-200">
            Important: The Wall distinguishes empirical observation records from certification standards. Visual fragmentation does not establish complete compostability.
          </div>
        </div>

        {/* Protocol Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Protocol Version Identifier"
            value={formData.version}
            onChange={(e) => handleChange('version', e.target.value)}
            required
          />

          <Input
            label="Observation Duration (Days)"
            type="number"
            value={formData.observationDurationDays}
            onChange={(e) => handleChange('observationDurationDays', e.target.value)}
            required
          />

          <Input
            label="Measurement Frequency (Days)"
            type="number"
            value={formData.measurementFrequencyDays}
            onChange={(e) => handleChange('measurementFrequencyDays', e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-sand-700 mb-1">
            General Evaluation Description &amp; Scope
          </label>
          <textarea
            value={formData.criteriaDescription}
            onChange={(e) => handleChange('criteriaDescription', e.target.value)}
            rows={2}
            className="w-full text-xs p-2.5 rounded-lg border border-sand-300 focus:outline-none focus:ring-2 focus:ring-forest-600"
          />
        </div>

        {/* Environment-Specific Protocol Notes */}
        <div className="p-4 bg-sand-50/60 rounded-xl border border-sand-200 space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-sand-700" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-sand-800">
              Environment-Specific Observation Notes
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-sand-700 mb-1">
                Soil Burial Protocol Notes
              </label>
              <textarea
                value={formData.soilBurialNote}
                onChange={(e) => handleChange('soilBurialNote', e.target.value)}
                rows={2}
                className="w-full text-xs p-2 rounded-lg border border-sand-300"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-sand-700 mb-1">
                Composting Environment Protocol Notes
              </label>
              <textarea
                value={formData.compostingNote}
                onChange={(e) => handleChange('compostingNote', e.target.value)}
                rows={2}
                className="w-full text-xs p-2 rounded-lg border border-sand-300"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-sand-700 mb-1">
                Open-Air Weathering Protocol Notes
              </label>
              <textarea
                value={formData.openAirNote}
                onChange={(e) => handleChange('openAirNote', e.target.value)}
                rows={2}
                className="w-full text-xs p-2 rounded-lg border border-sand-300"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-sand-700 mb-1">
                Controlled Laboratory Protocol Notes
              </label>
              <textarea
                value={formData.laboratoryNote}
                onChange={(e) => handleChange('laboratoryNote', e.target.value)}
                rows={2}
                className="w-full text-xs p-2 rounded-lg border border-sand-300"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-sand-200">
          <div className="flex items-center gap-1.5 text-xs text-sand-500">
            <Info className="w-4 h-4 text-sand-400" />
            <span>Criteria revisions are persisted to local storage and associated with future observation batches.</span>
          </div>
          <Button type="submit" variant="primary" size="sm" icon={Save}>
            Save Evaluation Criteria
          </Button>
        </div>
      </form>
    </Card>
  );
}
