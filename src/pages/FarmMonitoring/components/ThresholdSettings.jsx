import React, { useState } from 'react';
import { 
  Check, 
  Info 
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { farmService } from '../../../services/farmService';

export function ThresholdSettings({ onThresholdsUpdated }) {
  const [thresholds, setThresholds] = useState(() => farmService.getThresholds());
  const [activeCategory, setActiveCategory] = useState('Leafy Greens');
  const [isSaved, setIsSaved] = useState(false);
  const [formData, setFormData] = useState(() => thresholds['Leafy Greens'] || {
    optimalMin: 60,
    optimalMax: 75,
    lowWarning: 50,
    criticalDry: 40,
    saturatedHigh: 85,
  });

  const categories = Object.keys(thresholds);

  const handleCategorySwitch = (cat) => {
    setActiveCategory(cat);
    setFormData(thresholds[cat] || {
      optimalMin: 60,
      optimalMax: 75,
      lowWarning: 50,
      criticalDry: 40,
      saturatedHigh: 85,
    });
    setIsSaved(false);
  };

  const handleChange = (field, val) => {
    setFormData((prev) => ({
      ...prev,
      [field]: Number(val),
    }));
    setIsSaved(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const updated = farmService.updateThresholdsForCategory(activeCategory, formData);
    setThresholds(updated);
    setIsSaved(true);
    if (onThresholdsUpdated) {
      onThresholdsUpdated(updated);
    }
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <Card
      title="Moisture Threshold Profiles"
      subtitle="Configure irrigation triggers and moisture envelopes by crop category."
      action={
        <div className="flex items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategorySwitch(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeCategory === cat
                  ? 'bg-forest-800 text-white shadow-xs'
                  : 'bg-white border border-sand-300 text-sand-700 hover:bg-sand-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      }
    >
      <form onSubmit={handleSave} className="space-y-6 pt-2">
        {isSaved && (
          <div className="p-3 bg-forest-50 border border-forest-200 text-forest-800 rounded-xl text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-forest-600" />
              <span>Thresholds for <strong>{activeCategory}</strong> updated and stored in platform memory.</span>
            </div>
            <Badge variant="success" size="xs">Saved</Badge>
          </div>
        )}

        {/* Moisture Zone Range Visualizer */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-sand-700 mb-2">
            <span>Moisture Boundary Range (% RH)</span>
            <span className="text-sand-500 font-normal">Active Profile: {activeCategory}</span>
          </div>

          <div className="h-6 w-full rounded-lg overflow-hidden flex text-[10px] font-bold text-white shadow-inner">
            <div 
              style={{ width: `${formData.criticalDry}%` }} 
              className="bg-red-500 flex items-center justify-center" 
              title="Critical Dry"
            >
              Dry
            </div>
            <div 
              style={{ width: `${formData.optimalMin - formData.criticalDry}%` }} 
              className="bg-amber-400 flex items-center justify-center text-amber-900" 
              title="Low Warning"
            >
              Warn
            </div>
            <div 
              style={{ width: `${formData.optimalMax - formData.optimalMin}%` }} 
              className="bg-forest-600 flex items-center justify-center" 
              title="Optimal Range"
            >
              Optimal ({formData.optimalMin}% - {formData.optimalMax}%)
            </div>
            <div 
              style={{ width: `${formData.saturatedHigh - formData.optimalMax}%` }} 
              className="bg-blue-400 flex items-center justify-center text-blue-950" 
              title="High Moisture"
            >
              High
            </div>
            <div 
              style={{ width: `${100 - formData.saturatedHigh}%` }} 
              className="bg-blue-700 flex items-center justify-center" 
              title="Saturated Risk"
            >
              Sat
            </div>
          </div>

          <div className="flex justify-between text-[11px] text-sand-500 mt-1.5 px-0.5">
            <span>0%</span>
            <span>{formData.criticalDry}% Critical</span>
            <span>{formData.optimalMin}% Min</span>
            <span>{formData.optimalMax}% Max</span>
            <span>{formData.saturatedHigh}% Saturation</span>
            <span>100%</span>
          </div>
        </div>

        {/* Input Threshold Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-3 bg-red-50/50 rounded-xl border border-red-200">
            <label className="block text-xs font-semibold text-red-900 mb-1">
              Critical Dry (&lt; %)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.criticalDry}
              onChange={(e) => handleChange('criticalDry', e.target.value)}
              className="w-full text-base font-bold text-red-950 bg-white border border-red-300 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-red-500"
              required
            />
            <span className="text-[10px] text-red-700 mt-1 block">Immediate irrigation trigger</span>
          </div>

          <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200">
            <label className="block text-xs font-semibold text-amber-900 mb-1">
              Low Warning (&lt; %)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.lowWarning}
              onChange={(e) => handleChange('lowWarning', e.target.value)}
              className="w-full text-base font-bold text-amber-950 bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-amber-500"
              required
            />
            <span className="text-[10px] text-amber-700 mt-1 block">Pre-emptive alert boundary</span>
          </div>

          <div className="p-3 bg-forest-50/60 rounded-xl border border-forest-200">
            <label className="block text-xs font-semibold text-forest-900 mb-1">
              Optimal Min (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.optimalMin}
              onChange={(e) => handleChange('optimalMin', e.target.value)}
              className="w-full text-base font-bold text-forest-950 bg-white border border-forest-300 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-forest-500"
              required
            />
            <span className="text-[10px] text-forest-700 mt-1 block">Target vegetative baseline</span>
          </div>

          <div className="p-3 bg-forest-50/60 rounded-xl border border-forest-200">
            <label className="block text-xs font-semibold text-forest-900 mb-1">
              Optimal Max (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.optimalMax}
              onChange={(e) => handleChange('optimalMax', e.target.value)}
              className="w-full text-base font-bold text-forest-950 bg-white border border-forest-300 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-forest-500"
              required
            />
            <span className="text-[10px] text-forest-700 mt-1 block">Upper root respiration cap</span>
          </div>

          <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200">
            <label className="block text-xs font-semibold text-blue-900 mb-1">
              Saturation Risk (&gt; %)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.saturatedHigh}
              onChange={(e) => handleChange('saturatedHigh', e.target.value)}
              className="w-full text-base font-bold text-blue-950 bg-white border border-blue-300 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500"
              required
            />
            <span className="text-[10px] text-blue-700 mt-1 block">Waterlogging warning</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-sand-200">
          <div className="flex items-center gap-1.5 text-xs text-sand-500">
            <Info className="w-4 h-4 text-sand-400" />
            <span>Thresholds apply to Channel 1 (Top Layer) and are saved to browser local store.</span>
          </div>
          <Button type="submit" variant="primary" size="sm">
            Save Thresholds for {activeCategory}
          </Button>
        </div>
      </form>
    </Card>
  );
}
