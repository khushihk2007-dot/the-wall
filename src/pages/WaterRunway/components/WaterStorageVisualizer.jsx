import React from 'react';
import { 
  Ruler, 
  Sliders, 
  AlertTriangle, 
  AlertCircle, 
  HelpCircle,
  Clock
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';

export function WaterStorageVisualizer({
  tank,
  metrics,
  onOpenConfigModal,
}) {
  const isCalibrated = metrics.isCalibrated;
  const waterPct = isCalibrated && metrics.waterLevelPct !== null ? metrics.waterLevelPct : 0;
  const status = metrics.status;

  const getStatusBadge = () => {
    switch (status) {
      case 'Normal':
        return (
          <Badge variant="success" size="sm" dot>
            Normal – Sufficient
          </Badge>
        );
      case 'Low':
      case 'Low Water':
        return (
          <Badge variant="warning" size="sm" dot>
            Low – Warning
          </Badge>
        );
      case 'Critical':
      case 'Critical Water':
        return (
          <Badge variant="danger" size="sm" dot>
            Critical – Scarcity Alert
          </Badge>
        );
      case 'Uncalibrated':
      default:
        return (
          <Badge variant="neutral" size="sm">
            Calibration Required
          </Badge>
        );
    }
  };

  return (
    <Card
      title="Water Storage & Reservoir Level"
      subtitle={`${tank.name} • ${tank.farmName} [DEMO DATA]`}
      action={
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          <Button
            variant="outline"
            size="xs"
            icon={Sliders}
            onClick={onOpenConfigModal}
            title="Configure tank dimensions and thresholds"
          >
            Configure Tank
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Visual Tank Graphic (5 cols) */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-3 bg-sand-50/60 rounded-xl border border-sand-200">
          <div className="relative w-44 h-64 bg-sand-100 rounded-3xl border-4 border-sand-300 overflow-hidden shadow-inner flex flex-col justify-end">
            {/* Sensor Mount Head at the top */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
              <div className="w-10 h-3 bg-sand-700 rounded-t-sm" />
              <div className="w-6 h-2 bg-sand-900 rounded-b-sm shadow-xs" />
              {/* Sensor sound wave beam indicator */}
              <div className="w-0.5 h-6 bg-dashed border-l border-dashed border-sand-400 mt-0.5 animate-pulse" />
            </div>

            {/* Threshold Guide Lines */}
            <div 
              className="absolute w-full border-t border-dashed border-amber-500 z-10 opacity-70 pointer-events-none"
              style={{ bottom: `${tank.lowThresholdPct || 30}%` }}
              title={`Low Water Threshold (${tank.lowThresholdPct || 30}%)`}
            >
              <span className="absolute right-1 -top-3 text-[9px] font-mono font-bold text-amber-700 bg-amber-50/80 px-1 rounded">
                Low {tank.lowThresholdPct || 30}%
              </span>
            </div>

            <div 
              className="absolute w-full border-t border-dashed border-red-500 z-10 opacity-70 pointer-events-none"
              style={{ bottom: `${tank.criticalThresholdPct || 15}%` }}
              title={`Critical Threshold (${tank.criticalThresholdPct || 15}%)`}
            >
              <span className="absolute right-1 -top-3 text-[9px] font-mono font-bold text-red-700 bg-red-50/80 px-1 rounded">
                Crit {tank.criticalThresholdPct || 15}%
              </span>
            </div>

            {/* Water Fill Layer */}
            {isCalibrated ? (
              <div
                className={`w-full transition-all duration-700 ease-out relative ${
                  status === 'Critical' || status === 'Critical Water'
                    ? 'bg-gradient-to-t from-red-600 to-red-400'
                    : status === 'Low' || status === 'Low Water'
                    ? 'bg-gradient-to-t from-amber-600 to-amber-400'
                    : 'bg-gradient-to-t from-emerald-600 via-teal-500 to-cyan-400'
                }`}
                style={{ height: `${Math.max(4, Math.min(100, waterPct))}%` }}
              >
                {/* Surface Wave Highlight */}
                <div className="absolute top-0 inset-x-0 h-1.5 bg-white/40 shadow-xs" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white font-mono p-2 drop-shadow-sm select-none">
                  <span className="text-xl font-extrabold tracking-tight">
                    {waterPct}%
                  </span>
                  <span className="text-[10px] font-medium opacity-90">
                    {metrics.availableLitres?.toLocaleString()} L
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-sand-200/50">
                <HelpCircle className="w-8 h-8 text-sand-400 mb-1" />
                <span className="text-xs font-semibold text-sand-700">Uncalibrated</span>
                <span className="text-[10px] text-sand-500 mt-1">
                  Tank dimensions required to calculate volume
                </span>
              </div>
            )}
          </div>

          <div className="mt-2 text-center">
            <span className="text-[11px] font-medium text-sand-500 font-mono">
              Total Tank Capacity: <strong className="text-sand-800">{tank.totalCapacityLitres?.toLocaleString()} L</strong>
            </span>
          </div>
        </div>

        {/* Storage Metrics & Calibration Readout (7 cols) */}
        <div className="md:col-span-7 space-y-4">
          {/* Key Metrics Breakdown */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white rounded-xl border border-sand-200 shadow-xs">
              <span className="text-[11px] font-medium text-sand-500 block">Available Water</span>
              <div className="flex items-baseline gap-1 mt-1">
                {isCalibrated ? (
                  <>
                    <span className="text-2xl font-bold font-mono text-sand-900">
                      {metrics.availableLitres?.toLocaleString()}
                    </span>
                    <span className="text-xs font-semibold text-sand-500">Litres</span>
                  </>
                ) : (
                  <span className="text-sm font-semibold text-amber-700 italic">
                    Calibration Needed
                  </span>
                )}
              </div>
              <span className="text-[10px] text-sand-400 block mt-1">
                {isCalibrated ? `${waterPct}% of ${tank.totalCapacityLitres?.toLocaleString()}L total capacity` : 'Volume calculation disabled'}
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-sand-200 shadow-xs">
              <span className="text-[11px] font-medium text-sand-500 block">Current Water Depth</span>
              <div className="flex items-baseline gap-1 mt-1">
                {isCalibrated && metrics.waterDepthCm !== null ? (
                  <>
                    <span className="text-2xl font-bold font-mono text-sand-900">
                      {metrics.waterDepthCm}
                    </span>
                    <span className="text-xs font-semibold text-sand-500">cm</span>
                  </>
                ) : (
                  <span className="text-sm font-semibold text-sand-500 italic">
                    Unmeasured
                  </span>
                )}
              </div>
              <span className="text-[10px] text-sand-400 block mt-1">
                Tank total height: {tank.tankHeightCm} cm
              </span>
            </div>
          </div>

          {/* Ultrasonic Sensor Integration Telemetry */}
          <div className="p-3.5 bg-forest-50/70 border border-forest-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-forest-700" />
                <span className="text-xs font-bold text-forest-900">
                  Farm Ultrasonic Telemetry
                </span>
              </div>
              <Badge
                variant="success"
                size="xs"
              >
                Connected
              </Badge>
            </div>

            <div className="text-xs text-forest-800 space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-forest-600">Sensor Distance to Liquid Surface:</span>
                <span className="font-mono font-bold text-forest-900">
                  {metrics.rawDistanceCm !== null ? `${metrics.rawDistanceCm} cm` : '48.5 cm'}
                </span>
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span className="text-forest-600">Sensor Offset from Top:</span>
                <span className="font-mono text-forest-800">
                  {tank.sensorMountOffsetCm || 10} cm
                </span>
              </div>

              <div className="flex justify-between items-center text-[11px]">
                <span className="text-forest-600">Associated Farm Installation:</span>
                <span className="font-mono text-forest-800">
                  {tank.installationId || 'INST-001'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-forest-200/80 flex items-center justify-between text-[10px] text-forest-600">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-forest-500" />
                <span>Last updated: 1 min ago (Live Demo Simulation)</span>
              </div>
              <span>HC-SR04 Sensor Node</span>
            </div>
          </div>

          {/* Threshold Advisory Note */}
          {(status === 'Critical' || status === 'Critical Water') && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>
                <strong>Critical Scarcity Alert:</strong> Available storage is below {tank.criticalThresholdPct || 15}%. Urgent refill or deficit irrigation required.
              </span>
            </div>
          )}

          {(status === 'Low' || status === 'Low Water') && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Water Conservation Warning:</strong> Storage is below warning threshold ({tank.lowThresholdPct || 30}%). Water conservation protocols active.
              </span>
            </div>
          )}

          {status === 'Uncalibrated' && (
            <div className="p-2.5 bg-sand-100 border border-sand-300 rounded-lg text-xs text-sand-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-sand-600 shrink-0" />
                <span>Tank height and sensor geometry are required before distance can be converted to volume.</span>
              </div>
              <Button size="xs" variant="primary" onClick={onOpenConfigModal}>
                Calibrate Now
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
