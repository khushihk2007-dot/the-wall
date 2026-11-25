import React from 'react';
import { Check } from 'lucide-react';
import { MANUFACTURING_STAGES } from '../../../constants/mockManufacturingData';
import { cn } from '../../../utils/cn';

export function BatchWorkflowStepper({ currentStage, compact = false }) {
  const currentIdx = MANUFACTURING_STAGES.indexOf(currentStage);

  if (compact) {
    const progressPct = ((currentIdx + 1) / MANUFACTURING_STAGES.length) * 100;
    return (
      <div className="w-full space-y-1">
        <div className="flex justify-between items-center text-[11px]">
          <span className="font-medium text-sand-700 truncate max-w-[140px]">
            {currentStage}
          </span>
          <span className="font-mono text-sand-500 text-[10px]">
            {currentIdx + 1} / {MANUFACTURING_STAGES.length}
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-sand-200 overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300',
              currentStage === 'Completed' ? 'bg-emerald-600' : 'bg-forest-600'
            )}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-2">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {MANUFACTURING_STAGES.map((stage, idx) => {
          const isPassed = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const isPending = idx > currentIdx;

          return (
            <div
              key={stage}
              className={cn(
                'p-2.5 rounded-lg border text-xs transition-all relative',
                isPassed && 'bg-emerald-50/80 border-emerald-200 text-emerald-900',
                isCurrent && 'bg-forest-700 text-white border-forest-800 shadow-sm ring-2 ring-forest-500/30',
                isPending && 'bg-sand-50/60 border-sand-200 text-sand-500 opacity-70'
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={cn('text-[10px] font-mono font-bold', isCurrent ? 'text-forest-200' : 'text-sand-400')}>
                  0{idx + 1}
                </span>
                {isPassed && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                {isCurrent && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </div>
              <p className={cn('font-semibold leading-snug truncate', isCurrent ? 'text-white' : 'text-sand-800')}>
                {stage}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
