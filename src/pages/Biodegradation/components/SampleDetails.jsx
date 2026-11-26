import React from 'react';
import { 
  ArrowLeft, 
  Plus, 
  ArrowRightCircle, 
  Edit3, 
  Clock,
  Radio
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { ObservationTimeline } from './ObservationTimeline';
import { useSensorData } from '../../../hooks/useSensorData';

export function SampleDetails({
  sample,
  observations = [],
  onBack,
  onOpenRecordObs,
  onOpenStatusModal,
  onOpenEditModal,
}) {
  const { data: sensorData, isConnected, lastFetchedAt } = useSensorData();
  if (!sample) return null;

  const latestObs = observations.length > 0 ? observations[observations.length - 1] : null;
  const initialMass = sample.initialDryMass || 450;
  const latestMass = latestObs ? latestObs.currentDryMass : initialMass;
  const latestMassLoss = latestObs ? latestObs.massLossPct : 0.0;
  const daysActive = latestObs ? latestObs.daysSinceStart : 0;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Under Observation':
        return <Badge variant="success" size="sm" dot>Under Observation</Badge>;
      case 'Observation Completed':
        return <Badge variant="neutral" size="sm">Observation Completed</Badge>;
      case 'Requires Review':
        return <Badge variant="warning" size="sm" dot>Requires Review</Badge>;
      case 'Observation Paused':
        return <Badge variant="danger" size="sm" dot>Observation Paused</Badge>;
      case 'Registered':
      default:
        return <Badge variant="earth" size="sm">Registered</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-sand-200 shadow-xs">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Samples</span>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-sand-900">{sample.sampleName}</h2>
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-forest-50 text-forest-800 border border-forest-200">
                {sample.id}
              </span>
              {getStatusBadge(sample.status)}
            </div>
            <p className="text-xs text-sand-500 mt-0.5">
              Batch: <strong className="font-mono text-sand-700">{sample.batchId || 'Unlinked'}</strong> • Environment: <strong className="text-sand-700">{sample.environment}</strong>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenEditModal(sample)}
            className="flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Specimen</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenStatusModal(sample)}
            className="flex items-center gap-1 text-earth-800"
          >
            <ArrowRightCircle className="w-3.5 h-3.5" />
            <span>Change Status</span>
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onOpenRecordObs}
            className="flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Record Observation</span>
          </Button>
        </div>
      </div>

      {/* Degradation Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <Card bodyClassName="p-4">
          <span className="text-[10px] uppercase font-bold text-sand-500 tracking-wider">
            Total Mass Loss
          </span>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-3xl font-bold font-mono text-forest-900">
              {latestMassLoss}%
            </span>
          </div>
          <p className="text-[11px] text-sand-500">
            {initialMass}g &rarr; {latestMass}g
          </p>
        </Card>

        <Card bodyClassName="p-4">
          <span className="text-[10px] uppercase font-bold text-sand-500 tracking-wider">
            Duration Logged
          </span>
          <div className="flex items-baseline gap-1 my-1">
            <span className="text-3xl font-bold text-sand-900">
              {daysActive}
            </span>
            <span className="text-xs text-sand-500">days</span>
          </div>
          <p className="text-[11px] text-sand-500">
            Started: {sample.startDate}
          </p>
        </Card>

        <Card bodyClassName="p-4">
          <span className="text-[10px] uppercase font-bold text-sand-500 tracking-wider">
            Latest Appearance
          </span>
          <div className="text-sm font-bold text-sand-900 my-1 truncate">
            {latestObs ? latestObs.physicalAppearance : 'No visible change'}
          </div>
          <p className="text-[11px] text-sand-500 truncate">
            {observations.length} visual logs recorded
          </p>
        </Card>

        <Card bodyClassName="p-4">
          <span className="text-[10px] uppercase font-bold text-sand-500 tracking-wider">
            Structural Integrity
          </span>
          <div className="text-sm font-bold text-sand-900 my-1">
            {latestObs ? latestObs.structuralIntegrity : 'Intact'}
          </div>
          <p className="text-[11px] text-sand-500">
            Current mechanical state
          </p>
        </Card>

        <Card bodyClassName="p-4">
          <span className="text-[10px] uppercase font-bold text-sand-500 tracking-wider">
            Next Scheduled Due
          </span>
          <div className="text-sm font-bold font-mono text-sand-900 my-1">
            {sample.nextObservationDate || 'None'}
          </div>
          <p className="text-[11px] text-sand-500">
            Next measurement pull
          </p>
        </Card>
      </div>

      {/* Specimen Metadata & Scientific Setup */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card
          title="Specimen Specification"
          subtitle="Material composite parameters and environmental placement."
        >
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-sand-100">
              <span className="text-sand-500">Material Composition:</span>
              <span className="font-medium text-sand-900 text-right max-w-[200px]">
                {sample.materialComposition}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-sand-100">
              <span className="text-sand-500">Linked Batch ID:</span>
              <span className="font-mono font-bold text-sand-900">
                {sample.batchId || 'Unlinked'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-sand-100">
              <span className="text-sand-500">Product / Bed Unit:</span>
              <span className="font-mono text-sand-800">
                {sample.productId}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-sand-100">
              <span className="text-sand-500">Test Environment:</span>
              <span className="font-semibold text-sand-900">
                {sample.environment}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-sand-100">
              <span className="text-sand-500">Location:</span>
              <span className="text-sand-800 text-right max-w-[180px]">
                {sample.location}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-sand-100">
              <span className="text-sand-500">Baseline Dimensions:</span>
              <span className="font-mono text-sand-800">
                {sample.initialDimensions?.lengthMm} × {sample.initialDimensions?.widthMm} × {sample.initialDimensions?.thicknessMm} mm
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-sand-500">Observer:</span>
              <span className="text-sand-800">{sample.responsibleObserver}</span>
            </div>

            {sample.notes && (
              <div className="pt-2 text-[11px] text-sand-600 bg-sand-50 p-2.5 rounded-lg border border-sand-200">
                <span className="font-semibold block text-sand-700 mb-0.5">Observer Notes:</span>
                {sample.notes}
              </div>
            )}
          </div>
        </Card>

        {/* Lifecycle Status History */}
        <div className="lg:col-span-2">
          <Card
            title="Lifecycle Status History"
            subtitle="Controlled administrative transitions with time and reason logging."
          >
            <div className="space-y-3">
              {(sample.statusHistory || []).map((h, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-sand-50/70 border border-sand-200 text-xs">
                  <div className="p-1.5 rounded-md bg-forest-100 text-forest-800 shrink-0 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sand-900">{h.status}</span>
                      <span className="text-[11px] font-mono text-sand-500">{h.timestamp}</span>
                    </div>
                    <p className="text-sand-600 mt-0.5">{h.note}</p>
                    <span className="text-[10px] text-sand-400 block mt-1">
                      Logged by: {h.updatedBy || 'QC Operator'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Environmental Context from Central ESP32 */}
      <div className="p-4 rounded-xl bg-forest-50/50 border border-forest-200 space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-forest-900 font-semibold">
            <Radio className="w-4 h-4 text-forest-700 animate-pulse" />
            <span>ESP32 Degradation Field Environmental Context</span>
          </div>
          <Badge variant={isConnected ? 'success' : 'neutral'} size="xs" dot>
            {isConnected ? 'Telemetry Active' : 'Sensor Offline'}
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-[11px] font-mono">
          <div className="p-2.5 rounded-lg bg-white border border-forest-100">
            <span className="text-sand-500 block text-[9px] uppercase font-sans">Substrate Moisture</span>
            <span className="font-bold text-forest-900 text-sm">
              {sensorData?.soilValid && sensorData?.soilMoisturePercent !== null 
                ? `${sensorData.soilMoisturePercent}%` 
                : sensorData?.soilRaw === 0 ? '0/4095 (Zero)' : 'Unavailable'}
            </span>
            <span className="text-[9px] text-sand-400 block mt-0.5 font-sans">Capacitive probe</span>
          </div>

          <div className="p-2.5 rounded-lg bg-white border border-forest-100">
            <span className="text-sand-500 block text-[9px] uppercase font-sans">Substrate Temp 1</span>
            <span className="font-bold text-forest-900 text-sm">
              {sensorData?.dht1Valid && sensorData?.temperature1 != null ? `${sensorData.temperature1}°C` : 'Unavailable'}
            </span>
            <span className="text-[9px] text-sand-400 block mt-0.5 font-sans">Core thermal probe</span>
          </div>

          <div className="p-2.5 rounded-lg bg-white border border-forest-100">
            <span className="text-sand-500 block text-[9px] uppercase font-sans">Ambient Temp 2</span>
            <span className="font-bold text-forest-900 text-sm">
              {sensorData?.dht2Valid && sensorData?.temperature2 != null ? `${sensorData.temperature2}°C` : 'Unavailable'}
            </span>
            <span className="text-[9px] text-sand-400 block mt-0.5 font-sans">Air climate sensor</span>
          </div>

          <div className="p-2.5 rounded-lg bg-white border border-forest-100">
            <span className="text-sand-500 block text-[9px] uppercase font-sans">Ambient Humidity 2</span>
            <span className="font-bold text-forest-900 text-sm">
              {sensorData?.dht2Valid && sensorData?.humidity2 != null ? `${sensorData.humidity2}%` : 'Unavailable'}
            </span>
            <span className="text-[9px] text-sand-400 block mt-0.5 font-sans">Relative air humidity</span>
          </div>

          <div className="p-2.5 rounded-lg bg-white border border-forest-100">
            <span className="text-sand-500 block text-[9px] uppercase font-sans">Ultrasonic Water</span>
            <span className="font-bold text-forest-900 text-sm">
              {sensorData?.ultrasonicValid && sensorData?.ultrasonicDistanceCm != null
                ? `${sensorData.ultrasonicDistanceCm} cm`
                : 'Unavailable'}
            </span>
            <span className="text-[9px] text-sand-400 block mt-0.5 font-sans">Reservoir distance</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-sand-500 pt-1 border-t border-forest-100">
          <span>Physical measurements (mass loss, dry weights) are empirical lab test values.</span>
          <span>Last sync: {lastFetchedAt || 'Live'}</span>
        </div>
      </div>

      {/* Observations Timeline Section */}
      <Card
        title="Chronological Measurement &amp; Observation Records"
        subtitle="Empirical degradation logging across dry mass, visual breakdown, and environmental metrics."
        action={
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onOpenRecordObs}
            className="flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Record Observation</span>
          </Button>
        }
      >
        <ObservationTimeline
          observations={observations}
          initialDryMass={initialMass}
        />
      </Card>
    </div>
  );
}
