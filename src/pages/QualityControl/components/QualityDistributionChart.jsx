import React, { useMemo } from 'react';
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
  Cell,
} from 'recharts';

export function QualityDistributionChart({ tests }) {
  const chartData = useMemo(() => {
    const counts = {
      'Grade A': 0,
      'Grade B': 0,
      'Grade C': 0,
      'Failed': 0,
      'Pending / Data Incomplete': 0,
    };

    tests.forEach((t) => {
      if (t.grade === 'Grade A') counts['Grade A'] += 1;
      else if (t.grade === 'Grade B') counts['Grade B'] += 1;
      else if (t.grade === 'Grade C') counts['Grade C'] += 1;
      else if (t.grade === 'Failed' || t.status === 'Rejected') counts['Failed'] += 1;
      else counts['Pending / Data Incomplete'] += 1;
    });

    return [
      { name: 'Grade A', count: counts['Grade A'], color: '#1B4332', desc: 'Premium Quality' },
      { name: 'Grade B', count: counts['Grade B'], color: '#8B633A', desc: 'Acceptable Standard' },
      { name: 'Grade C', count: counts['Grade C'], color: '#D97706', desc: 'Low Quality' },
      { name: 'Failed', count: counts['Failed'], color: '#DC2626', desc: 'Critical Reject' },
      { name: 'Pending / Incomplete', count: counts['Pending / Data Incomplete'], color: '#9CA3AF', desc: 'In Queue' },
    ];
  }, [tests]);

  const total = tests.length;

  return (
    <Card
      title="Quality Grade Distribution"
      subtitle="Categorization based on provisional experimental thresholds (v1.0)"
      action={
        <Badge variant="forest" size="sm">
          {total} Total Evaluations
        </Badge>
      }
      className="mb-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Recharts Bar Chart */}
        <div className="lg:col-span-2 h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 15, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EAE8DF" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#6A6658', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: '#6A6658', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#EAE8DF',
                  borderRadius: '8px',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Batches">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend Summary */}
        <div className="space-y-2 border-t lg:border-t-0 lg:border-l border-sand-200 pt-4 lg:pt-0 lg:pl-6 text-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-sand-500 block mb-1">
            Standard Breakdown
          </span>
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center justify-between py-1.5 border-b border-sand-100 last:border-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <div>
                  <span className="font-semibold text-sand-800">{item.name}</span>
                  <span className="text-[10px] text-sand-400 block">{item.desc}</span>
                </div>
              </div>
              <span className="font-mono font-bold text-sand-900 text-sm bg-sand-50 px-2 py-0.5 rounded border border-sand-200">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
