import React, { useState, useMemo } from 'react';
import { Search, Filter, AlertCircle, FileText } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/Table';
import { Badge } from '../../../components/ui/Badge';

export function QualityTestTable({ tests, onSelectTest }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('ALL');

  const filteredTests = useMemo(() => {
    return tests.filter((t) => {
      const matchesSearch =
        t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.batchId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.reviewerNotes && t.reviewerNotes.toLowerCase().includes(searchTerm.toLowerCase()));

      let matchesFilter = true;
      if (filterMode === 'Pending') matchesFilter = t.status === 'Pending';
      else if (filterMode === 'In Progress') matchesFilter = t.status === 'In Progress';
      else if (filterMode === 'Passed') matchesFilter = t.status === 'Approved' && (t.grade === 'Grade A' || t.grade === 'Grade B');
      else if (filterMode === 'Failed') matchesFilter = t.status === 'Rejected' || t.grade === 'Grade C' || t.grade === 'Failed';
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
        return <Badge variant="success" size="sm" dot>Approved</Badge>;
      case 'Rejected':
        return <Badge variant="danger" size="sm" dot>Rejected</Badge>;
      case 'Awaiting Review':
        return <Badge variant="info" size="sm" dot>Awaiting Review</Badge>;
      case 'In Progress':
        return <Badge variant="warning" size="sm" dot>In Progress</Badge>;
      case 'Pending':
      default:
        return <Badge variant="neutral" size="sm">Pending</Badge>;
    }
  };

  const getGradeBadge = (grade) => {
    switch (grade) {
      case 'Grade A':
        return <Badge variant="forest" size="sm">Grade A (Premium)</Badge>;
      case 'Grade B':
        return <Badge variant="earth" size="sm">Grade B (Standard)</Badge>;
      case 'Grade C':
        return <Badge variant="warning" size="sm">Grade C (Low)</Badge>;
      case 'Failed':
        return <Badge variant="danger" size="sm">Failed</Badge>;
      case 'Insufficient Test Data':
      default:
        return <Badge variant="neutral" size="sm">Insufficient Data</Badge>;
    }
  };

  return (
    <Card
      title="Quality Test Records"
      subtitle="Standardized laboratory physical testing logs and automated grading dossiers"
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
            placeholder="Search test ID or batch code..."
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
            <option value="ALL">All Tests ({tests.length})</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Passed">Passed (Grade A/B)</option>
            <option value="Failed">Failed / Rejected</option>
            <option value="Grade A">Grade A</option>
            <option value="Grade B">Grade B</option>
            <option value="Grade C">Grade C</option>
            <option value="Insufficient Data">Insufficient Data</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {filteredTests.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow hover={false}>
              <TableHead>Test ID</TableHead>
              <TableHead>Manufacturing Batch</TableHead>
              <TableHead>Test Date</TableHead>
              <TableHead>Sample Qty</TableHead>
              <TableHead>Test Status</TableHead>
              <TableHead>Quality Grade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTests.map((test) => (
              <TableRow key={test.id} className="cursor-pointer" onClick={() => onSelectTest(test)}>
                <TableCell>
                  <div className="font-mono font-bold text-forest-800 text-xs flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-forest-600" />
                    {test.id}
                  </div>
                  <span className="text-[10px] text-sand-400 font-mono">v{test.criteriaVersion}</span>
                </TableCell>

                <TableCell>
                  <div className="font-mono font-medium text-sand-900 text-xs">
                    {test.batchId}
                  </div>
                </TableCell>

                <TableCell>
                  <span className="text-xs text-sand-700">{test.testDate}</span>
                </TableCell>

                <TableCell>
                  <span className="font-mono font-bold text-sand-800 text-xs">{test.sampleQuantity}</span>
                  <span className="text-[10px] text-sand-500 ml-1">beds</span>
                </TableCell>

                <TableCell>
                  {getStatusBadge(test.status)}
                </TableCell>

                <TableCell>
                  {getGradeBadge(test.grade)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="p-8 text-center bg-white">
          <AlertCircle className="w-8 h-8 text-sand-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-sand-800">No matching test records found</p>
          <p className="text-xs text-sand-500 mt-0.5">
            Try adjusting your search query or filter selection.
          </p>
        </div>
      )}
    </Card>
  );
}
