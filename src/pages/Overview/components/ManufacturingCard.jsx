import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export function ManufacturingCard({ data }) {
  const { totalBatches, inProgress, completed, batchStages, monthlyProduction } = data;

  return (
    <Card
      title="Manufacturing Overview"
      subtitle="Current batch lifecycle status and 6-month output"
      action={
        <Badge variant="forest" size="sm">
          {totalBatches} Total Batches
        </Badge>
      }
    >
      {/* Status Counters */}
      <div className="grid grid-cols-3 gap-3 mb-5 p-3 rounded-xl bg-sand-50/70 border border-sand-200">
        <div className="text-center">
          <span className="text-[11px] font-semibold text-sand-500 uppercase">In Progress</span>
          <p className="text-lg font-bold text-forest-700 font-mono">{inProgress}</p>
        </div>
        <div className="text-center border-x border-sand-200">
          <span className="text-[11px] font-semibold text-sand-500 uppercase">Completed</span>
          <p className="text-lg font-bold text-sand-900 font-mono">{completed}</p>
        </div>
        <div className="text-center">
          <span className="text-[11px] font-semibold text-sand-500 uppercase">Success Rate</span>
          <p className="text-lg font-bold text-emerald-700 font-mono">97.4%</p>
        </div>
      </div>

      {/* Production Chart */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-sand-700">Monthly Growing Bed Output</span>
          <span className="text-[10px] text-sand-400 font-mono">Units produced vs approved</span>
        </div>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyProduction} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EAE8DF" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#6A6658', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6A6658', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#EAE8DF',
                  borderRadius: '8px',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Bar dataKey="beds" fill="#1B4332" radius={[4, 4, 0, 0]} name="Manufactured" />
              <Bar dataKey="approved" fill="#8B633A" radius={[4, 4, 0, 0]} name="Approved" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Active Stages Breakdown */}
      <div>
        <span className="text-xs font-semibold text-sand-700 block mb-2">
          Current In-Flight Stages
        </span>
        <div className="flex flex-wrap gap-1.5">
          {batchStages.map((stg) => (
            <span
              key={stg.stage}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-sand-200 text-xs text-sand-700 shadow-sm"
            >
              <span className="font-medium">{stg.stage}:</span>
              <span className="font-bold font-mono text-forest-700">{stg.count}</span>
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}
