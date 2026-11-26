import React, { useState, useMemo } from 'react';
import { Search, Filter, QrCode, ExternalLink, Sparkles } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/Table';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { DataSourceBadge } from '../../../components/common/DataSourceBadge';
import { useDataSourceFilter } from '../../../hooks/useDataSourceFilter';

export function TraceabilityTable({ records, onSelectRecord, onGenerateQr }) {
  const { classify } = useDataSourceFilter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('ALL');

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchesSearch =
        r.batchId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.traceabilityId && r.traceabilityId.toLowerCase().includes(searchTerm.toLowerCase()));

      let matchesFilter = true;
      if (filterMode === 'In Production') matchesFilter = r.manufacturingStatus === 'In Progress';
      else if (filterMode === 'Completed') matchesFilter = r.manufacturingStatus === 'Completed';
      else if (filterMode === 'Awaiting QA') matchesFilter = r.verificationStatus === 'Awaiting Quality Approval';
      else if (filterMode === 'QA Approved') matchesFilter = r.verificationStatus === 'Quality Approved' || r.verificationStatus === 'Quality Approved (Standard C)';
      else if (filterMode === 'QR Generated') matchesFilter = r.hasQr;
      else if (filterMode === 'QR Missing') matchesFilter = !r.hasQr;

      return matchesSearch && matchesFilter;
    });
  }, [records, searchTerm, filterMode]);

  const getVerificationBadge = (status) => {
    switch (status) {
      case 'Quality Approved':
        return <Badge variant="success" size="sm" dot>Quality Approved</Badge>;
      case 'Quality Approved (Standard C)':
        return <Badge variant="warning" size="sm" dot>Approved (Grade C)</Badge>;
      case 'Quality Rejected':
        return <Badge variant="danger" size="sm" dot>Quality Rejected</Badge>;
      case 'Awaiting Quality Approval':
        return <Badge variant="warning" size="sm">Awaiting QA</Badge>;
      case 'Manufacturing In Progress':
      default:
        return <Badge variant="neutral" size="sm">In Production</Badge>;
    }
  };

  return (
    <Card
      title="Product Traceability Register"
      subtitle="Digital product passports and QR identity records mapped to physical manufacturing lots"
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
            placeholder="Search Batch ID or Traceability ID..."
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
            <option value="ALL">All Batches ({records.length})</option>
            <option value="QR Generated">QR Generated</option>
            <option value="QR Missing">QR Not Generated</option>
            <option value="QA Approved">Quality Approved</option>
            <option value="Awaiting QA">Awaiting Quality Approval</option>
            <option value="In Production">In Production</option>
            <option value="Completed">Completed Production</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {filtered.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow hover={false}>
              <TableHead>Batch & Trace ID</TableHead>
              <TableHead>Origin</TableHead>
              <TableHead>Production Date</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Quality Status</TableHead>
              <TableHead>QR Passport</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((item) => (
              <TableRow key={item.batchId} className="cursor-pointer" onClick={() => onSelectRecord(item)}>
                {/* Batch & Trace ID */}
                <TableCell>
                  <div className="font-mono font-bold text-forest-800 text-xs">
                    {item.batchId}
                  </div>
                  {item.traceabilityId ? (
                    <span className="text-[10px] text-sand-500 font-mono block">
                      {item.traceabilityId}
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-600 italic block">
                      Unassigned Trace ID
                    </span>
                  )}
                </TableCell>

                {/* Origin */}
                <TableCell>
                  <DataSourceBadge source={classify({ id: item.batchId }, 'batch')} size="xs" />
                </TableCell>

                {/* Date */}
                <TableCell>
                  <span className="text-xs text-sand-700">{item.productionDate}</span>
                </TableCell>

                {/* Qty */}
                <TableCell>
                  <span className="font-mono font-bold text-sand-800 text-xs">{item.quantity}</span>
                  <span className="text-[10px] text-sand-500 ml-1">beds</span>
                </TableCell>

                {/* Quality Status */}
                <TableCell>
                  {getVerificationBadge(item.verificationStatus)}
                </TableCell>

                {/* QR Status */}
                <TableCell>
                  {item.hasQr ? (
                    <Badge variant="forest" size="sm" dot>
                      QR Active
                    </Badge>
                  ) : (
                    <Badge variant="neutral" size="sm">
                      Missing QR
                    </Badge>
                  )}
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {item.hasQr ? (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={QrCode}
                          onClick={() => onSelectRecord(item)}
                          title="View QR Code & download options"
                        >
                          Passport
                        </Button>
                        <a
                          href={`/trace/${item.traceabilityId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-sand-500 hover:text-forest-700 rounded-lg hover:bg-sand-100 transition-colors"
                          title="Open public verification page in new tab"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Sparkles}
                        onClick={() => onGenerateQr(item.batchId)}
                        title="Generate digital QR passport for this batch"
                      >
                        Generate QR
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="p-8 text-center bg-white text-sand-500 text-xs">
          No matching batch traceability records found.
        </div>
      )}
    </Card>
  );
}
