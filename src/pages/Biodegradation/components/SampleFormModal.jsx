import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { Save, Plus } from 'lucide-react';
import { manufacturingService } from '../../../services/manufacturingService';
import { OBSERVATION_ENVIRONMENTS, OBSERVATION_STATUSES } from '../../../constants/mockBiodegradationData';

export function SampleFormModal({ isOpen, onClose, sample, onSave }) {
  const isEditing = !!sample;
  const [batches, setBatches] = useState(() => manufacturingService.getCachedBatches());

  useEffect(() => {
    manufacturingService.getBatches().then((data) => {
      setBatches(data);
      if (!sample && data.length > 0) {
        setFormData((prev) => ({
          ...prev,
          batchId: prev.batchId || data[0].id,
        }));
      }
    }).catch(() => {});
  }, [sample]);

  const [formData, setFormData] = useState(() => {
    if (sample) {
      return {
        sampleName: sample.sampleName || '',
        batchId: sample.batchId || (batches[0]?.id || ''),
        productId: sample.productId || '',
        materialComposition: sample.materialComposition || '40% Cotton, 60% Coconut Coir, Natural Binder',
        sampleCollectionDate: sample.sampleCollectionDate || new Date().toISOString().split('T')[0],
        startDate: sample.startDate || new Date().toISOString().split('T')[0],
        environment: sample.environment || 'Soil burial',
        location: sample.location || '',
        cropApplication: sample.cropApplication || '',
        responsibleObserver: sample.responsibleObserver || '',
        status: sample.status || 'Under Observation',
        nextObservationDate: sample.nextObservationDate || '',
        initialDryMass: String(sample.initialDryMass || 450),
        lengthMm: String(sample.initialDimensions?.lengthMm || 300),
        widthMm: String(sample.initialDimensions?.widthMm || 150),
        thicknessMm: String(sample.initialDimensions?.thicknessMm || 35),
        notes: sample.notes || '',
      };
    }
    return {
      sampleName: 'Agricultural Substrate Test Specimen',
      batchId: batches[0]?.id || '',
      productId: 'CP-BED-EXP-001',
      materialComposition: '40% Cotton, 60% Coconut Coir, Starch Binder',
      sampleCollectionDate: new Date().toISOString().split('T')[0],
      startDate: new Date().toISOString().split('T')[0],
      environment: 'Soil burial',
      location: 'Solan Trial Field Plot A (Subsurface 15cm)',
      cropApplication: 'Post-Harvest Bed Residual',
      responsibleObserver: 'Dr. Rajesh Sharma (Agronomist)',
      status: 'Under Observation',
      nextObservationDate: '2026-12-15',
      initialDryMass: '450.0',
      lengthMm: '300',
      widthMm: '150',
      thicknessMm: '35',
      notes: 'Natural soil burial study evaluating seasonal decomposition kinetics.',
    };
  });

  const [error, setError] = useState('');

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.sampleName.trim()) {
      setError('Sample name is required.');
      return;
    }
    const mass = parseFloat(formData.initialDryMass);
    if (isNaN(mass) || mass <= 0) {
      setError('Initial dry mass must be a positive number in grams.');
      return;
    }

    onSave({
      ...formData,
      initialDryMass: mass,
      lengthMm: parseFloat(formData.lengthMm) || 300,
      widthMm: parseFloat(formData.widthMm) || 150,
      thicknessMm: parseFloat(formData.thicknessMm) || 35,
    });
    onClose();
  };

  const batchOptions = batches.map((b) => ({
    value: b.id,
    label: `${b.id} — ${b.stage || b.currentStage || 'In Progress'} (${b.quantity ? b.quantity + ' beds' : b.status || ''})`,
  }));

  const envOptions = OBSERVATION_ENVIRONMENTS.map((env) => ({
    value: env,
    label: env,
  }));

  const statusOptions = OBSERVATION_STATUSES.map((st) => ({
    value: st,
    label: st,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Specimen: ${sample.id}` : 'Register Biodegradation Specimen'}
      subtitle={
        isEditing
          ? `Update test specimen metadata and environmental configuration for ${sample.id}`
          : 'Log a new growing-bed coupon or field sample for progressive mass-loss tracking.'
      }
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Sample Name / Description"
            placeholder="e.g. Top/Bottom Dual-Layer Compost Coupon"
            value={formData.sampleName}
            onChange={(e) => handleChange('sampleName', e.target.value)}
            required
          />

          <Select
            label="Linked Manufacturing Batch"
            value={formData.batchId}
            onChange={(e) => handleChange('batchId', e.target.value)}
            options={batchOptions}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Product / Growing Bed ID"
            placeholder="e.g. CP-BED-037-015"
            value={formData.productId}
            onChange={(e) => handleChange('productId', e.target.value)}
          />

          <Input
            label="Material Composition"
            placeholder="e.g. 40% Cotton, 60% Coconut Coir, Starch Binder"
            value={formData.materialComposition}
            onChange={(e) => handleChange('materialComposition', e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Observation Environment"
            value={formData.environment}
            onChange={(e) => handleChange('environment', e.target.value)}
            options={envOptions}
            required
          />

          <Input
            label="Sample Collection Date"
            type="date"
            value={formData.sampleCollectionDate}
            onChange={(e) => handleChange('sampleCollectionDate', e.target.value)}
            required
          />

          <Input
            label="Test Start Date"
            type="date"
            value={formData.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Observation Location / Setup"
            placeholder="e.g. Solan Trial Field Plot A (Depth 15cm)"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            required
          />

          <Input
            label="Crop Application / Exposure Type"
            placeholder="e.g. Post-Harvest Residual, Aerobic Windrow"
            value={formData.cropApplication}
            onChange={(e) => handleChange('cropApplication', e.target.value)}
          />
        </div>

        {/* Physical Baseline Measurements */}
        <div className="p-3 bg-sand-50 rounded-xl border border-sand-200 space-y-3">
          <span className="text-xs font-bold text-sand-800 uppercase tracking-wider block">
            Baseline Physical Measurements (Day 0)
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <Input
                label="Initial Dry Mass (g)"
                type="number"
                step="0.1"
                min="0.1"
                placeholder="e.g. 450.0"
                value={formData.initialDryMass}
                onChange={(e) => handleChange('initialDryMass', e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                label="Length (mm)"
                type="number"
                value={formData.lengthMm}
                onChange={(e) => handleChange('lengthMm', e.target.value)}
              />
            </div>
            <div>
              <Input
                label="Width (mm)"
                type="number"
                value={formData.widthMm}
                onChange={(e) => handleChange('widthMm', e.target.value)}
              />
            </div>
            <div>
              <Input
                label="Thickness (mm)"
                type="number"
                value={formData.thicknessMm}
                onChange={(e) => handleChange('thicknessMm', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Responsible Observer"
            placeholder="e.g. Dr. Rajesh Sharma"
            value={formData.responsibleObserver}
            onChange={(e) => handleChange('responsibleObserver', e.target.value)}
            required
          />

          <Select
            label="Observation Status"
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
            options={statusOptions}
          />

          <Input
            label="Next Scheduled Observation"
            type="date"
            value={formData.nextObservationDate}
            onChange={(e) => handleChange('nextObservationDate', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-sand-700 mb-1">
            Research Notes &amp; Experimental Conditions
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Soil characteristics, moisture replenishment plan, mesh bag aperture size..."
            rows={2}
            className="w-full text-xs p-2.5 rounded-lg border border-sand-300 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-forest-600"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-sand-200">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            icon={isEditing ? Save : Plus}
          >
            {isEditing ? 'Save Changes' : 'Register Specimen'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
