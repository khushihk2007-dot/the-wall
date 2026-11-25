import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

export function TankConfigModal({
  isOpen,
  onClose,
  tank,
  onSave,
}) {
  const [formData, setFormData] = useState(() => ({
    name: tank?.name || '',
    totalCapacityLitres: tank?.totalCapacityLitres || 5000,
    tankHeightCm: tank?.tankHeightCm || 200,
    sensorMountOffsetCm: tank?.sensorMountOffsetCm || 10,
    lowThresholdPct: tank?.lowThresholdPct || 30,
    criticalThresholdPct: tank?.criticalThresholdPct || 15,
    isCalibrated: tank?.isCalibrated ?? true,
  }));

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      totalCapacityLitres: Number(formData.totalCapacityLitres) || 1000,
      tankHeightCm: Number(formData.tankHeightCm) || 100,
      sensorMountOffsetCm: Number(formData.sensorMountOffsetCm) || 0,
      lowThresholdPct: Number(formData.lowThresholdPct) || 30,
      criticalThresholdPct: Number(formData.criticalThresholdPct) || 15,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tank Geometry & Alert Thresholds"
      subtitle={`Configure ${tank?.name || 'Reservoir'} [DEMO DATA]`}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Tank Name *"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Total Capacity (L) *"
            type="number"
            step="100"
            min="100"
            name="totalCapacityLitres"
            value={formData.totalCapacityLitres}
            onChange={handleChange}
            helperText="Nominal storage volume"
            required
          />

          <Input
            label="Tank Depth (cm) *"
            type="number"
            step="1"
            min="20"
            name="tankHeightCm"
            value={formData.tankHeightCm}
            onChange={handleChange}
            helperText="Total height to base"
            required
          />

          <Input
            label="Sensor Offset (cm)"
            type="number"
            step="1"
            min="0"
            name="sensorMountOffsetCm"
            value={formData.sensorMountOffsetCm}
            onChange={handleChange}
            helperText="Distance to max fill level"
          />
        </div>

        <div className="p-3.5 bg-sand-50 rounded-xl border border-sand-200 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            <span className="text-xs font-bold text-sand-800">
              Water Availability Alert Thresholds
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Low Water Threshold (%) *"
              type="number"
              step="1"
              min="5"
              max="60"
              name="lowThresholdPct"
              value={formData.lowThresholdPct}
              onChange={handleChange}
              helperText="Triggers advisory warning"
              required
            />

            <Input
              label="Critical Threshold (%) *"
              type="number"
              step="1"
              min="1"
              max="30"
              name="criticalThresholdPct"
              value={formData.criticalThresholdPct}
              onChange={handleChange}
              helperText="Triggers critical alert"
              required
            />
          </div>
        </div>

        {/* Calibration State Toggle */}
        <div className="p-3.5 bg-forest-50/70 rounded-xl border border-forest-200 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-forest-900 block">
                Sensor Geometry Calibration
              </span>
              <span className="text-[11px] text-forest-600 block mt-0.5">
                When unchecked, distance measurements in cm will NOT be converted to litres.
              </span>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="isCalibrated"
                checked={formData.isCalibrated}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-sand-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-sand-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-forest-700"></div>
            </label>
          </div>
        </div>

        <div className="pt-3 border-t border-sand-200 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" icon={CheckCircle2}>
            Save Configuration
          </Button>
        </div>
      </form>
    </Modal>
  );
}
