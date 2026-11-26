import React from 'react';
import { Sprout, Layers, Radio, Droplets, AlertTriangle, Clock } from 'lucide-react';
import { Card } from '../../../components/ui/Card';

export function FarmKPIs({ farms, installations, devices, alerts }) {
  const registeredFarms = farms.length;
  const activeInstallations = installations.filter((i) => i.status === 'Monitoring' || i.status === 'Installed').length;
  const connectedDevices = devices.filter((d) => d.connectionStatus === 'Connected').length;
  const activeAlerts = alerts.filter((a) => a.status === 'Active').length;

  const kpis = [
    {
      title: 'Registered Farms',
      value: registeredFarms,
      unit: 'sites',
      icon: Sprout,
      subtext: 'Commercial & trial farms',
      color: 'text-forest-700',
    },
    {
      title: 'Active Installations',
      value: activeInstallations,
      unit: 'beds',
      icon: Layers,
      subtext: `${installations.length} total deployed`,
      color: 'text-earth-700',
    },
    {
      title: 'Connected Devices',
      value: `${connectedDevices} / ${devices.length}`,
      unit: 'nodes',
      icon: Radio,
      subtext: 'ESP32 active telemetry',
      color: 'text-emerald-700',
    },
    {
      title: 'Avg Bed Moisture',
      value: '64.2%',
      unit: 'optimal',
      icon: Droplets,
      subtext: 'Channel 1 (Top Layer)',
      color: 'text-water-700',
    },
    {
      title: 'Active Alerts',
      value: activeAlerts,
      unit: 'events',
      icon: AlertTriangle,
      subtext: activeAlerts > 0 ? 'Requires attention' : 'All systems normal',
      color: activeAlerts > 0 ? 'text-amber-700' : 'text-emerald-700',
    },
    {
      title: 'Last Sensor Update',
      value: '1 min ago',
      unit: 'sync',
      icon: Clock,
      subtext: 'Telemetry interval: 15s',
      color: 'text-forest-700',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-6">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card key={kpi.title} className="p-3.5" bodyClassName="p-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sand-500">
                {kpi.title}
              </span>
              <Icon className={`w-3.5 h-3.5 ${kpi.color}`} />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold font-mono text-sand-900">
                {kpi.value}
              </span>
              <span className="text-[10px] text-sand-500">{kpi.unit}</span>
            </div>
            <p className="text-[10px] text-sand-500 mt-1 truncate">{kpi.subtext}</p>
          </Card>
        );
      })}
    </div>
  );
}
