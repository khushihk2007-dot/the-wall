import React, { useState } from 'react';
import { 
  AlertTriangle, 
  AlertOctagon, 
  Info, 
  CheckCircle2, 
  CheckCheck, 
  Clock 
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { biodegradationService } from '../../../services/biodegradationService';

export function BiodegradationAlerts({ alerts = [], onAlertUpdated }) {
  const [filter, setFilter] = useState('All');
  const [alertList, setAlertList] = useState(alerts);

  const handleAcknowledge = (id) => {
    const updated = biodegradationService.acknowledgeAlert(id);
    setAlertList([...updated]);
    if (onAlertUpdated) onAlertUpdated(updated);
  };

  const handleResolve = (id) => {
    const updated = biodegradationService.resolveAlert(id);
    setAlertList([...updated]);
    if (onAlertUpdated) onAlertUpdated(updated);
  };

  const filteredAlerts = alertList.filter((a) => {
    if (filter === 'All') return true;
    return a.status.toLowerCase() === filter.toLowerCase();
  });

  const getSeverityBadge = (sev) => {
    switch (sev?.toLowerCase()) {
      case 'critical':
        return <Badge variant="danger" size="xs">Critical</Badge>;
      case 'warning':
        return <Badge variant="warning" size="xs">Warning</Badge>;
      default:
        return <Badge variant="info" size="xs">Notice</Badge>;
    }
  };

  const getSeverityIcon = (sev) => {
    switch (sev?.toLowerCase()) {
      case 'critical':
        return <AlertOctagon className="w-4 h-4 text-red-600 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-blue-600 shrink-0" />;
    }
  };

  return (
    <Card
      title="Observation Schedule Reminders &amp; Research Alerts"
      subtitle="Automated alerts for measurement deadlines, study pauses, and specimens flagged for review."
      action={
        <div className="flex items-center gap-1.5">
          {['All', 'Active', 'Acknowledged', 'Resolved'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                filter === f
                  ? 'bg-forest-800 text-white shadow-xs'
                  : 'bg-white border border-sand-300 text-sand-600 hover:bg-sand-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      }
    >
      {filteredAlerts.length === 0 ? (
        <div className="p-8 text-center text-sand-500 bg-sand-50/50 rounded-xl border border-dashed border-sand-300">
          <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-forest-600" />
          <p className="font-semibold text-sand-800">No {filter !== 'All' ? filter : ''} Alerts</p>
          <p className="text-xs text-sand-500">All scheduled biodegradation measurements and reviews are up to date.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border transition-all ${
                alert.status === 'Active'
                  ? 'bg-white border-sand-300 shadow-xs'
                  : alert.status === 'Acknowledged'
                  ? 'bg-amber-50/30 border-amber-200'
                  : 'bg-sand-50/50 border-sand-200 opacity-70'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {getSeverityIcon(alert.severity)}
                  <h4 className="font-semibold text-sand-900 text-sm">{alert.alertType}</h4>
                  {getSeverityBadge(alert.severity)}
                  <span className="text-xs font-mono text-sand-400">({alert.id})</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-sand-500">
                  <Clock className="w-3.5 h-3.5 text-sand-400" />
                  <span>Due: <strong className="font-mono text-sand-700">{alert.dueDate}</strong></span>
                  <span className="font-medium px-2 py-0.5 rounded text-[11px] bg-sand-100 text-sand-700">
                    {alert.status}
                  </span>
                </div>
              </div>

              <p className="text-xs text-sand-700 mb-3">{alert.description}</p>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-sand-100 text-xs">
                <div className="flex items-center gap-4 text-sand-500 text-[11px]">
                  <span>Specimen: <strong className="text-sand-700 font-mono font-medium">{alert.sampleId}</strong></span>
                  <span>Batch: <strong className="text-sand-700 font-mono font-medium">{alert.batchId}</strong></span>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {alert.status === 'Active' && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAcknowledge(alert.id)}
                      className="text-xs py-1 px-2.5"
                    >
                      Acknowledge
                    </Button>
                  )}
                  {alert.status !== 'Resolved' && (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => handleResolve(alert.id)}
                      className="text-xs py-1 px-2.5 flex items-center gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Resolve</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
