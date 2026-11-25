import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { traceabilityService } from '../../services/traceabilityService';
import { biodegradationService } from '../../services/biodegradationService';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/common/LoadingState';
import {
  Leaf,
  CheckCircle2,
  Clock,
  Layers,
  FlaskConical,
  ShieldCheck,
  XCircle,
  Activity,
  Radio,
} from 'lucide-react';
import { MANUFACTURING_STAGES } from '../../constants/mockManufacturingData';

function getFormattedScanTime() {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date());
  } catch {
    return '25 Nov 2026, 20:45';
  }
}

export default function PublicTraceabilityPage() {
  const { traceabilityId } = useParams();
  const [scanTime] = useState(getFormattedScanTime);
  const [profile, setProfile] = useState(() => traceabilityService.getByTraceabilityId(traceabilityId));
  const [isLoading, setIsLoading] = useState(() => !profile);

  useEffect(() => {
    traceabilityService.ensureInitialQrRecords().then(() => {
      setProfile(traceabilityService.getByTraceabilityId(traceabilityId));
    }).finally(() => {
      setIsLoading(false);
    });
  }, [traceabilityId]);

  const bioSamples = useMemo(() => {
    if (!profile?.batch?.id) return [];
    return biodegradationService.getSamplesByBatchId(profile.batch.id);
  }, [profile]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center p-4">
        <LoadingState message="Verifying Digital Product Passport..." />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-sand-50 flex flex-col items-center justify-center p-4 text-center font-sans">
        <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-card border border-sand-200">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-mono uppercase font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
            Verification Error
          </span>
          <h2 className="text-xl font-bold text-sand-900 mt-3 mb-1">
            Traceability Record Not Found
          </h2>
          <p className="text-xs text-sand-600 mb-6 leading-relaxed">
            The scanned traceability ID <code className="font-mono font-bold text-sand-800 bg-sand-100 px-1 py-0.5 rounded">{traceabilityId || 'Unknown'}</code> does not match any registered product batch in The Wall registry.
          </p>
          <div className="p-3 rounded-lg bg-sand-50 border border-sand-200 text-[11px] text-sand-500 text-left">
            <span className="font-semibold block text-sand-700 mb-0.5">Notice to Agricultural Operators:</span>
            Ensure the physical QR code is intact and unsoiled. Contact quality support if this batch was recently dispatched.
          </div>
        </div>
      </div>
    );
  }

  const { batch, qcTest, verificationStatus } = profile;

  // Material percentages
  const totalWeight =
    (batch.materials?.cottonKg || 0) +
    (batch.materials?.coirKg || 0) +
    (batch.materials?.mediumKg || 0);

  const cottonPct = totalWeight > 0 ? (((batch.materials?.cottonKg || 0) / totalWeight) * 100).toFixed(1) : 0;
  const coirPct = totalWeight > 0 ? (((batch.materials?.coirKg || 0) / totalWeight) * 100).toFixed(1) : 0;
  const mediumPct = totalWeight > 0 ? (((batch.materials?.mediumKg || 0) / totalWeight) * 100).toFixed(1) : 0;

  // Stage mapping
  const currentStageIdx = MANUFACTURING_STAGES.indexOf(batch.stage);

  return (
    <div className="min-h-screen bg-sand-50 text-sand-900 font-sans pb-16">
      {/* Top Brand Banner */}
      <header className="bg-forest-900 text-white border-b border-forest-800 px-4 py-4 sm:px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-forest-700 flex items-center justify-center text-emerald-300">
              <Leaf className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white block leading-none">
                The Wall
              </span>
              <span className="text-[10px] text-forest-300 font-mono uppercase tracking-wider">
                Digital Product Passport
              </span>
            </div>
          </div>

          <Badge variant="forest" size="sm" dot>
            Verified Record
          </Badge>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 sm:px-6 space-y-6">
        {/* Section A: Product Identity */}
        <section className="bg-white rounded-2xl p-5 sm:p-6 border border-sand-200/90 shadow-subtle space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-sand-100">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-forest-700 bg-forest-50 px-2.5 py-0.5 rounded-full border border-forest-200 inline-block mb-1">
                Authentic Growing Bed
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-sand-900">
                {profile.productName}
              </h1>
              <p className="text-xs text-sand-500 font-mono mt-0.5">
                Passport ID: <span className="font-bold text-forest-800">{profile.traceabilityId}</span>
              </p>
            </div>

            <div className="shrink-0 text-left sm:text-right">
              <span className="text-[10px] uppercase font-bold text-sand-400 font-mono block">
                Verification State
              </span>
              <div className="mt-1">
                {verificationStatus.includes('Approved') ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {verificationStatus}
                  </span>
                ) : verificationStatus.includes('Rejected') ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-300 text-xs font-bold">
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    {verificationStatus}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-xs font-bold">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    {verificationStatus}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
            <div className="p-3 rounded-xl bg-sand-50 border border-sand-200">
              <span className="text-[10px] text-sand-400 font-mono uppercase block">Batch Number</span>
              <span className="font-mono font-bold text-sand-900">{batch.id}</span>
            </div>
            <div className="p-3 rounded-xl bg-sand-50 border border-sand-200">
              <span className="text-[10px] text-sand-400 font-mono uppercase block">Production Date</span>
              <span className="font-mono font-semibold text-sand-900">{batch.createdAt}</span>
            </div>
            <div className="p-3 rounded-xl bg-sand-50 border border-sand-200">
              <span className="text-[10px] text-sand-400 font-mono uppercase block">Lot Output</span>
              <span className="font-mono font-bold text-sand-900">{batch.quantity} Beds</span>
            </div>
            <div className="p-3 rounded-xl bg-sand-50 border border-sand-200">
              <span className="text-[10px] text-sand-400 font-mono uppercase block">Verified Scan</span>
              <span className="font-mono text-[11px] text-sand-700">{scanTime}</span>
            </div>
          </div>
        </section>

        {/* Section B: Raw Material Composition */}
        <section className="bg-white rounded-2xl p-5 sm:p-6 border border-sand-200/90 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-sand-100 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-forest-700" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-sand-800">
                Natural Fiber & Substrate Composition
              </h2>
            </div>
            <span className="text-[11px] font-mono text-sand-500">
              Total Weight: {totalWeight.toFixed(1)} kg
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-sand-50 border border-sand-200">
              <span className="text-sand-500 block">Natural Cotton Fiber</span>
              <p className="text-lg font-bold font-mono text-sand-900 mt-1">
                {batch.materials?.cottonKg || 0} kg
              </p>
              <span className="text-[10px] text-sand-400 font-mono">{cottonPct}% of structural base</span>
            </div>

            <div className="p-3.5 rounded-xl bg-earth-50/70 border border-earth-200">
              <span className="text-earth-800 block font-medium">De-salted Coconut Coir</span>
              <p className="text-lg font-bold font-mono text-earth-950 mt-1">
                {batch.materials?.coirKg || 0} kg
              </p>
              <span className="text-[10px] text-earth-700 font-mono">{coirPct}% moisture buffer</span>
            </div>

            <div className="p-3.5 rounded-xl bg-forest-50/70 border border-forest-200">
              <span className="text-forest-800 block font-medium">Top Germination Medium</span>
              <p className="text-lg font-bold font-mono text-forest-950 mt-1">
                {batch.materials?.mediumKg || 0} kg
              </p>
              <span className="text-[10px] text-forest-700 font-mono">{mediumPct}% root-zone layer</span>
            </div>
          </div>

          {/* Visual Ratio Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="w-full h-2.5 rounded-full bg-sand-200 overflow-hidden flex">
              <div style={{ width: `${cottonPct}%` }} className="bg-sand-400" title="Cotton Fiber" />
              <div style={{ width: `${coirPct}%` }} className="bg-earth-600" title="Coconut Coir" />
              <div style={{ width: `${mediumPct}%` }} className="bg-forest-600" title="Growing Medium" />
            </div>
            <div className="flex justify-between text-[10px] text-sand-500 font-mono">
              <span>Cotton Base ({cottonPct}%)</span>
              <span>Coir Matrix ({coirPct}%)</span>
              <span>Crop Medium ({mediumPct}%)</span>
            </div>
          </div>

          {batch.materials?.binder && (
            <p className="text-[11px] text-sand-600 pt-2 border-t border-sand-100">
              <span className="font-semibold text-sand-700">Biodegradable Binder:</span> {batch.materials.binder}
            </p>
          )}
        </section>

        {/* Section C: Manufacturing Journey */}
        <section className="bg-white rounded-2xl p-5 sm:p-6 border border-sand-200/90 shadow-subtle space-y-4">
          <div className="flex items-center gap-2 border-b border-sand-100 pb-3">
            <Activity className="w-4 h-4 text-forest-700" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-sand-800">
              Manufacturing Lifecycle Journey
            </h2>
          </div>

          <div className="space-y-3">
            {MANUFACTURING_STAGES.map((stg, idx) => {
              const isPassed = idx < currentStageIdx;
              const isCurrent = idx === currentStageIdx;

              // Find history remark if logged
              const histMatch = batch.history?.find((h) => h.stage === stg);

              return (
                <div
                  key={stg}
                  className={`p-3 rounded-xl border flex items-start gap-3 text-xs transition-colors ${
                    isPassed
                      ? 'bg-emerald-50/50 border-emerald-200 text-sand-800'
                      : isCurrent
                      ? 'bg-forest-50/80 border-forest-300 text-forest-950 shadow-sm ring-1 ring-forest-400'
                      : 'bg-sand-50/40 border-sand-200 text-sand-400 opacity-60'
                  }`}
                >
                  <div className="w-6 h-6 rounded-md bg-white border border-sand-200 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                    {isPassed ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : `0${idx + 1}`}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sand-900">{stg}</span>
                      <span className="text-[10px] font-mono text-sand-400">
                        {histMatch ? histMatch.timestamp : isPassed ? 'Verified' : isCurrent ? 'In Line' : 'Queued'}
                      </span>
                    </div>
                    {histMatch?.note && (
                      <p className="text-[11px] text-sand-600 mt-0.5 leading-relaxed">
                        {histMatch.note}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section D: Quality Verification */}
        <section className="bg-white rounded-2xl p-5 sm:p-6 border border-sand-200/90 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-sand-100 pb-3">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-forest-700" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-sand-800">
                Laboratory Quality Verification
              </h2>
            </div>
            {qcTest && (
              <Badge variant={qcTest.status === 'Approved' ? 'success' : 'neutral'} size="sm">
                {qcTest.status}
              </Badge>
            )}
          </div>

          {qcTest ? (
            <div className="space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-sand-50 border border-sand-200 gap-2">
                <div>
                  <span className="text-[10px] font-mono text-sand-400 uppercase block">Certified Quality Grade</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-bold text-base text-forest-900">{qcTest.grade}</span>
                    <span className="text-[10px] font-mono text-sand-500 bg-white px-2 py-0.5 rounded border border-sand-200">
                      Criteria: {qcTest.criteriaVersion} [Experimental]
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] font-mono text-sand-400 uppercase block">Reviewed By</span>
                  <span className="font-medium text-sand-800">{qcTest.reviewer || 'QA Inspector'}</span>
                </div>
              </div>

              {/* Physical Test Measurements Summary */}
              {qcTest.measurements ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="p-3 rounded-lg bg-sand-50/70 border border-sand-200">
                    <span className="text-[10px] text-sand-500 block">Water Absorption</span>
                    <span className="text-sm font-mono font-bold text-forest-800">
                      {qcTest.measurements.absorption?.value}%
                    </span>
                    <span className="text-[9px] text-sand-400 block">Dry weight basis</span>
                  </div>

                  <div className="p-3 rounded-lg bg-sand-50/70 border border-sand-200">
                    <span className="text-[10px] text-sand-500 block">Water Retention</span>
                    <span className="text-sm font-mono font-bold text-forest-800">
                      {qcTest.measurements.retention?.value}%
                    </span>
                    <span className="text-[9px] text-sand-400 block">Post-drainage held</span>
                  </div>

                  <div className="p-3 rounded-lg bg-sand-50/70 border border-sand-200">
                    <span className="text-[10px] text-sand-500 block">Moisture Layer Spread</span>
                    <span className="text-sm font-mono font-bold text-forest-800">
                      Δ {qcTest.measurements.moistureDist?.spread}%
                    </span>
                    <span className="text-[9px] text-sand-400 block">Uniformity index</span>
                  </div>

                  <div className="p-3 rounded-lg bg-sand-50/70 border border-sand-200">
                    <span className="text-[10px] text-sand-500 block">Compressive Deformation</span>
                    <span className="text-sm font-mono font-bold text-forest-800">
                      {qcTest.measurements.stability?.value}%
                    </span>
                    <span className="text-[9px] text-sand-400 block">Under 450N load</span>
                  </div>

                  <div className="p-3 rounded-lg bg-sand-50/70 border border-sand-200 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-sand-500 block">Drying Weight Loss</span>
                    <span className="text-sm font-mono font-bold text-forest-800">
                      {qcTest.measurements.drying?.value || '—'}%
                    </span>
                    <span className="text-[9px] text-sand-400 block">Evaporative loss</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-amber-800 text-[11px]">
                  Physical measurement suites are currently in progress. Complete laboratory tests have not yet been logged.
                </div>
              )}

              {qcTest.reviewerNotes && (
                <div className="p-3 rounded-lg bg-white border border-sand-200 text-[11px] text-sand-600 italic">
                  &ldquo;{qcTest.reviewerNotes}&rdquo;
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-sand-50 border border-dashed border-sand-300 text-center space-y-1">
              <Clock className="w-5 h-5 text-sand-400 mx-auto mb-1" />
              <p className="text-xs font-semibold text-sand-800">Awaiting Laboratory Quality Testing</p>
              <p className="text-[11px] text-sand-500">
                Samples from this manufacturing lot are currently queued for ASTM/ISO standard physical validation.
              </p>
            </div>
          )}
        </section>

        {/* Section E: Live Bed Condition (Additional Feature) */}
        <section className="bg-white rounded-2xl p-5 sm:p-6 border border-sand-200/90 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-sand-100 pb-3">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-forest-700" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-sand-800">
                Live Bed Condition & IoT Telemetry
              </h2>
            </div>
            <span className="text-[10px] font-mono text-sand-400 uppercase">
              Sensor Gateway
            </span>
          </div>

          {/* Transparent Hardware Status: Prepared but not fake */}
          <div className="p-4 rounded-xl bg-sand-50/80 border border-sand-200 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-sand-700">
              <span className="w-2 h-2 rounded-full bg-sand-400"></span>
              <span className="font-bold text-sand-800">
                Hardware Monitoring Not Yet Available
              </span>
            </div>
            <p className="text-[11px] text-sand-600 leading-relaxed">
              Real-time ESP32 telemetry hardware (soil moisture probes, substrate temp, ultrasonic water depth) will be paired to this growing bed once installed at the commercial farm site.
            </p>
            <div className="pt-2 border-t border-sand-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono text-sand-500">
              <div>Substrate Moisture: <span className="text-sand-700">Unpaired</span></div>
              <div>Bed Temp: <span className="text-sand-700">Unpaired</span></div>
              <div>Ambient Humidity: <span className="text-sand-700">Unpaired</span></div>
              <div>Tank Level: <span className="text-sand-700">Unpaired</span></div>
            </div>
          </div>
        </section>

        {/* Section F: Product Lifecycle & Biodegradation History */}
        <section className="bg-white rounded-2xl p-5 sm:p-6 border border-sand-200/90 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-sand-100 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-forest-700" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-sand-800">
                Product Lifecycle &amp; Biodegradation History
              </h2>
            </div>
            {bioSamples.length > 0 ? (
              <Badge variant="success" size="xs" dot>
                {bioSamples.length} Specimen{bioSamples.length > 1 ? 's' : ''} Monitored
              </Badge>
            ) : (
              <Badge variant="neutral" size="xs">
                No Record
              </Badge>
            )}
          </div>

          {bioSamples.length > 0 ? (
            <div className="space-y-3">
              {bioSamples.map((sample) => {
                const obsList = biodegradationService.getObservations(sample.id);
                const latestObs = obsList.length > 0 ? obsList[obsList.length - 1] : null;

                return (
                  <div
                    key={sample.id}
                    className="p-4 rounded-xl bg-forest-50/30 border border-forest-200/80 space-y-2.5 text-xs text-sand-700"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-forest-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-forest-900 bg-forest-100 px-2 py-0.5 rounded text-xs">
                          {sample.id}
                        </span>
                        <span className="font-semibold text-sand-900">{sample.sampleName}</span>
                      </div>
                      <Badge variant={sample.status === 'Under Observation' ? 'success' : 'neutral'} size="xs">
                        {sample.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
                      <div>
                        <span className="text-[10px] uppercase text-sand-500 font-semibold block">Growing Bed / Unit</span>
                        <span className="font-mono text-sand-800">{sample.productId || 'Batch Coupon'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-sand-500 font-semibold block">Environment</span>
                        <span className="font-medium text-sand-800">{sample.environment}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-sand-500 font-semibold block">Start Date</span>
                        <span className="font-mono text-sand-700">{sample.startDate}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-sand-500 font-semibold block">Latest Mass Loss</span>
                        <span className="font-mono font-bold text-forest-800">
                          {latestObs ? `${latestObs.massLossPct}%` : '0.0%'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-forest-100/70 text-[11px] text-sand-500">
                      <span>
                        Latest Observation: <strong className="text-sand-700 font-mono">{latestObs ? latestObs.observationDate : sample.startDate}</strong>
                        {latestObs && ` (Appearance: ${latestObs.physicalAppearance})`}
                      </span>
                      <Link
                        to="/biodegradation"
                        className="text-forest-700 hover:text-forest-900 font-semibold inline-flex items-center gap-1 underline underline-offset-2"
                      >
                        <span>View Observation History &rarr;</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-sand-50/70 border border-sand-200 text-xs text-sand-600 space-y-1.5">
              <span className="font-bold text-sand-800 block text-xs">
                Biodegradation Monitoring Status:
              </span>
              <p className="text-xs text-sand-600 leading-relaxed">
                Biodegradation monitoring has not yet been registered for this product.
              </p>
            </div>
          )}
        </section>

        {/* Footer Guarantee */}
        <footer className="text-center text-[10px] text-sand-400 space-y-1 pt-4">
          <p>
            The Wall OS • Cryptographic Product Traceability & Integrity Standard
          </p>
          <p className="font-mono">
            Generated from verified manufacturing records • Scanned {scanTime}
          </p>
        </footer>
      </main>
    </div>
  );
}
