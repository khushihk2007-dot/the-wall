import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  TrendingDown, 
  Ruler, 
  CloudRain, 
  GitCompare, 
  Info 
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { OBSERVATION_ENVIRONMENTS } from '../../../constants/mockBiodegradationData';

export function BiodegradationCharts({ samples = [], observations = [] }) {
  const [activeView, setActiveView] = useState('massLoss');
  const [selectedSampleId, setSelectedSampleId] = useState('ALL');
  const [selectedBatchId, setSelectedBatchId] = useState('ALL');
  const [selectedEnv, setSelectedEnv] = useState('ALL');

  // Extract unique batches from samples
  const availableBatches = useMemo(() => {
    const set = new Set();
    samples.forEach((s) => {
      if (s.batchId) set.add(s.batchId);
    });
    return Array.from(set);
  }, [samples]);

  // Filter observations based on selected sample, batch, environment
  const filteredObservations = useMemo(() => {
    return observations.filter((obs) => {
      const sample = samples.find((s) => s.id === obs.sampleId);
      if (!sample) return false;

      const matchesSample = selectedSampleId === 'ALL' || obs.sampleId === selectedSampleId;
      const matchesBatch = selectedBatchId === 'ALL' || sample.batchId === selectedBatchId;
      const matchesEnv = selectedEnv === 'ALL' || sample.environment === selectedEnv;

      return matchesSample && matchesBatch && matchesEnv;
    });
  }, [observations, samples, selectedSampleId, selectedBatchId, selectedEnv]);

  // Format data for Mass Loss, Dimensions, or Environment
  const timeSeriesData = useMemo(() => {
    // Sort chronologically
    const sorted = [...filteredObservations].sort(
      (a, b) => new Date(a.observationDate) - new Date(b.observationDate)
    );

    return sorted.map((obs) => {
      const dims = obs.dimensions || {};
      const env = obs.environmentalConditions || {};
      return {
        date: obs.observationDate,
        day: `Day ${obs.daysSinceStart}`,
        sampleId: obs.sampleId,
        massLossPct: obs.massLossPct,
        currentDryMass: obs.currentDryMass,
        thicknessMm: dims.thicknessMm,
        lengthMm: dims.lengthMm,
        tempC: env.temperatureC,
        humidityPct: env.relativeHumidityPct,
        moisturePct: env.soilMoisturePct,
      };
    });
  }, [filteredObservations]);

  // Comparative multi-sample curve data grouped by day interval
  const comparisonData = useMemo(() => {
    // Group days: 0, 30, 60, 90, 120, 180
    const dayBuckets = [0, 30, 60, 90, 120, 180];
    return dayBuckets.map((d) => {
      const entry = { dayLabel: `Day ${d}` };
      samples.forEach((sample) => {
        const sampleObs = observations.filter((o) => o.sampleId === sample.id);
        // Find observation closest to day d
        const match = sampleObs.find((o) => Math.abs(o.daysSinceStart - d) <= 7);
        if (match) {
          entry[sample.id] = match.massLossPct;
        }
      });
      return entry;
    });
  }, [samples, observations]);

  const viewTabs = [
    { id: 'massLoss', label: 'Mass Loss Over Time (%)', icon: TrendingDown },
    { id: 'comparison', label: 'Multi-Specimen Comparison', icon: GitCompare },
    { id: 'dimensions', label: 'Dimensional Change (mm)', icon: Ruler },
    { id: 'environment', label: 'Environmental Conditions', icon: CloudRain },
  ];

  const sampleColors = ['#1B4332', '#704E2D', '#2563EB', '#D97706', '#059669'];

  return (
    <Card
      title="Empirical Degradation Kinetics &amp; Environmental Analytics"
      subtitle="Visualisations computed strictly from actual recorded observation measurements."
      action={
        <div className="flex flex-wrap items-center gap-2">
          {/* Sample Filter */}
          <select
            value={selectedSampleId}
            onChange={(e) => setSelectedSampleId(e.target.value)}
            className="text-xs py-1 px-2.5 rounded-lg border border-sand-300 bg-white text-sand-700"
          >
            <option value="ALL">All Specimens</option>
            {samples.map((s) => (
              <option key={s.id} value={s.id}>
                {s.id} ({s.environment})
              </option>
            ))}
          </select>

          {/* Batch Filter */}
          <select
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            className="text-xs py-1 px-2.5 rounded-lg border border-sand-300 bg-white text-sand-700"
          >
            <option value="ALL">All Batches</option>
            {availableBatches.map((b) => (
              <option key={b} value={b}>
                Batch {b}
              </option>
            ))}
          </select>

          {/* Environment Filter */}
          <select
            value={selectedEnv}
            onChange={(e) => setSelectedEnv(e.target.value)}
            className="text-xs py-1 px-2.5 rounded-lg border border-sand-300 bg-white text-sand-700"
          >
            <option value="ALL">All Environments</option>
            {OBSERVATION_ENVIRONMENTS.map((env) => (
              <option key={env} value={env}>
                {env}
              </option>
            ))}
          </select>
        </div>
      }
    >
      {/* Metric Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 border-b border-sand-200">
        {viewTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeView === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveView(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-forest-100 text-forest-800 font-semibold shadow-xs'
                  : 'text-sand-600 hover:bg-sand-100 hover:text-sand-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full pt-1">
        {activeView === 'massLoss' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeSeriesData} margin={{ top: 10, right: 25, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E6E4DD" />
              <XAxis dataKey="day" stroke="#8F8B7B" tick={{ fontSize: 11 }} />
              <YAxis stroke="#8F8B7B" tick={{ fontSize: 11 }} domain={[0, 'auto']} unit="%" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FAF9F5',
                  borderColor: '#E6E4DD',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Line
                type="monotone"
                dataKey="massLossPct"
                name="Dry Mass Loss (%)"
                stroke="#1B4332"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#1B4332' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {activeView === 'comparison' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={comparisonData} margin={{ top: 10, right: 25, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E6E4DD" />
              <XAxis dataKey="dayLabel" stroke="#8F8B7B" tick={{ fontSize: 11 }} />
              <YAxis stroke="#8F8B7B" tick={{ fontSize: 11 }} domain={[0, 'auto']} unit="%" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FAF9F5',
                  borderColor: '#E6E4DD',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              {samples.map((sample, idx) => (
                <Line
                  key={sample.id}
                  type="monotone"
                  dataKey={sample.id}
                  name={`${sample.id} (${sample.environment})`}
                  stroke={sampleColors[idx % sampleColors.length]}
                  strokeWidth={2}
                  connectNulls
                  dot={{ r: 3.5, fill: sampleColors[idx % sampleColors.length] }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}

        {activeView === 'dimensions' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeSeriesData} margin={{ top: 10, right: 25, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E6E4DD" />
              <XAxis dataKey="day" stroke="#8F8B7B" tick={{ fontSize: 11 }} />
              <YAxis stroke="#8F8B7B" tick={{ fontSize: 11 }} domain={['auto', 'auto']} unit="mm" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FAF9F5',
                  borderColor: '#E6E4DD',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Line
                type="monotone"
                dataKey="thicknessMm"
                name="Thickness (mm)"
                stroke="#704E2D"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="lengthMm"
                name="Length (mm)"
                stroke="#1B4332"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {activeView === 'environment' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeSeriesData} margin={{ top: 10, right: 25, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E6E4DD" />
              <XAxis dataKey="day" stroke="#8F8B7B" tick={{ fontSize: 11 }} />
              <YAxis stroke="#8F8B7B" tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FAF9F5',
                  borderColor: '#E6E4DD',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Line
                type="monotone"
                dataKey="tempC"
                name="Temperature (°C)"
                stroke="#D97706"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="humidityPct"
                name="Air Humidity (% RH)"
                stroke="#2563EB"
                strokeWidth={2}
                strokeDasharray="3 3"
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="moisturePct"
                name="Soil/Compost Moisture (%)"
                stroke="#059669"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Scientific Transparency Footnote */}
      <div className="mt-4 pt-3 border-t border-sand-200 flex flex-wrap items-center justify-between text-xs text-sand-500 gap-2">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-sand-400 shrink-0" />
          <span>Chart plots actual recorded observations only. No simulated interpolation is added.</span>
        </div>
        <Badge variant="neutral" size="xs">Empirical Observation History</Badge>
      </div>
    </Card>
  );
}
