import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { traceabilityService } from '../../services/traceabilityService';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/common/LoadingState';
import {
  Leaf,
  Layers,
  Droplet,
  Clock,
  XCircle,
  Radio,
  CheckCircle2,
} from 'lucide-react';
import { useSensorData } from '../../hooks/useSensorData';
import { farmService } from '../../services/farmService';

export default function PublicTraceabilityPage() {
  const { traceabilityId } = useParams();
  const [profile, setProfile] = useState(() => traceabilityService.getByTraceabilityId(traceabilityId));
  const [isLoading, setIsLoading] = useState(true);
  const { data: sensorData, isConnected, lastFetchedAt } = useSensorData();

  useEffect(() => {
    let isCurrent = true;
    traceabilityService
      .getPublicPassport(traceabilityId)
      .then((data) => {
        if (isCurrent) {
          setProfile(data);
        }
      })
      .catch(() => {
        if (isCurrent) {
          setProfile(null);
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [traceabilityId]);

  // Find if this specific batch is paired with an active field installation
  const pairedInstallation = useMemo(() => {
    if (!profile?.batch?.id) return null;
    try {
      const installations = farmService.getInstallations();
      return installations.find((i) => i.batchId === profile.batch.id && i.deviceId) || null;
    } catch {
      return null;
    }
  }, [profile?.batch?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center p-4">
        <LoadingState message="Verifying Digital Product Passport..." />
      </div>
    );
  }

  if (!profile || !profile.batch) {
    return (
      <div className="min-h-screen bg-sand-50 flex flex-col items-center justify-center p-4 text-center font-sans">
        <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-card border border-sand-200">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-mono uppercase font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
            Verification Notice
          </span>
          <h2 className="text-xl font-bold text-sand-900 mt-3 mb-1">
            Traceability Record Not Found
          </h2>
          <p className="text-xs text-sand-600 mb-6 leading-relaxed">
            The scanned traceability ID <code className="font-mono font-bold text-sand-800 bg-sand-100 px-1 py-0.5 rounded">{traceabilityId || 'Unknown'}</code> does not match any registered product batch.
          </p>
          <div className="p-3 rounded-lg bg-sand-50 border border-sand-200 text-[11px] text-sand-500 text-left">
            <span className="font-semibold block text-sand-700 mb-0.5">Notice to Agricultural Operators:</span>
            Please ensure the physical QR code is unsoiled. Contact customer support if this batch was recently dispatched.
          </div>
        </div>
      </div>
    );
  }

  const { batch } = profile;

  // --- SECTION A: MATERIALS ---
  // Extract actual recorded raw materials from the batch record
  const mats = batch.materials || {};
  const materialList = [];

  if (mats.cottonKg != null && mats.cottonKg > 0) {
    materialList.push({
      name: 'Natural Cotton Fiber',
      quantity: `${mats.cottonKg} kg`,
      description: 'Structural composite base',
    });
  }

  if (mats.coirKg != null && mats.coirKg > 0) {
    materialList.push({
      name: 'De-salted Coconut Coir',
      quantity: `${mats.coirKg} kg`,
      description: 'Moisture buffer substrate',
    });
  }

  if (mats.mediumKg != null && mats.mediumKg > 0) {
    materialList.push({
      name: 'Germination Medium',
      quantity: `${mats.mediumKg} kg`,
      description: 'Root-zone organic nutrient layer',
    });
  }

  if (mats.binder && typeof mats.binder === 'string' && mats.binder.trim()) {
    materialList.push({
      name: 'Organic Binder',
      quantity: mats.binder,
      description: 'Bio-based structural binding agent',
    });
  }

  // Include any extra explicit material fields recorded
  Object.entries(mats).forEach(([key, val]) => {
    if (!['cottonKg', 'coirKg', 'mediumKg', 'binder'].includes(key) && val) {
      materialList.push({
        name: key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()),
        quantity: String(val),
        description: 'Material formulation constituent',
      });
    }
  });

  // --- SECTION B: WATER CONTENT ---
  // Real soil moisture reading from central ESP32 sensor reservoir
  const isPaired = Boolean(pairedInstallation && pairedInstallation.deviceId);
  const isMoistureValid = Boolean(
    isConnected && 
    isPaired && 
    sensorData && 
    sensorData.soilValid && 
    sensorData.soilMoisturePercent !== null
  );

  // --- SECTION C: PRODUCT LIFETIME ---
  // Expected lifetime displayed ONLY when an experimentally established or validated value exists
  const validatedLifetime = batch.validatedLifetime || profile.validatedLifetime || null;

  return (
    <div className="min-h-screen bg-sand-50 text-sand-900 font-sans pb-16">
      {/* Top Header */}
      <header className="bg-forest-900 text-white border-b border-forest-800 px-4 py-4 sm:px-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
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
            Verified Batch
          </Badge>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-2xl mx-auto px-4 py-6 sm:px-6 space-y-6">
        {/* Product Identity Summary */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-sand-200/90 shadow-subtle space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-forest-700 bg-forest-50 px-2.5 py-0.5 rounded-full border border-forest-200 inline-block">
            Authentic Growing Bed
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-sand-900 tracking-tight">
            {profile.productName || 'Smart Biodegradable Growing Bed'}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-sand-600 font-mono pt-1">
            <span>Passport ID: <strong className="text-forest-900">{profile.traceabilityId}</strong></span>
            <span>Batch: <strong className="text-sand-800">{batch.id}</strong></span>
          </div>
        </div>

        {/* SECTION 1: MATERIALS */}
        <section className="bg-white rounded-2xl p-5 sm:p-6 border border-sand-200/90 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-sand-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-forest-50 flex items-center justify-center text-forest-700">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-sand-900">
                  Materials
                </h2>
                <p className="text-[11px] text-sand-500">
                  Specific manufacturing raw material formulation
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-sand-500 font-medium">
              {materialList.length} Recorded
            </span>
          </div>

          {materialList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {materialList.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-sand-50/70 border border-sand-200 space-y-1"
                >
                  <span className="text-xs font-semibold text-sand-900 block">
                    {item.name}
                  </span>
                  <div className="text-base font-bold font-mono text-forest-900">
                    {item.quantity}
                  </div>
                  <span className="text-[10px] text-sand-500 block">
                    {item.description}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-sand-50 border border-sand-200 text-center text-xs text-sand-500">
              No material formulation quantities recorded for this specific batch.
            </div>
          )}
        </section>

        {/* SECTION 2: WATER CONTENT */}
        <section className="bg-white rounded-2xl p-5 sm:p-6 border border-sand-200/90 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-sand-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center text-sky-700">
                <Droplet className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-sand-900">
                  Water Content
                </h2>
                <p className="text-[11px] text-sand-500">
                  Substrate moisture reading from paired field sensor
                </p>
              </div>
            </div>
            {isMoistureValid ? (
              <Badge variant="success" size="xs" dot>
                Telemetry Active
              </Badge>
            ) : (
              <Badge variant="neutral" size="xs">
                Currently Unavailable
              </Badge>
            )}
          </div>

          {isMoistureValid ? (
            <div className="p-4 rounded-xl bg-forest-50/50 border border-forest-200 space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-forest-950 font-mono tracking-tight">
                  {sensorData.soilMoisturePercent}%
                </span>
                <span className="text-xs font-semibold uppercase text-forest-700">
                  Substrate Moisture
                </span>
              </div>

              {sensorData.ultrasonicDistanceCm != null && (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/70 border border-forest-100 text-xs">
                  <span className="text-forest-800 font-medium">Ultrasonic Reservoir Distance:</span>
                  <span className="font-mono font-bold text-forest-900">
                    {sensorData.ultrasonicDistanceCm} cm ({sensorData.estimatedWaterLiters != null ? `${sensorData.estimatedWaterLiters} L est.` : 'Active'})
                  </span>
                </div>
              )}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-forest-800 pt-2 border-t border-forest-100">
                <div className="flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-forest-600 animate-pulse" />
                  <span>Real-time ESP32 capacitive probe measurement</span>
                </div>
                <span className="text-forest-700 font-mono">
                  Updated: {lastFetchedAt || 'Live'}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-sand-50/80 border border-sand-200 space-y-1.5 text-xs text-sand-600">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sand-400"></span>
                <span className="font-bold text-sand-800">
                  Currently unavailable
                </span>
              </div>
              <p className="text-[11px] text-sand-500 leading-relaxed">
                {!isPaired
                  ? 'This growing bed is not currently linked to an active online field sensor.'
                  : !isConnected
                    ? 'The associated field sensor node is currently offline.'
                    : 'Sensor probe is uncalibrated or awaiting substrate moisture contact.'}
              </p>
            </div>
          )}
        </section>

        {/* SECTION 3: PRODUCT LIFETIME */}
        <section className="bg-white rounded-2xl p-5 sm:p-6 border border-sand-200/90 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-sand-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-sand-900">
                  Product Lifetime
                </h2>
                <p className="text-[11px] text-sand-500">
                  Experimentally established durability and functional lifespan
                </p>
              </div>
            </div>
            {validatedLifetime ? (
              <Badge variant="success" size="xs">
                Validated
              </Badge>
            ) : (
              <Badge variant="neutral" size="xs">
                Under Evaluation
              </Badge>
            )}
          </div>

          {validatedLifetime ? (
            <div className="p-4 rounded-xl bg-forest-50/50 border border-forest-200 space-y-1.5">
              <div className="text-2xl font-bold font-mono text-forest-950">
                {validatedLifetime}
              </div>
              <p className="text-[11px] text-forest-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-forest-600 shrink-0" />
                <span>Certified experimental durability under standard agricultural conditions</span>
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-sand-50/80 border border-sand-200 space-y-1.5 text-xs text-sand-600">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sand-400"></span>
                <span className="font-bold text-sand-800">
                  Lifetime not yet established
                </span>
              </div>
              <p className="text-[11px] text-sand-500 leading-relaxed">
                Empirical biodegradation and field durability validation are currently underway. No certified lifetime has been finalized for this production lot.
              </p>
            </div>
          )}
        </section>

        {/* Clean Footer */}
        <footer className="text-center text-[10px] text-sand-400 font-mono pt-4 border-t border-sand-200">
          The Wall • Sustainable Circular Agriculture • Digital Product Traceability
        </footer>
      </main>
    </div>
  );
}
