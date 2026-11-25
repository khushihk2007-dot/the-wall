import {
  LayoutDashboard,
  Factory,
  CheckCircle2,
  Sprout,
  Droplets,
  QrCode,
  Recycle,
} from 'lucide-react';
import { ROUTES } from '../constants/routes';

export const NAV_ITEMS = [
  {
    name: 'Overview',
    path: ROUTES.OVERVIEW,
    icon: LayoutDashboard,
    badge: null,
  },
  {
    name: 'Manufacturing',
    path: ROUTES.MANUFACTURING,
    icon: Factory,
    badge: null,
  },
  {
    name: 'Quality Control',
    path: ROUTES.QUALITY_CONTROL,
    icon: CheckCircle2,
    badge: null,
  },
  {
    name: 'Farm Monitoring',
    path: ROUTES.FARM_MONITORING,
    icon: Sprout,
    badge: 'Live',
  },
  {
    name: 'Water Runway',
    path: ROUTES.WATER_RUNWAY,
    icon: Droplets,
    badge: null,
  },
  {
    name: 'QR Traceability',
    path: ROUTES.QR_TRACEABILITY,
    icon: QrCode,
    badge: null,
  },
  {
    name: 'Biodegradation',
    path: ROUTES.BIODEGRADATION,
    icon: Recycle,
    badge: null,
  },
];
