import React, { useState } from 'react';
import { Calendar, RefreshCw } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { KpiCard } from './components/KpiCard';
import { SmartFarmCard } from './components/SmartFarmCard';
import { WaterIntelligenceCard } from './components/WaterIntelligenceCard';
import { AlertsCard } from './components/AlertsCard';

import {
  OVERVIEW_KPIS,
  FARM_TELEMETRY_SUMMARY,
  WATER_INTELLIGENCE_SUMMARY,
  SYSTEM_ALERTS,
} from '../../constants/mockOverviewData';

function getTodayFormatted() {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());
  } catch {
    return 'Wednesday, 25 November 2026';
  }
}

export default function OverviewPage() {
  // Current date formatting for agricultural log
  const [todayFormatted] = useState(getTodayFormatted);

  return (
    <div className="space-y-6 pb-8">
      {/* 1. Welcome & Operational Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-sand-200/90 shadow-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-forest-700">
              The Wall OS
            </span>
            <span className="text-sand-300">•</span>
            <Badge variant="forest" size="sm">
              Development Preview
            </Badge>
            <span className="text-sand-300">•</span>
            <span className="text-[11px] font-mono text-sand-500 bg-sand-100 px-2 py-0.5 rounded">
              Simulated Demo Mode
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-sand-900 font-sans">
            Overview
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-sand-600 max-w-2xl">
            Monitor your production, product quality and agricultural operations.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-sand-50 border border-sand-200 text-xs font-medium text-sand-700">
            <Calendar className="w-3.5 h-3.5 text-forest-700" />
            <span>{todayFormatted}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={() => window.location.reload()}
            title="Refresh dashboard metrics"
          >
            Sync
          </Button>
        </div>
      </div>

      {/* 2. Key Performance Indicators (4 KPI Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {OVERVIEW_KPIS.map((kpi) => (
          <KpiCard
            key={kpi.id}
            title={kpi.title}
            value={kpi.value}
            unit={kpi.unit}
            iconName={kpi.iconName}
            changeLabel={kpi.changeLabel}
            trend={kpi.trend}
          />
        ))}
      </div>

      {/* 3. Smart Farm Telemetry & Water Runway Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SmartFarmCard data={FARM_TELEMETRY_SUMMARY} />
        <WaterIntelligenceCard data={WATER_INTELLIGENCE_SUMMARY} />
      </div>

      {/* 4. Operational Alerts & Safeguards */}
      <div>
        <AlertsCard alerts={SYSTEM_ALERTS} />
      </div>
    </div>
  );
}
