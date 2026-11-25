import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Download } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        description="Generate certified PDF and CSV reports for manufacturing batches, quality tests, water runway, and farm consumption."
        breadcrumbs={['The Wall', 'Reports']}
        badge={<Badge variant="forest" size="sm">Module 10</Badge>}
        actions={
          <Button variant="outline" size="sm" icon={Download}>
            Export Center
          </Button>
        }
      />

      <Card
        title="Automated Reporting Engine"
        subtitle="PDF & CSV export pipelines."
      >
        <p className="text-sm text-sand-600">
          Provides export templates for batch manufacturing certificates, quality compliance dossiers, water conservation audits, and biodegradation timelines.
        </p>
      </Card>
    </div>
  );
}
