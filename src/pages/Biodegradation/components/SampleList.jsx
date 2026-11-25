import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  MapPin, 
  FlaskConical, 
  Calendar 
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/Table';
import { biodegradationService } from '../../../services/biodegradationService';
import { OBSERVATION_ENVIRONMENTS, OBSERVATION_STATUSES } from '../../../constants/mockBiodegradationData';

export function SampleList({
  samples = [],
  onSelectSample,
  onOpenRegisterModal,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [envFilter, setEnvFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Compute latest observation stats per sample
  const sampleStatsMap = useMemo(() => {
    const map = {};
    samples.forEach((sample) => {
      const obs = biodegradationService.getObservations(sample.id);
      if (obs.length > 0) {
        const latest = obs[obs.length - 1];
        map[sample.id] = {
          obsCount: obs.length,
          latestDate: latest.observationDate,
          latestMassLossPct: latest.massLossPct,
          latestAppearance: latest.physicalAppearance,
          latestIntegrity: latest.structuralIntegrity,
        };
      } else {
        map[sample.id] = {
          obsCount: 0,
          latestDate: sample.startDate,
          latestMassLossPct: 0.0,
          latestAppearance: 'No visible change',
          latestIntegrity: 'Intact',
        };
      }
    });
    return map;
  }, [samples]);

  const filteredSamples = useMemo(() => {
    return samples.filter((s) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        s.id.toLowerCase().includes(search) ||
        s.sampleName.toLowerCase().includes(search) ||
        s.batchId.toLowerCase().includes(search) ||
        s.location.toLowerCase().includes(search) ||
        s.responsibleObserver.toLowerCase().includes(search);

      const matchesEnv = envFilter === 'ALL' || s.environment === envFilter;
      const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;

      return matchesSearch && matchesEnv && matchesStatus;
    });
  }, [samples, searchTerm, envFilter, statusFilter]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Under Observation':
        return <Badge variant="success" size="xs" dot>Under Observation</Badge>;
      case 'Observation Completed':
        return <Badge variant="neutral" size="xs">Completed</Badge>;
      case 'Requires Review':
        return <Badge variant="warning" size="xs" dot>Requires Review</Badge>;
      case 'Observation Paused':
        return <Badge variant="danger" size="xs">Paused</Badge>;
      case 'Registered':
      default:
        return <Badge variant="earth" size="xs">Registered</Badge>;
    }
  };

  return (
    <Card
      title="Biodegradation Test Specimens & Field Samples"
      subtitle="Coupons, soil burial plots, and composting samples registered for empirical degradation logging."
      action={
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={onOpenRegisterModal}
          className="flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Register Sample</span>
        </Button>
      }
      bodyClassName="p-0"
    >
      {/* Search and Filters Bar */}
      <div className="p-4 border-b border-sand-200 bg-sand-50/50 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-sand-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search sample ID, name, batch, location or observer..."
            className="w-full pl-9 pr-3.5 py-1.5 rounded-lg border border-sand-300 bg-white text-xs text-sand-900 placeholder:text-sand-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-forest-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Environment Filter */}
          <select
            value={envFilter}
            onChange={(e) => setEnvFilter(e.target.value)}
            className="text-xs py-1.5 px-3 rounded-lg border border-sand-300 bg-white text-sand-700 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-forest-600"
          >
            <option value="ALL">All Environments</option>
            {OBSERVATION_ENVIRONMENTS.map((env) => (
              <option key={env} value={env}>
                {env}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-1.5 px-3 rounded-lg border border-sand-300 bg-white text-sand-700 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-forest-600"
          >
            <option value="ALL">All Statuses</option>
            {OBSERVATION_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {filteredSamples.length === 0 ? (
        <div className="p-12 text-center text-sand-500">
          <FlaskConical className="w-10 h-10 mx-auto mb-2 text-sand-300" />
          <p className="font-semibold text-sand-800">No Biodegradation Samples Found</p>
          <p className="text-xs text-sand-500 mt-1">
            Try adjusting your search query or filters, or register a new sample.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sample Details</TableHead>
                <TableHead>Batch Linkage</TableHead>
                <TableHead>Environment &amp; Site</TableHead>
                <TableHead>Initial Mass</TableHead>
                <TableHead>Latest Mass Loss</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Next Due Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSamples.map((sample) => {
                const stats = sampleStatsMap[sample.id] || {
                  obsCount: 0,
                  latestMassLossPct: 0.0,
                };

                return (
                  <TableRow 
                    key={sample.id} 
                    className="cursor-pointer hover:bg-sand-50/70 transition-colors"
                    onClick={() => onSelectSample(sample)}
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-sand-900 text-xs hover:text-forest-800">
                          {sample.sampleName}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono font-semibold text-[11px] text-forest-700 bg-forest-50 px-1.5 py-0.2 rounded border border-forest-100">
                            {sample.id}
                          </span>
                          <span className="text-[10px] text-sand-400">
                            {stats.obsCount} measurements
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs font-mono font-medium text-sand-800">
                        {sample.batchId || <span className="text-sand-400 italic">Unlinked</span>}
                      </div>
                      <span className="text-[10px] text-sand-500 font-sans block truncate max-w-[120px]">
                        {sample.productId}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="text-xs font-medium text-sand-800">
                        {sample.environment}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-sand-500 truncate max-w-[150px]">
                        <MapPin className="w-3 h-3 text-sand-400 shrink-0" />
                        <span className="truncate">{sample.location}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="font-mono text-xs font-semibold text-sand-800">
                        {sample.initialDryMass} g
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-baseline gap-1">
                        <span className="font-mono text-xs font-bold text-forest-900">
                          {stats.latestMassLossPct}%
                        </span>
                        <span className="text-[10px] text-sand-500">loss</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      {getStatusBadge(sample.status)}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1 text-xs text-sand-600 font-mono">
                        <Calendar className="w-3 h-3 text-sand-400" />
                        <span>{sample.nextObservationDate || '—'}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}
