import React, { useState } from 'react';
import { Droplet, AlertCircle } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { USAGE_PURPOSES } from '../../../constants/mockWaterData';

export function RecordUsageModal({
  isOpen,
  onClose,
  tank,
  farms = [],
  installations = [],
  onSave,
}) {
  const [formData, setFormData] = useState(() => {
    const now = new Date();
    // format as YYYY-MM-DDTHH:mm for datetime-local
    const pad = (n) => String(n).padStart(2, '0');
    const localIso = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;

    return {
      timestamp: localIso,
      amountLitres: '',
      purpose: USAGE_PURPOSES[0],
      farmId: tank?.farmId || (farms[0]?.id || 'FARM-001'),
      installationId: tank?.installationId || '',
      recordedBy: 'Vikram Mehta (Farm Lead)',
      notes: '',
    };
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = Number(formData.amountLitres);
    if (!amount || amount <= 0) {
      setError('Please enter a valid water consumption amount in litres.');
      return;
    }

    const selectedFarm = farms.find((f) => f.id === formData.farmId);

    onSave({
      ...formData,
      tankId: tank.id,
      amountLitres: amount,
      farmName: selectedFarm ? selectedFarm.name : tank.farmName,
    });

    onClose();
  };

  const relevantInstallations = installations.filter(
    (inst) => !formData.farmId || inst.farmId === formData.farmId
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Manual Water Usage"
      subtitle={`${tank?.name || 'Reservoir'} • Manual entry`}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Water Used (Litres) *"
            type="number"
            step="1"
            min="1"
            name="amountLitres"
            value={formData.amountLitres}
            onChange={handleChange}
            placeholder="e.g. 180"
            helperText="Volume consumed during this cycle"
            required
          />

          <Input
            label="Date &amp; Time *"
            type="datetime-local"
            name="timestamp"
            value={formData.timestamp}
            onChange={handleChange}
            required
          />
        </div>

        <Select
          label="Purpose of Usage *"
          name="purpose"
          value={formData.purpose}
          onChange={handleChange}
          options={USAGE_PURPOSES.map((p) => ({ value: p, label: p }))}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Associated Farm"
            name="farmId"
            value={formData.farmId}
            onChange={handleChange}
            options={farms.map((f) => ({ value: f.id, label: `${f.name} (${f.id})` }))}
          />

          <Select
            label="Bed Installation (Optional)"
            name="installationId"
            value={formData.installationId}
            onChange={handleChange}
            options={[
              { value: '', label: 'General Reservoir / None' },
              ...relevantInstallations.map((i) => ({
                value: i.id,
                label: `${i.id} - ${i.cropType}`,
              })),
            ]}
          />
        </div>

        <Input
          label="Recorded By"
          name="recordedBy"
          value={formData.recordedBy}
          onChange={handleChange}
          placeholder="Operator or Farm Technician name"
        />

        <div className="space-y-1">
          <label className="block text-xs font-medium text-sand-700">
            Notes / Observations (Optional)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={2}
            placeholder="e.g. Morning drip pulse across polyhouse tunnel A"
            className="w-full px-3 py-2 text-xs border border-sand-300 rounded-lg bg-white text-sand-900 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-forest-600"
          />
        </div>

        <div className="pt-3 border-t border-sand-200 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" icon={Droplet}>
            Save Record
          </Button>
        </div>
      </form>
    </Modal>
  );
}
