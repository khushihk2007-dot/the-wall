import React, { useState, useMemo } from 'react';
import { Search, Filter, AlertCircle, FileText, CheckCircle2, XCircle, AlertTriangle, Layers } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/Table';
import { Badge } from '../../../components/ui/Badge';
import { DataSourceBadge } from '../../../components/common/DataSourceBadge';
import { useDataSourceFilter } from '../../../hooks/useDataSourceFilter';

export function QualityTestTable({ tests, onSelectTest }) {
  const { classify } = useDataSourceFilter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('ALL');

  const filteredTests = useMemo(() => {
    return tests.filter((t) => {
      const bedIdentifier = t.bedId || '';
      const matchesSearch =
        t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.batchId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bedIdentifier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.reviewerNotes && t.reviewerNotes.toLowerCase().includes(searchTerm.toLowerCase()));

      let matchesFilter = true;
      if (filterMode === 'Pending') matchesFilter = t.status === 'Pending';
      else if (filterMode === 'In Progress') matchesFilter = t.status === 'In Progress';
      else if (filterMode === 'Passed') matchesFilter = t.status === 'Approved' && (t.grade === 'Grade A' || t.grade === 'Grade B');
      else if (filterMode === 'Failed') matchesFilter = t.status === 'Rejected' || t.grade === 'Failed';
      else if (filterMode === 'Grade A') matchesFilter = t.grade === 'Grade A';
      else if (filterMode === 'Grade B') matchesFilter = t.grade === 'Grade B';
      else if (filterMode === 'Grade C') matchesFilter = t.grade === 'Grade C';
      else if (filterMode === 'Insufficient Data') matchesFilter = t.grade === 'Insufficient Test Data';

      return matchesSearch && matchesFilter;
    });
  }, [tests, searchTerm, filterMode]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <Badge variant="success" size="xs" dot>Approved</Badge>;
      case 'Rejected':
        return <Badge variant="danger" size="xs" dot>Rejected</Badge>;
      case 'Awaiting Review':
        return <Badge variant="info" size="xs" dot>Awaiting Review</Badge>;
      case 'In Progress':
        return <Badge variant="warning" size="xs" dot>In Progress</Badge>;
      case 'Pending':
      default:
        return <Badge variant="neutral" size="xs">Pending</Badge>;
    }
  };

  const getOverallGradeBadge = (grade) => {
    switch (grade) {
      case 'Grade A':
        return <Badge variant="forest" size="sm">A – Premium</Badge>;
      case 'Grade B':
        return <Badge variant="earth" size="sm">B – Good</Badge>;
      case 'Grade C':
        return <Badge variant="warning" size="sm">C – Basic</Badge>;
      case 'Failed':
        return <Badge variant="danger" size="sm">Failed</Badge>;
      case 'Criteria Not Configured':
        return <Badge variant="warning" size="sm">Criteria Unvalidated</Badge>;
      case 'Insufficient Test Data':
      default:
        return <Badge variant="neutral" size="sm">Insufficient Data</Badge>;
    }
  };

  const getMiniGradePill = (grade, isCritical) => {
    if (isCritical || grade === 'Failed') {
      return <span className="inline-block px-1 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-800">Fail</span>;
    }
    if (grade === 'Grade A') {
      return <span className="inline-block px-1 py-0.2 rounded text-[9px] font-bold bg-forest-100 text-forest-800">A</span>;
    }
    if (grade === 'Grade B') {
      return <span className="inline-block px-1 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-900">B</span>;
    }
    if (grade === 'Grade C') {
      return <span className="inline-block px-1 py-0.2 rounded text-[9px] font-bold bg-orange-100 text-orange-900">C</span>;
    }
    return <span className="inline-block px-1 py-0.2 rounded text-[9px] font-medium bg-sand-100 text-sand-600">—</span>;
  };

  return (
    <Card
      title="Individual Bed Test Results"
      subtitle="Complete physical testing logs, per-test metric breakdown, and automated grading for every independently evaluated growing bed"
      bodyClassName="p-0"
    >
      {/* Search and Filters */}
      <div className="p-4 border-b border-sand-200 bg-sand-50/50 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-sand-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Batch ID, Bed/Sample ID, or notes..."
            className="w-full pl-9 pr-3.5 py-1.5 rounded-lg border border-sand-300 bg-white text-xs text-sand-900 placeholder:text-sand-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-forest-600"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-white border border-sand-300 rounded-lg px-2.5 py-1 text-xs">
          <Filter className="w-3.5 h-3.5 text-sand-400" />
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
            className="bg-transparent text-sand-700 text-xs focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Tested Beds ({tests.length})</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Passed">Passed (Grade A/B)</option>
            <option value="Failed">Failed / Rejected</option>
            <option value="Grade A">Grade A (Premium)</option>
            <option value="Grade B">Grade B (Good)</option>
            <option value="Grade C">Grade C (Basic)</option>
            <option value="Insufficient Data">Insufficient Data</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {filteredTests.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow hover={false}>
                <TableHead>Batch ID</TableHead>
                <TableHead>Bed / Sample ID</TableHead>
                <TableHead title="1. Water Absorption Rate (%)">Absorption</TableHead>
                <TableHead title="2. Water Retention Capacity (%)">Retention</TableHead>
                <TableHead title="3. Moisture Distribution Variation (%)">Moisture Var</TableHead>
                <TableHead title="4. Structural Stability Deformation (%)">Stability Def</TableHead>
                <TableHead title="5. Drying Behaviour Weight Loss (%)">Drying Loss</TableHead>
                <TableHead>Overall Grade</TableHead>
                <TableHead>Test Date</TableHead>
                <TableHead>Criteria Version</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTests.map((test) => {
                const tr = test.testResults || {};
                const m = test.measurements || {};
                
                // Fallbacks if testResults not yet computed
                const absVal = tr.absorption?.value ?? m.absorption?.value;
                const retVal = tr.retention?.value ?? m.retention?.value;
                const moistVal = tr.moistureDist?.value ?? m.moistureDist?.value ?? m.moistureDist?.variationPct;
                const stabVal = tr.stability?.value ?? m.stability?.value;
                const dryVal = tr.drying?.value ?? m.drying?.value;

                return (
                  <TableRow
                    key={test.id}
                    className="cursor-pointer hover:bg-forest-50/20 transition-colors"
                    onClick={() => onSelectTest(test)}
                  >
                    {/* Batch ID */}
                    <TableCell>
                      <div className="font-mono font-bold text-sand-900 text-xs">
                        {test.batchId}
                      </div>
                      <span className="text-[10px] text-sand-400 font-mono block">{test.id}</span>
                    </TableCell>

                    {/* Bed / Sample ID */}
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-forest-50 border border-forest-200 text-forest-800 font-mono font-bold text-xs">
                          {test.bedId || 'BED-01'}
                        </span>
                        {getStatusBadge(test.status)}
                      </div>
                    </TableCell>

                    {/* 1. Absorption */}
                    <TableCell>
                      <div className="flex items-center gap-1 font-mono text-xs">
                        <span className="font-semibold text-sand-800">
                          {absVal != null ? `${absVal}%` : '—'}
                        </span>
                        {absVal != null && getMiniGradePill(tr.absorption?.grade, tr.absorption?.isCriticalFail)}
                      </div>
                    </TableCell>

                    {/* 2. Retention */}
                    <TableCell>
                      <div className="flex items-center gap-1 font-mono text-xs">
                        <span className="font-semibold text-sand-800">
                          {retVal != null ? `${retVal}%` : '—'}
                        </span>
                        {retVal != null && getMiniGradePill(tr.retention?.grade, tr.retention?.isCriticalFail)}
                      </div>
                    </TableCell>

                    {/* 3. Moisture Distribution */}
                    <TableCell>
                      <div className="flex items-center gap-1 font-mono text-xs">
                        <span className="font-semibold text-sand-800">
                          {moistVal != null ? `${moistVal}%` : '—'}
                        </span>
                        {moistVal != null && getMiniGradePill(tr.moistureDist?.grade, tr.moistureDist?.isCriticalFail)}
                      </div>
                    </TableCell>

                    {/* 4. Structural Stability */}
                    <TableCell>
                      <div className="flex items-center gap-1 font-mono text-xs">
                        <span className="font-semibold text-sand-800">
                          {stabVal != null ? `${stabVal}%` : '—'}
                        </span>
                        {stabVal != null && getMiniGradePill(tr.stability?.grade, tr.stability?.isCriticalFail)}
                      </div>
                    </TableCell>

                    {/* 5. Drying Behaviour */}
                    <TableCell>
                      <div className="flex items-center gap-1 font-mono text-xs">
                        <span className="font-semibold text-sand-800">
                          {dryVal != null ? `${dryVal}%` : '—'}
                        </span>
                        {dryVal != null && getMiniGradePill(tr.drying?.grade, tr.drying?.isCriticalFail)}
                      </div>
                    </TableCell>

                    {/* Overall Grade */}
                    <TableCell>
                      {getOverallGradeBadge(test.grade)}
                    </TableCell>

                    {/* Test Date */}
                    <TableCell>
                      <span className="text-xs text-sand-700 whitespace-nowrap">{test.testDate}</span>
                    </TableCell>

                    {/* Criteria Version */}
                    <TableCell>
                      <span className="text-[11px] font-mono font-semibold text-sand-600 bg-sand-100 px-1.5 py-0.5 rounded border border-sand-200">
                        {test.criteriaVersion || '1.0-VALIDATED'}
                      </span>
                    </TableCell>

                    {/* Action */}
                    <TableCell className="text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTest(test);
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold text-forest-700 bg-forest-50 hover:bg-forest-100 rounded border border-forest-200 transition-colors"
                      >
                        View Dossier
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="p-8 text-center text-sand-500 space-y-2">
          <AlertCircle className="w-8 h-8 text-sand-300 mx-auto" />
          <p className="text-sm font-medium">No quality test records matched your filter.</p>
        </div>
      )}
    </Card>
  );
}
