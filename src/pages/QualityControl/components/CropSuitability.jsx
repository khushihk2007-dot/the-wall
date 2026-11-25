import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Sprout } from 'lucide-react';
import { CROP_PROFILES } from '../../../constants/qualityCriteria';

export function CropSuitability({ test }) {
  const suitabilityList = test.cropSuitability || [];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Suitable':
        return <Badge variant="success" size="sm" dot>Suitable</Badge>;
      case 'Conditionally Suitable':
        return <Badge variant="warning" size="sm" dot>Conditionally Suitable</Badge>;
      case 'Not Suitable':
        return <Badge variant="danger" size="sm" dot>Not Suitable</Badge>;
      case 'Insufficient Data':
      default:
        return <Badge variant="neutral" size="sm">Insufficient Data</Badge>;
    }
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="p-3 rounded-lg bg-sand-50 border border-sand-200 flex items-start gap-2.5">
        <Sprout className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-sand-900">Crop-Specific Agronomic Assessment</span>
          <p className="text-[11px] text-sand-600 leading-relaxed">
            Evaluates substrate suitability across 6 dimensions: Moisture consistency, Water retention, Drainage aeration, Root aeration, Structural stability, and Durability.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {CROP_PROFILES.map((profile) => {
          const evalItem = suitabilityList.find((s) => s.profileId === profile.id);
          const status = evalItem?.status || 'Insufficient Data';

          return (
            <Card key={profile.id} className="p-4" bodyClassName="p-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-sand-900 truncate">
                  {profile.name}
                </span>
                {getStatusBadge(status)}
              </div>

              <p className="text-[11px] text-sand-500 mb-3 leading-relaxed">
                {profile.description}
              </p>

              {/* Assessment Dimensions */}
              <div className="space-y-1.5 py-2 border-t border-sand-100 text-[11px]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sand-400 block mb-1">
                  Required Criteria
                </span>
                {profile.dimensions.map((dim) => (
                  <div key={dim.key} className="flex justify-between text-sand-700">
                    <span className="text-sand-500">{dim.label}:</span>
                    <span className="font-mono text-[10px] text-sand-800">{dim.required}</span>
                  </div>
                ))}
              </div>

              {/* Findings */}
              <div className="mt-3 pt-2.5 border-t border-sand-200 bg-sand-50/70 p-2.5 rounded-lg space-y-1 text-[11px]">
                <span className="font-semibold text-sand-800 block">Assessment Verdict:</span>
                <p className="text-sand-600 italic">
                  {evalItem?.notes || 'Complete standardized test suite to evaluate.'}
                </p>

                {evalItem?.supportingResults && evalItem.supportingResults.length > 0 && (
                  <div className="mt-1">
                    <span className="text-[10px] text-emerald-800 font-bold block">Supporting Test Data:</span>
                    <ul className="text-sand-600 list-disc pl-3 text-[10px]">
                      {evalItem.supportingResults.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {evalItem?.limitingFactors && evalItem.limitingFactors.length > 0 && (
                  <div className="mt-1">
                    <span className="text-[10px] text-amber-800 font-bold block">Limiting Factors:</span>
                    <ul className="text-sand-600 list-disc pl-3 text-[10px]">
                      {evalItem.limitingFactors.map((l, idx) => (
                        <li key={idx}>{l}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
