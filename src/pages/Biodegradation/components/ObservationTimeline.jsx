import React from 'react';
import { 
  Calendar, 
  Scale, 
  Ruler, 
  CloudRain, 
  Eye, 
  ShieldAlert, 
  CheckCircle2, 
  User, 
  Camera 
} from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';

export function ObservationTimeline({ observations = [], initialDryMass = 450 }) {
  if (observations.length === 0) {
    return (
      <div className="p-8 text-center bg-sand-50/50 rounded-xl border border-dashed border-sand-300 text-sand-500">
        <Scale className="w-8 h-8 mx-auto mb-2 text-sand-400" />
        <p className="font-semibold text-sand-700">No Measurement Records Yet</p>
        <p className="text-xs text-sand-500 mt-1">
          Click &ldquo;Record Observation&rdquo; to log mass-loss and degradation notes for this specimen.
        </p>
      </div>
    );
  }

  // Sort chronological
  const sorted = [...observations].sort(
    (a, b) => new Date(a.observationDate) - new Date(b.observationDate)
  );

  const getIntegrityBadgeVariant = (integrity) => {
    switch (integrity) {
      case 'Intact':
        return 'success';
      case 'Slightly weakened':
        return 'forest';
      case 'Moderately weakened':
        return 'warning';
      case 'Severely weakened':
      case 'No longer structurally intact':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="relative border-l-2 border-forest-200 ml-4 sm:ml-6 space-y-8 pb-4">
      {sorted.map((obs, idx) => {
        const isBaseline = obs.daysSinceStart === 0 || idx === 0;
        const dims = obs.dimensions || {};
        const env = obs.environmentalConditions || {};

        return (
          <div key={obs.id} className="relative pl-6 sm:pl-8 group">
            {/* Timeline node icon */}
            <div className={`absolute -left-3.5 top-1 w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-xs ${
              isBaseline
                ? 'bg-forest-800 text-white'
                : obs.massLossPct > 30
                ? 'bg-earth-700 text-white'
                : 'bg-forest-600 text-white'
            }`}>
              {isBaseline ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <span className="text-[10px] font-mono font-bold">{idx}</span>
              )}
            </div>

            {/* Observation Card */}
            <div className="bg-white rounded-xl border border-sand-200 p-4 sm:p-5 shadow-xs hover:border-sand-300 transition-all">
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sand-100 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sand-900 text-sm">
                    {isBaseline ? 'Baseline Test Setup (Day 0)' : `Observation: Day ${obs.daysSinceStart}`}
                  </span>
                  <span className="font-mono text-xs text-sand-500">
                    ({obs.id})
                  </span>
                  <Badge variant={isBaseline ? 'forest' : 'success'} size="xs">
                    {obs.massLossPct}% Mass Loss
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-xs text-sand-500">
                  <Calendar className="w-3.5 h-3.5 text-sand-400" />
                  <span className="font-medium text-sand-700">{obs.observationDate}</span>
                </div>
              </div>

              {/* Core Physical Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-3">
                {/* Current Dry Mass */}
                <div className="p-2.5 bg-sand-50 rounded-lg">
                  <div className="text-[10px] uppercase font-semibold text-sand-500 flex items-center gap-1">
                    <Scale className="w-3 h-3 text-sand-400" />
                    <span>Dry Mass</span>
                  </div>
                  <div className="text-base font-bold font-mono text-sand-900 mt-0.5">
                    {obs.currentDryMass} g
                  </div>
                  <div className="text-[10px] text-sand-500">
                    Baseline: {initialDryMass} g
                  </div>
                </div>

                {/* Physical Appearance */}
                <div className="p-2.5 bg-sand-50 rounded-lg">
                  <div className="text-[10px] uppercase font-semibold text-sand-500 flex items-center gap-1">
                    <Eye className="w-3 h-3 text-sand-400" />
                    <span>Appearance</span>
                  </div>
                  <div className="text-xs font-semibold text-sand-800 mt-1 truncate">
                    {obs.physicalAppearance}
                  </div>
                </div>

                {/* Structural Integrity */}
                <div className="p-2.5 bg-sand-50 rounded-lg">
                  <div className="text-[10px] uppercase font-semibold text-sand-500 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-sand-400" />
                    <span>Integrity</span>
                  </div>
                  <div className="mt-1">
                    <Badge variant={getIntegrityBadgeVariant(obs.structuralIntegrity)} size="xs">
                      {obs.structuralIntegrity}
                    </Badge>
                  </div>
                </div>

                {/* Dimensions */}
                <div className="p-2.5 bg-sand-50 rounded-lg">
                  <div className="text-[10px] uppercase font-semibold text-sand-500 flex items-center gap-1">
                    <Ruler className="w-3 h-3 text-sand-400" />
                    <span>Dimensions</span>
                  </div>
                  <div className="text-xs font-mono font-medium text-sand-800 mt-0.5">
                    {dims.lengthMm} × {dims.widthMm} × {dims.thicknessMm} mm
                  </div>
                  {(dims.lengthChangeMm !== 0 || dims.thicknessChangeMm !== 0) && (
                    <div className="text-[10px] text-sand-400 font-mono">
                      Δ: {dims.lengthChangeMm}mm / {dims.thicknessChangeMm}mm
                    </div>
                  )}
                </div>
              </div>

              {/* Environmental conditions row (if measured) */}
              {(env.temperatureC !== null || env.relativeHumidityPct !== null || env.soilMoisturePct !== null) && (
                <div className="bg-sand-50/60 rounded-lg p-2.5 border border-sand-200/60 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-sand-600 mb-3">
                  <span className="text-[10px] font-semibold uppercase text-sand-500 flex items-center gap-1">
                    <CloudRain className="w-3 h-3 text-blue-500" />
                    <span>Environment:</span>
                  </span>
                  {env.temperatureC !== null && (
                    <span>Temp: <strong className="font-mono text-sand-800">{env.temperatureC}°C</strong></span>
                  )}
                  {env.relativeHumidityPct !== null && (
                    <span>RH: <strong className="font-mono text-sand-800">{env.relativeHumidityPct}%</strong></span>
                  )}
                  {env.soilMoisturePct !== null && (
                    <span>Soil Moisture: <strong className="font-mono text-sand-800">{env.soilMoisturePct}%</strong></span>
                  )}
                  {env.soilPh !== null && (
                    <span>pH: <strong className="font-mono text-sand-800">{env.soilPh}</strong></span>
                  )}
                </div>
              )}

              {/* Photograph if uploaded */}
              {obs.photoUrl && (
                <div className="my-2.5 flex items-center gap-3 p-2 bg-sand-50 rounded-lg border border-sand-200">
                  <img
                    src={obs.photoUrl}
                    alt={`Observation specimen on day ${obs.daysSinceStart}`}
                    className="w-16 h-16 rounded-md object-cover border border-sand-300 shrink-0"
                  />
                  <div className="text-xs text-sand-600">
                    <span className="font-semibold block text-sand-800 flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5 text-sand-500" />
                      Visual Specimen Capture
                    </span>
                    <span className="text-[11px] text-sand-500">Day {obs.daysSinceStart} photo record.</span>
                  </div>
                </div>
              )}

              {/* Notes & Observer footer */}
              {obs.notes && (
                <p className="text-xs text-sand-700 bg-sand-50/50 p-2.5 rounded-lg border border-sand-100 italic mb-2.5">
                  &ldquo;{obs.notes}&rdquo;
                </p>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-sand-100 text-[11px] text-sand-500">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3 text-sand-400" />
                  <span>Recorded by: <strong className="text-sand-700">{obs.observer}</strong></span>
                </span>
                {obs.environmentalConditions?.measurementMethod && (
                  <span className="text-sand-400 truncate max-w-xs">
                    Method: {obs.environmentalConditions.measurementMethod}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
