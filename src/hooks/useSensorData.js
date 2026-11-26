import { useContext } from 'react';
import { SensorDataContext } from '../context/SensorDataContext';

/**
 * Custom hook to consume the central sensor data reservoir.
 * Provides unified access to ESP32 live telemetry, connection status, and staleness state.
 *
 * @returns {{
 *   data: Object|null,
 *   status: 'connected'|'disconnected'|'connecting',
 *   isConnected: boolean,
 *   isStale: boolean,
 *   lastFetchedAt: string|null,
 *   lastDeviceUpdateMs: number|null,
 *   isLoading: boolean,
 *   isFetching: boolean,
 *   error: string|null,
 *   refetch: Function,
 *   apiUrl: string
 * }}
 */
export function useSensorData() {
  const context = useContext(SensorDataContext);
  if (!context) {
    throw new Error('useSensorData must be used within a <SensorDataProvider>.');
  }
  return context;
}
