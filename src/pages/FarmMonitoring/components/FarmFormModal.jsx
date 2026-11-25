import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { Save, Plus } from 'lucide-react';

export function FarmFormModal({ isOpen, onClose, farm, onSave }) {
  const isEditing = !!farm;

  const [formData, setFormData] = useState(() => {
    if (farm) {
      return {
        name: farm.name || '',
        farmerName: farm.farmerName || '',
        location: farm.location || '',
        area: String(farm.area || '2.5'),
        areaUnit: farm.areaUnit || 'Acres',
        cropCategory: farm.cropCategory || 'Fruiting Vegetables',
        contact: farm.contact || '',
        notes: farm.notes || '',
      };
    }
    return {
      name: '',
      farmerName: '',
      location: '',
      area: '2.5',
      areaUnit: 'Acres',
      cropCategory: 'Fruiting Vegetables',
      contact: '',
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
    if (!formData.name.trim()) {
      setError('Farm name is required.');
      return;
    }
    if (!formData.location.trim()) {
      setError('Farm location is required.');
      return;
    }

    onSave({
      ...formData,
      area: parseFloat(formData.area) || 1.0,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Farm: ${farm.name}` : 'Register New Farm Site'}
      subtitle={
        isEditing
          ? `Update metadata for farm record ${farm.id}`
          : 'Add a commercial partner, research plot, or greenhouse installation site.'
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
            label="Farm / Facility Name"
            placeholder="e.g. Solan High-Altitude Polyhouse"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />

          <Input
            label="Lead Grower / Operator"
            placeholder="e.g. Dr. Rajesh Sharma"
            value={formData.farmerName}
            onChange={(e) => handleChange('farmerName', e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <Input
              label="Location / Region"
              placeholder="e.g. Solan, HP"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              required
            />
          </div>

          <div>
            <Input
              label="Cultivated Area"
              type="number"
              step="0.1"
              min="0.1"
              value={formData.area}
              onChange={(e) => handleChange('area', e.target.value)}
              required
            />
          </div>

          <div>
            <Select
              label="Area Unit"
              value={formData.areaUnit}
              onChange={(e) => handleChange('areaUnit', e.target.value)}
              options={[
                { value: 'Acres', label: 'Acres' },
                { value: 'Hectares', label: 'Hectares' },
                { value: 'Sq Meters', label: 'Sq Meters' },
                { value: 'Polyhouse Bays', label: 'Polyhouse Bays' },
              ]}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Primary Crop Category"
            value={formData.cropCategory}
            onChange={(e) => handleChange('cropCategory', e.target.value)}
            options={[
              { value: 'Fruiting Vegetables', label: 'Fruiting Vegetables (Tomato, Capsicum)' },
              { value: 'Leafy Vegetables', label: 'Leafy Vegetables (Spinach, Kale, Lettuce)' },
              { value: 'Nursery & Seed Germination', label: 'Nursery & Seed Germination' },
              { value: 'Berries & Vine Crops', label: 'Berries & Vine Crops' },
              { value: 'Medicinal & Aromatic Herbs', label: 'Medicinal & Aromatic Herbs' },
            ]}
          />

          <Input
            label="Contact Information (Phone / Email)"
            placeholder="e.g. +91 98160 12345"
            value={formData.contact}
            onChange={(e) => handleChange('contact', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-sand-700 mb-1">
            Site Notes &amp; Infrastructure
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Greenhouse structure, drip irrigation setup, solar power availability..."
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
            {isEditing ? 'Save Changes' : 'Register Farm'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
