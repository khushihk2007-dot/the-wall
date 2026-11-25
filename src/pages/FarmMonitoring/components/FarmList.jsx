import React, { useState, useMemo } from 'react';
import { Search, Plus, MapPin, User, Eye, Edit2, Layers } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/Table';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';

export function FarmList({ farms, installations, onSelectFarm, onEditFarm, onOpenCreateFarm }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Count installations per farm
  const instCountMap = useMemo(() => {
    const map = {};
    installations.forEach((i) => {
      map[i.farmId] = (map[i.farmId] || 0) + 1;
    });
    return map;
  }, [installations]);

  const filteredFarms = useMemo(() => {
    return farms.filter((f) => {
      const matchesSearch =
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCat = categoryFilter === 'ALL' || f.cropCategory === categoryFilter;

      return matchesSearch && matchesCat;
    });
  }, [farms, searchTerm, categoryFilter]);

  return (
    <Card
      title="Registered Commercial & Trial Farms"
      subtitle="Geographic farm installations and agricultural deployment hubs"
      action={
        <Button size="sm" icon={Plus} onClick={onOpenCreateFarm}>
          Register Farm
        </Button>
      }
      bodyClassName="p-0"
    >
      {/* Search & Filter Bar */}
      <div className="p-4 border-b border-sand-200 bg-sand-50/50 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-sand-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search farm name, location, farmer or ID..."
            className="w-full pl-9 pr-3.5 py-1.5 rounded-lg border border-sand-300 bg-white text-xs text-sand-900 placeholder:text-sand-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-forest-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white border border-sand-300 rounded-lg px-2.5 py-1.5 text-xs text-sand-700 focus:outline-none"
          >
            <option value="ALL">All Crop Categories</option>
            <option value="Fruiting Vegetables">Fruiting Vegetables</option>
            <option value="Nursery & Seed Germination">Nursery & Seed Germination</option>
            <option value="Leafy Vegetables">Leafy Vegetables</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {filteredFarms.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow hover={false}>
              <TableHead>Farm Name & ID</TableHead>
              <TableHead>Farmer / Operator</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Area</TableHead>
              <TableHead>Crop Category</TableHead>
              <TableHead>Beds Deployed</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFarms.map((farm) => (
              <TableRow key={farm.id} className="cursor-pointer" onClick={() => onSelectFarm(farm)}>
                <TableCell>
                  <div className="font-bold text-sand-900 text-xs">
                    {farm.name}
                  </div>
                  <span className="font-mono text-[10px] text-forest-700 font-semibold">{farm.id}</span>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-1.5 text-xs text-sand-800">
                    <User className="w-3.5 h-3.5 text-sand-400" />
                    <span>{farm.farmerName}</span>
                  </div>
                  <span className="text-[10px] text-sand-500">{farm.contact}</span>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-1 text-xs text-sand-700">
                    <MapPin className="w-3.5 h-3.5 text-earth-700 shrink-0" />
                    <span className="truncate max-w-[150px]">{farm.location}</span>
                  </div>
                </TableCell>

                <TableCell>
                  <span className="font-mono font-bold text-sand-800 text-xs">
                    {farm.area} {farm.areaUnit}
                  </span>
                </TableCell>

                <TableCell>
                  <Badge variant="earth" size="sm">
                    {farm.cropCategory}
                  </Badge>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-forest-800">
                    <Layers className="w-3.5 h-3.5 text-forest-600" />
                    <span>{instCountMap[farm.id] || 0} Beds</span>
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditFarm(farm)}
                      title="Edit farm registration details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onSelectFarm(farm)}
                      title="View farm installations and telemetry"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      Details
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="p-8 text-center text-xs text-sand-500">
          No matching farms found. Click &quot;Register Farm&quot; to add a new site.
        </div>
      )}
    </Card>
  );
}
