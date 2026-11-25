import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="System Settings"
        description="Configure quality-grading thresholds, Scarcity Mode safety parameters, farm profiles, and user access roles."
        breadcrumbs={['The Wall', 'Settings']}
        badge={<Badge variant="neutral" size="sm">Configuration</Badge>}
      />

      <Card
        title="Platform Configuration"
        subtitle="Grade scoring thresholds, pump run limits, and notification webhooks."
      >
        <p className="text-sm text-sand-600">
          Adjust lab quality benchmarks (Grade A/B/C cutoffs), default water runway safety margins, and alert dispatch rules.
        </p>
      </Card>
    </div>
  );
}
