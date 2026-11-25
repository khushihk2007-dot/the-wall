import React from 'react';
import { 
  Calendar, 
  MapPin, 
  ClipboardList 
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/Table';
import { Badge } from '../../../components/ui/Badge';

export function WaterUsageTable({
  usageRecords = [],
  totalUsageLitres = 0,
}) {
  const formatDateTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return timestamp;
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return timestamp;
    }
  };

  return (
    <Card
      title="Recent Water Usage History"
      subtitle="Manual consumption logs recorded for this reservoir [DEMO DATA]"
      action={
        <div className="flex items-center gap-2">
          <Badge variant="forest" size="sm">
            Total Logged: {totalUsageLitres.toLocaleString()} L
          </Badge>
        </div>
      }
      bodyClassName="p-0"
    >
      {usageRecords.length === 0 ? (
        <div className="p-12 text-center text-sand-500">
          <ClipboardList className="w-10 h-10 mx-auto mb-2 text-sand-300" />
          <p className="font-semibold text-sand-800">No Water Usage Records Logged</p>
          <p className="text-xs text-sand-500 mt-1">
            Click &quot;Record Water Usage&quot; above to log manual irrigation or priming consumption.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date &amp; Time</TableHead>
                <TableHead>Amount Used</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Farm &amp; Installation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usageRecords.map((record) => (
                <TableRow key={record.id} className="hover:bg-sand-50/70 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-sand-800">
                      <Calendar className="w-3.5 h-3.5 text-sand-400 shrink-0" />
                      <span>{formatDateTime(record.timestamp)}</span>
                    </div>
                    <span className="text-[10px] font-mono text-sand-400 block mt-0.5">
                      {record.id}
                    </span>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono text-sm font-bold text-forest-900">
                        {record.amountLitres?.toLocaleString()}
                      </span>
                      <span className="text-xs font-semibold text-sand-500">Litres</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="neutral" size="xs">
                      {record.purpose}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="text-xs font-medium text-sand-800">
                      {record.farmName || 'Assigned Farm'}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-sand-500 mt-0.5">
                      <MapPin className="w-3 h-3 text-sand-400 shrink-0" />
                      <span>{record.installationId || 'General Reservoir'}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}
