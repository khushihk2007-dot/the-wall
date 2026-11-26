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
  Droplet, 
  Thermometer, 
  CloudRain, 
  Ruler, 
  Layers, 
  Info 
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { DataSourceBadge } from '../../../components/common/DataSourceBadge';
import { useDataSourceFilter } from '../../../hooks/useDataSourceFilter';
import { DATA_SOURCES, SOURCE_TYPES } from '../../../constants/dataSourceTypes';
import { farmService } from '../../../services/farmService';

export function SensorCharts({ installation, device }) {
  const { isRealOnly } = useDataSourceFilter();
  const [timeFilter, setTimeFilter] = useState('24h');
  const [activeMetric, setActiveMetric] = useState('all');

  const hasDevice = !!device && device.connectionStatus !== 'Disconnected';

  // Read time-series points based on selected filter
  const chartData = useMemo(() => {
    if (!installation) return [];
    return farmService.getHistoricalReadings(installation.id, timeFilter, device?.id);
  }, [installation, timeFilter, device]);

  const timeOptions = [
    { label: 'Last 1 Hour', value: '1h' },
    { label: 'Last 24 Hours', value: '24h' },
    { label: 'Last 7 Days', value: '7d' },
    { label: 'Last 30 Days', value: '30d' },
  ];

  const metricTabs = [
    { id: 'all', label: 'All Telemetry', icon: Layers },
    { id: 'moisture', label: 'Soil Moisture', icon: Droplet },
    { id: 'temp', label: 'Temperatures', icon: Thermometer },
    { id: 'humidity', label: 'Air Humidity', icon: CloudRain },
    { id: 'distance', label: 'Water Distance', icon: Ruler },
  ];

  if (isRealOnly) {
    return (
      <Card
        title="Historical Sensor Analytics"
        subtitle="Time-series trends and microclimate metrics."
        action={<DataSourceBadge source={DATA_SOURCES.UNAVAILABLE} size="sm" />}
      >
        <div className="p-12 text-center text-sand-500 bg-sand-50/50 rounded-xl border border-dashed border-sand-300">
          <Info className="w-10 h-10 mx-auto mb-3 text-sand-400" />
          <h4 className="font-semibold text-sand-800 text-base">Physical Telemetry History Inactive</h4>
          <p className="text-sm text-sand-600 max-w-md mx-auto mt-1">
            Real time-series database logging has not been initiated for this bed. Live hardware readings are streamed in real time above.
          </p>
        </div>
      </Card>
    );
  }

  if (!hasDevice) {
    return (
      <Card title="Historical Sensor Analytics" subtitle="Time-series trends and microclimate metrics.">
        <div className="p-12 text-center text-sand-500 bg-sand-50/50 rounded-xl border border-dashed border-sand-300">
          <Info className="w-10 h-10 mx-auto mb-3 text-sand-400" />
          <h4 className="font-semibold text-sand-800 text-base">Telemetry History Inactive</h4>
          <p className="text-sm text-sand-600 max-w-md mx-auto mt-1">
            No active hardware gateway is linked to this growing bed installation, or the device is currently offline.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="Historical Sensor Analytics"
      subtitle="Continuous environmental logging. Reflects Channel 1 single-probe prototype measurements."
      action={
        <div className="flex flex-wrap items-center gap-2">
          <DataSourceBadge source={DATA_SOURCES.DEMO} sourceType={SOURCE_TYPES.MOCK} size="xs" />
          {/* Time Filter Buttons */}
          <div className="inline-flex rounded-lg border border-sand-300 bg-white p-0.5">
            {timeOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTimeFilter(opt.value)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  timeFilter === opt.value
                    ? 'bg-forest-700 text-white shadow-xs'
                    : 'text-sand-600 hover:text-sand-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      }
    >
      {/* Metric Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 border-b border-sand-200">
        {metricTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeMetric === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveMetric(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-forest-100 text-forest-800 font-semibold'
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
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E6E4DD" />
            <XAxis 
              dataKey="time" 
              stroke="#8F8B7B" 
              tick={{ fontSize: 11 }}
            />
            <YAxis 
              stroke="#8F8B7B" 
              tick={{ fontSize: 11 }}
              domain={['auto', 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FAF9F5',
                borderColor: '#E6E4DD',
                borderRadius: '0.5rem',
                fontSize: '12px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
            />

            {(activeMetric === 'all' || activeMetric === 'moisture') && (
              <Line
                type="monotone"
                dataKey="moisture"
                name="Top Substrate Moisture (%)"
                stroke="#1B4332"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#1B4332' }}
                activeDot={{ r: 6 }}
              />
            )}

            {(activeMetric === 'all' || activeMetric === 'temp') && (
              <Line
                type="monotone"
                dataKey="bedTemp"
                name="Substrate Bed Temp (°C)"
                stroke="#704E2D"
                strokeWidth={2}
                dot={{ r: 2.5, fill: '#704E2D' }}
              />
            )}

            {(activeMetric === 'all' || activeMetric === 'temp') && (
              <Line
                type="monotone"
                dataKey="airTemp"
                name="Ambient Air Temp (°C)"
                stroke="#D97706"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
            )}

            {(activeMetric === 'all' || activeMetric === 'humidity') && (
              <Line
                type="monotone"
                dataKey="humidity"
                name="Air Humidity (% RH)"
                stroke="#2563EB"
                strokeWidth={1.8}
                dot={false}
              />
            )}

            {(activeMetric === 'all' || activeMetric === 'distance') && (
              <Line
                type="monotone"
                dataKey="distanceCm"
                name="Ultrasonic Distance (cm)"
                stroke="#6B7280"
                strokeWidth={1.5}
                strokeDasharray="2 2"
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Sensor Legend Note */}
      <div className="mt-4 pt-3 border-t border-sand-200 flex flex-wrap items-center justify-between text-xs text-sand-500 gap-2">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-sand-400" />
          <span>Note: Physical probe logs single Channel 1 substrate moisture. Expansion channels are omitted.</span>
        </div>
        <Badge variant="neutral" size="xs">Simulated Telemetry Stream</Badge>
      </div>
    </Card>
  );
}
