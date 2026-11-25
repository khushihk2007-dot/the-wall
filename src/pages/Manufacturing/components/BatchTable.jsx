import React, { useState, useMemo } from 'react';
import { Search, Filter, Eye, ChevronRight, AlertCircle } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/Table';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { BatchWorkflowStepper } from './BatchWorkflowStepper';
import { MANUFACTURING_STAGES } from '../../../constants/mockManufacturingData';

export function BatchTable({ batches, onSelectBatch, onAdvanceBatch }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredBatches = useMemo(() => {
    return batches.filter((b) => {
      const matchesSearch =
        b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.notes && b.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStage = stageFilter === 'ALL' || b.stage === stageFilter;
      const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;

      return matchesSearch && matchesStage && matchesStatus;
    });
  }, [batches, searchTerm, stageFilter, statusFilter]);

  return (
    <Card
      title="Production Batches"
      subtitle="Complete register of growing bed manufacturing lots and progression tracking"
      bodyClassName="p-0"
    >
      {/* Search and Filters bar */}
      <div className="p-4 border-b border-sand-200 bg-sand-50/50 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-sand-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search batch code or notes..."
            className="w-full pl-9 pr-3.5 py-1.5 rounded-lg border border-sand-300 bg-white text-xs text-sand-900 placeholder:text-sand-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-forest-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Stage Filter */}
          <div className="flex items-center gap-1.5 bg-white border border-sand-300 rounded-lg px-2.5 py-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-sand-400" />
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="bg-transparent text-sand-700 text-xs focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Stages ({batches.length})</option>
              {MANUFACTURING_STAGES.map((stg) => (
                <option key={stg} value={stg}>
                  {stg}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-white border border-sand-300 rounded-lg px-2.5 py-1 text-xs">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-sand-700 text-xs focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {filteredBatches.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow hover={false}>
              <TableHead>Batch ID</TableHead>
              <TableHead>Output Beds</TableHead>
              <TableHead>Raw Materials</TableHead>
              <TableHead>Workflow Stage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBatches.map((batch) => {
              const isCompleted = batch.stage === 'Completed';

              return (
                <TableRow key={batch.id} className="cursor-pointer" onClick={() => onSelectBatch(batch)}>
                  {/* Batch ID */}
                  <TableCell>
                    <div className="font-mono font-bold text-forest-800 text-xs">
                      {batch.id}
                    </div>
                    <span className="text-[10px] text-sand-500 truncate max-w-[140px] block">
                      {batch.notes || 'No remarks'}
                    </span>
                  </TableCell>

                  {/* Quantity */}
                  <TableCell>
                    <span className="font-mono font-bold text-sand-900 text-sm">
                      {batch.quantity}
                    </span>
                    <span className="text-[10px] text-sand-500 ml-1">beds</span>
                  </TableCell>

                  {/* Materials */}
                  <TableCell>
                    <div className="text-[11px] text-sand-700 space-y-0.5">
                      <div>
                        <span className="text-sand-400">Cotton:</span>{' '}
                        <span className="font-mono font-semibold">{batch.materials?.cottonKg || 0}kg</span>
                      </div>
                      <div>
                        <span className="text-sand-400">Coir:</span>{' '}
                        <span className="font-mono font-semibold">{batch.materials?.coirKg || 0}kg</span>
                      </div>
                      <div>
                        <span className="text-sand-400">Medium:</span>{' '}
                        <span className="font-mono font-semibold">{batch.materials?.mediumKg || 0}kg</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Stage Progress */}
                  <TableCell className="min-w-[160px]">
                    <BatchWorkflowStepper currentStage={batch.stage} compact />
                  </TableCell>

                  {/* Status Badge */}
                  <TableCell>
                    <Badge
                      variant={isCompleted ? 'success' : 'warning'}
                      size="sm"
                      dot
                    >
                      {batch.status}
                    </Badge>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSelectBatch(batch)}
                        title="View batch details and stage history"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Details
                      </Button>

                      {!isCompleted && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onAdvanceBatch(batch.id)}
                          title="Advance batch to the next manufacturing stage"
                        >
                          <span>Advance</span>
                          <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      ) : (
        <div className="p-8 text-center bg-white">
          <AlertCircle className="w-8 h-8 text-sand-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-sand-800">No matching batches found</p>
          <p className="text-xs text-sand-500 mt-0.5">
            Try adjusting your search keywords or filter settings.
          </p>
        </div>
      )}
    </Card>
  );
}
