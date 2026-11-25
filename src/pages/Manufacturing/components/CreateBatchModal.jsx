import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { Layers, Plus, Sparkles, Loader2 } from 'lucide-react';

const INITIAL_FORM_VALUES = {
  quantity: '100',
  cottonKg: '30',
  coirKg: '45',
  mediumKg: '25',
  binder: 'Organic starch binder (2.0 kg)',
  startDate: new Date().toISOString().split('T')[0],
  notes: '',
};

export function CreateBatchModal({ isOpen, onClose, onCreateBatch, isSubmitting = false }) {
  const [formData, setFormData] = useState(INITIAL_FORM_VALUES);
  const [errors, setErrors] = useState({});

  const handleClose = () => {
    if (isSubmitting) return;
    setFormData(INITIAL_FORM_VALUES);
    setErrors({});
    onClose();
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Live formulation weight & percentages
  const cotton = Number(formData.cottonKg) || 0;
  const coir = Number(formData.coirKg) || 0;
  const medium = Number(formData.mediumKg) || 0;
  const totalWeight = cotton + coir + medium;

  const cottonPct = totalWeight > 0 ? ((cotton / totalWeight) * 100).toFixed(1) : 0;
  const coirPct = totalWeight > 0 ? ((coir / totalWeight) * 100).toFixed(1) : 0;
  const mediumPct = totalWeight > 0 ? ((medium / totalWeight) * 100).toFixed(1) : 0;

  const validate = () => {
    const errs = {};
    if (!formData.quantity || Number(formData.quantity) <= 0) {
      errs.quantity = 'Quantity must be at least 1 unit';
    }
    if (!formData.cottonKg || Number(formData.cottonKg) <= 0) {
      errs.cottonKg = 'Cotton quantity must be greater than 0';
    }
    if (!formData.coirKg || Number(formData.coirKg) <= 0) {
      errs.coirKg = 'Coconut coir quantity must be greater than 0';
    }
    if (!formData.mediumKg || Number(formData.mediumKg) <= 0) {
      errs.mediumKg = 'Growing medium quantity must be greater than 0';
    }
    if (!formData.startDate) {
      errs.startDate = 'Production start date is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validate()) return;

    onCreateBatch({
      ...formData,
      quantity: Number(formData.quantity),
      cottonKg: Number(formData.cottonKg),
      coirKg: Number(formData.coirKg),
      mediumKg: Number(formData.mediumKg),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Production Batch"
      subtitle="Register a new manufacturing run for dual-layer biodegradable growing beds"
      maxWidth="max-w-2xl"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={isSubmitting ? Loader2 : Plus}
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={isSubmitting ? 'cursor-not-allowed opacity-80' : ''}
          >
            {isSubmitting ? 'Initializing Batch...' : 'Initialize Batch'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Batch ID auto-generated display */}
        <div className="p-3 rounded-lg bg-forest-50/70 border border-forest-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700">
              Assigned Batch Code
            </span>
            <p className="font-mono font-bold text-base text-forest-900">
              TW-YYYY-BXXX
            </p>
            <p className="text-[11px] text-forest-600 mt-0.5">
              Unique sequential code assigned automatically by the backend upon creation.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-forest-700 font-medium bg-white px-2.5 py-1 rounded-md border border-forest-200 shadow-sm shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Auto-Generated</span>
          </div>
        </div>

        {/* Quantities Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Production Quantity (Beds)"
            type="number"
            min="1"
            value={formData.quantity}
            onChange={(e) => handleChange('quantity', e.target.value)}
            error={errors.quantity}
            placeholder="e.g. 100"
            disabled={isSubmitting}
            required
          />

          <Input
            label="Production Start Date"
            type="date"
            value={formData.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            error={errors.startDate}
            disabled={isSubmitting}
            required
          />
        </div>

        {/* Material Inputs */}
        <div className="p-4 rounded-xl bg-sand-50/60 border border-sand-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-sand-700 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-forest-700" />
              Raw Material Composition
            </span>
            <span className="text-xs font-mono text-sand-500">
              Total Weight: {totalWeight.toFixed(1)} kg
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Natural Cotton (kg)"
              type="number"
              step="0.5"
              min="0.5"
              value={formData.cottonKg}
              onChange={(e) => handleChange('cottonKg', e.target.value)}
              error={errors.cottonKg}
              disabled={isSubmitting}
              required
            />
            <Input
              label="Coconut Coir (kg)"
              type="number"
              step="0.5"
              min="0.5"
              value={formData.coirKg}
              onChange={(e) => handleChange('coirKg', e.target.value)}
              error={errors.coirKg}
              disabled={isSubmitting}
              required
            />
            <Input
              label="Growing Medium (kg)"
              type="number"
              step="0.5"
              min="0.5"
              value={formData.mediumKg}
              onChange={(e) => handleChange('mediumKg', e.target.value)}
              error={errors.mediumKg}
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Live Proportion Display */}
          <div className="pt-2 border-t border-sand-200 text-xs">
            <div className="flex justify-between text-sand-600 mb-1.5 font-medium">
              <span>Formulation Ratio:</span>
              <span className="font-mono">
                Cotton {cottonPct}% / Coir {coirPct}% / Medium {mediumPct}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-sand-200 overflow-hidden flex">
              <div style={{ width: `${cottonPct}%` }} className="bg-sand-400" title="Cotton" />
              <div style={{ width: `${coirPct}%` }} className="bg-earth-600" title="Coconut Coir" />
              <div style={{ width: `${mediumPct}%` }} className="bg-forest-600" title="Top Growing Medium" />
            </div>
          </div>
        </div>

        {/* Binder details */}
        <Select
          label="Biodegradable Binder"
          options={[
            'Organic starch binder (2.0 kg)',
            'Natural plant resin (2.5 kg)',
            'Cassava bio-matrix (1.8 kg)',
            'None (Pure mechanical hydraulic interlock)',
          ]}
          value={formData.binder}
          onChange={(e) => handleChange('binder', e.target.value)}
          disabled={isSubmitting}
        />

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-sand-800 tracking-wide">
            Production Notes & Trial Target
          </label>
          <textarea
            rows="2"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            disabled={isSubmitting}
            placeholder="e.g. Prototype batch for high-aeration nursery seedling bed trials..."
            className="w-full rounded-lg border border-sand-300 bg-white px-3.5 py-2 text-sm text-sand-900 placeholder:text-sand-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-forest-600 disabled:bg-sand-50 disabled:text-sand-500"
          />
        </div>
      </form>
    </Modal>
  );
}
