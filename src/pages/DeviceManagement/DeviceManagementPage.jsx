import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Plus } from 'lucide-react';

export default function DeviceManagementPage() {
  return (
    <div>
      <PageHeader
        title="Device & Sensor Management"
        description="Monitor ESP32 gateways, calibrate moisture sensors, configure telemetry intervals, and track actuator states."
        breadcrumbs={['The Wall', 'Device Management']}
        badge={<Badge variant="info" size="sm">IoT Gateway</Badge>}
        actions={
          <Button size="sm" icon={Plus}>
            Register Device
          </Button>
        }
      />

      <Card
        title="Hardware Network Topology"
        subtitle="ESP32 microcontrollers, flow meters, moisture probes, and solenoid drivers."
      >
        <p className="text-sm text-sand-600">
          Maintains heartbeats, signal quality, sequence checks, and anti-duplicate telemetry buffers.
        </p>
      </Card>
    </div>
  );
}
