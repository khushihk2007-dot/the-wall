import React, { useState, useMemo } from 'react';
import { Search, Plus, Radio, Eye, Edit2 } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/Table';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';

export function InstallationList({
  installations,
  farms,
  onSelectInstallation,
  onEditInstallation,
  onOpenCreateInstallation,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const farmNameMap = useMemo(() => {
    const map = {};
    farms.forEach((f) => {
      map[f.id] = f.name;
    });
    return map;
  }, [farms]);

  const filtered = useMemo(() => {
    return installations.filter((inst) => {
      const farmName = farmNameMap[inst.farmId] || '';
      const matchesSearch =
        inst.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inst.batchId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inst.cropType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        farmName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inst.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || inst.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [installations, searchTerm, statusFilter, farmNameMap]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Monitoring':
        return <Badge variant="success" size="sm" dot>Monitoring</Badge>;
      case 'Installed':
        return <Badge variant="forest" size="sm">Installed</Badge>;
      case 'Maintenance Required':
        return <Badge variant="danger" size="sm" dot>Maintenance</Badge>;
      case 'Inactive':
        return <Badge variant="neutral" size="sm">Inactive</Badge>;
      case 'Registered':
      default:
        return <Badge variant="earth" size="sm">Registered</Badge>;
    }
  };

  return (
    <Card
      title="CocoPit Growing-Bed Installations"
      subtitle="Physical bed deployments mapped to specific farms, lots, and ESP32 telemetry nodes"
      action={
        <Button size="sm" icon={Plus} onClick={onOpenCreateInstallation}>
          Register Installation
        </Button>
      }
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
            placeholder="Search Installation ID, batch, crop or farm..."
            className="w-full pl-9 pr-3.5 py-1.5 rounded-lg border border-sand-300 bg-white text-xs text-sand-900 placeholder:text-sand-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-forest-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-sand-300 rounded-lg px-2.5 py-1.5 text-xs text-sand-700 focus:outline-none"
          >
            <option value="ALL">All Statuses ({installations.length})</option>
            <option value="Monitoring">Monitoring (Live)</option>
            <option value="Installed">Installed</option>
            <option value="Registered">Registered</option>
            <option value="Maintenance Required">Maintenance Required</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {filtered.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow hover={false}>
              <TableHead>Installation ID</TableHead>
              <TableHead>Assigned Farm</TableHead>
              <TableHead>Origin Batch</TableHead>
              <TableHead>Crop Type</TableHead>
              <TableHead>Bed Location</TableHead>
              <TableHead>Telemetry Gateway</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((inst) => (
              <TableRow key={inst.id} className="cursor-pointer" onClick={() => onSelectInstallation(inst)}>
                <TableCell>
                  <div className="font-mono font-bold text-forest-800 text-xs">
                    {inst.id}
                  </div>
                  <span className="text-[10px] text-sand-400 font-mono block">{inst.productId}</span>
                </TableCell>

                <TableCell>
                  <div className="font-semibold text-sand-900 text-xs">
                    {farmNameMap[inst.farmId] || inst.farmId}
                  </div>
                  <span className="text-[10px] text-sand-400 font-mono">{inst.farmId}</span>
                </TableCell>

                <TableCell>
                  <span className="font-mono text-xs text-sand-800 font-semibold">{inst.batchId}</span>
                </TableCell>

                <TableCell>
                  <span className="text-xs text-sand-800">{inst.cropType}</span>
                </TableCell>

                <TableCell>
                  <span className="text-xs text-sand-700">{inst.location}</span>
                </TableCell>

                <TableCell>
                  {inst.deviceId ? (
                    <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-forest-800">
                      <Radio className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{inst.deviceId}</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-sand-400 italic">No Device Assigned</span>
                  )}
                </TableCell>

                <TableCell>
                  {getStatusBadge(inst.status)}
                </TableCell>

                <TableCell className="text-right">
                  <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditInstallation(inst)}
                      title="Edit installation configuration"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onSelectInstallation(inst)}
                      title="Inspect live sensor telemetry and microclimate"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      Live Sensors
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="p-8 text-center text-xs text-sand-500">
          No matching installations found. Click &quot;Register Installation&quot; to deploy a growing bed.
        </div>
      )}
    </Card>
  );
}
