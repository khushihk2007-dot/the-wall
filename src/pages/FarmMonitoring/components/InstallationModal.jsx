import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { Save, Plus } from 'lucide-react';
import { manufacturingService } from '../../../services/manufacturingService';

export function InstallationModal({
  isOpen,
  onClose,
  installation,
  farms = [],
  devices = [],
  onSave,
}) {
  const isEditing = !!installation;
  const [batches, setBatches] = useState(() => manufacturingService.getCachedBatches());

  useEffect(() => {
    manufacturingService.getBatches().then((data) => {
      setBatches(data);
      if (!installation && data.length > 0) {
        setFormData((prev) => ({
          ...prev,
          batchId: prev.batchId || data[0].id,
        }));
      }
    }).catch(() => {});
  }, [installation]);

  const [formData, setFormData] = useState(() => {
    if (installation) {
      return {
        farmId: installation.farmId || (farms[0]?.id || ''),
        batchId: installation.batchId || (batches[0]?.id || ''),
        cropType: installation.cropType || '',
        dimensions: installation.dimensions || '100cm x 30cm x 3.5cm',
        location: installation.location || '',
        deviceId: installation.deviceId || '',
        status: installation.status || 'Monitoring',
        notes: installation.notes || '',
      };
    }
    return {
      farmId: farms[0]?.id || '',
      batchId: batches[0]?.id || '',
      cropType: 'Tomato Nursery',
      dimensions: '100cm x 30cm x 3.5cm',
      location: 'Tunnel A, Bed 01',
      deviceId: devices[0]?.id || '',
      status: 'Monitoring',
      notes: '',
    };
  });

  const [error, setError] = useState('');

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.farmId) {
      setError('A farm site must be selected.');
      return;
    }
    if (!formData.batchId) {
      setError('A valid manufacturing batch ID must be linked for traceability.');
      return;
    }
    if (!formData.cropType.trim()) {
      setError('Crop type is required.');
      return;
    }

    onSave({
      ...formData,
      deviceId: formData.deviceId || null,
    });
    onClose();
  };

  const farmOptions = farms.map((f) => ({
    value: f.id,
    label: `${f.name} (${f.location})`,
  }));

  const batchOptions = batches.map((b) => ({
    value: b.id,
    label: `${b.id} — ${b.stage || b.currentStage || 'In Progress'} (${b.quantity ? b.quantity + ' beds' : b.status || ''})`,
  }));

  const deviceOptions = [
    { value: '', label: 'None (Standalone / Manual)' },
    ...devices.map((d) => ({
      value: d.id,
      label: `${d.id} - ${d.name} (${d.connectionStatus})`,
    })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Installation: ${installation.id}` : 'Deploy New CocoPit Bed'}
      subtitle={
        isEditing
          ? `Update configuration for bed installation ${installation.id}`
          : 'Link a manufactured CocoPit batch to a farm site and assign an ESP32 gateway.'
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
          <Select
            label="Target Farm / Site"
            value={formData.farmId}
            onChange={(e) => handleChange('farmId', e.target.value)}
            options={farmOptions}
            required
          />

          <Select
            label="Manufacturing Batch (Source Material)"
            value={formData.batchId}
            onChange={(e) => handleChange('batchId', e.target.value)}
            options={batchOptions}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Planted Crop / Variety"
            placeholder="e.g. San Marzano Tomatoes"
            value={formData.cropType}
            onChange={(e) => handleChange('cropType', e.target.value)}
            required
          />

          <Input
            label="Plot / Bed Location Reference"
            placeholder="e.g. Tunnel B, Raised Bench 04"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Input
              label="Bed Dimensions"
              value={formData.dimensions}
              onChange={(e) => handleChange('dimensions', e.target.value)}
            />
          </div>

          <div>
            <Select
              label="ESP32 Gateway Node"
              value={formData.deviceId}
              onChange={(e) => handleChange('deviceId', e.target.value)}
              options={deviceOptions}
            />
          </div>

          <div>
            <Select
              label="Installation Status"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              options={[
                { value: 'Monitoring', label: 'Monitoring (Active)' },
                { value: 'Installed', label: 'Installed (Awaiting Telemetry)' },
                { value: 'Maintenance Required', label: 'Maintenance Required' },
                { value: 'Inactive', label: 'Inactive / Harvested' },
                { value: 'Registered', label: 'Registered' },
              ]}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-sand-700 mb-1">
            Deployment Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Seeding date, substrate pre-hydration details, irrigation cycle..."
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
            {isEditing ? 'Save Installation' : 'Complete Deployment'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
