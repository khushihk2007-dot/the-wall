import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { LoadingState } from '../components/common/LoadingState';

// Lazy loaded page components for optimal load performance
const OverviewPage = lazy(() => import('../pages/Overview/OverviewPage'));
const ManufacturingPage = lazy(() => import('../pages/Manufacturing/ManufacturingPage'));
const QualityControlPage = lazy(() => import('../pages/QualityControl/QualityControlPage'));
const FarmMonitoringPage = lazy(() => import('../pages/FarmMonitoring/FarmMonitoringPage'));
const WaterRunwayPage = lazy(() => import('../pages/WaterRunway/WaterRunwayPage'));
const QRTraceabilityPage = lazy(() => import('../pages/QRTraceability/QRTraceabilityPage'));
const BiodegradationPage = lazy(() => import('../pages/Biodegradation/BiodegradationPage'));
const ReportsPage = lazy(() => import('../pages/Reports/ReportsPage'));
const DeviceManagementPage = lazy(() => import('../pages/DeviceManagement/DeviceManagementPage'));
const SettingsPage = lazy(() => import('../pages/Settings/SettingsPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));
const PublicTraceabilityPage = lazy(() => import('../pages/Traceability/PublicTraceabilityPage'));

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingState message="Loading module..." />}>
      <Routes>
        {/* Public standalone product verification page (no admin sidebar/navbar) */}
        <Route path="trace/:traceabilityId" element={<PublicTraceabilityPage />} />

        {/* Administrative platform routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<OverviewPage />} />
          <Route path="manufacturing" element={<ManufacturingPage />} />
          <Route path="quality-control" element={<QualityControlPage />} />
          <Route path="farm-monitoring" element={<FarmMonitoringPage />} />
          <Route path="water-runway" element={<WaterRunwayPage />} />
          <Route path="scarcity-mode" element={<Navigate to="/water-runway" replace />} />
          <Route path="qr-traceability" element={<QRTraceabilityPage />} />
          <Route path="biodegradation" element={<BiodegradationPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="device-management" element={<DeviceManagementPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
