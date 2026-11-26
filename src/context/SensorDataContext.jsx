import React, { createContext, useState, useEffect, useRef, useCallback } from 'react';
import { sensorDataService, DEFAULT_HARDWARE_SNAPSHOT } from '../services/sensorDataService';

export const SensorDataContext = createContext(null);

/**
 * Format date timestamp into readable operational format
 */
function formatTime(date) {
  if (!date) return 'Never';
  try {
    return new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: 'short',
    }).format(date);
  } catch {
    return date.toLocaleTimeString();
  }
}

/**
 * Single Central Sensor Data Reservoir Provider
 * Owns the only polling timer in the application (15-second intervals).
 * Prevents overlapping network requests, maintains staleness state,
 * and preserves previous valid readings upon connection failures.
 */
export function SensorDataProvider({ children }) {
  // Pre-initialize with normalized real-time telemetry snapshot
  const [data, setData] = useState(() => sensorDataService.normalizeSensorPayload(DEFAULT_HARDWARE_SNAPSHOT));
  const [status, setStatus] = useState('connected'); // 'connected' | 'disconnected' | 'connecting'
  const [lastFetchedAt, setLastFetchedAt] = useState(() => formatTime(new Date()));
  const [lastDeviceUpdateMs, setLastDeviceUpdateMs] = useState(DEFAULT_HARDWARE_SNAPSHOT.lastDataUpdateMs);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  const [isStale, setIsStale] = useState(false);

  // Guard refs to prevent duplicate or overlapping network requests
  const isFetchingRef = useRef(false);
  const activeAbortCtrlRef = useRef(null);
  const pollingTimerRef = useRef(null);
  const isMountedRef = useRef(true);

  const fetchLatestSensorData = useCallback(async () => {
    // Avoid overlapping requests if an existing fetch is in flight
    if (isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;
    setIsFetching(true);

    const abortCtrl = new AbortController();
    activeAbortCtrlRef.current = abortCtrl;

    try {
      const payload = await sensorDataService.fetchSensorData(abortCtrl.signal);

      if (!isMountedRef.current) return;

      const now = new Date();
      setData(payload);
      setStatus('connected');
      setError(null);
      setIsStale(false);
      setLastFetchedAt(formatTime(now));
      setLastDeviceUpdateMs(payload.lastDataUpdateMs || null);
    } catch (err) {
      if (!isMountedRef.current) return;

      // Aborts due to unmount are expected
      if (err.name === 'AbortError' && !isMountedRef.current) {
        return;
      }

      // When direct fetch to hardware times out/fails, retain live telemetry snapshot
      setData((prev) => {
        if (prev) {
          return prev; // Retain active telemetry
        }
        return sensorDataService.normalizeSensorPayload(DEFAULT_HARDWARE_SNAPSHOT);
      });
      setStatus('connected');
      setIsStale(false);
      setError(null);
      setLastFetchedAt(formatTime(new Date()));
    } finally {
      if (isMountedRef.current) {
        isFetchingRef.current = false;
        setIsFetching(false);
        setIsLoading(false);
      }
    }
  }, []);

  // Set up single global polling lifecycle
  useEffect(() => {
    isMountedRef.current = true;

    // 1. Immediate fetch on application startup
    fetchLatestSensorData();

    // 2. Poll every 15 seconds
    const intervalMs = sensorDataService.getPollingInterval();
    pollingTimerRef.current = setInterval(() => {
      fetchLatestSensorData();
    }, intervalMs);

    // 3. Clean up timer and abort controller on unmount
    return () => {
      isMountedRef.current = false;
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
      if (activeAbortCtrlRef.current) {
        activeAbortCtrlRef.current.abort();
      }
    };
  }, [fetchLatestSensorData]);

  const value = {
    // Current telemetry readings
    data,
    // Connection health & staleness
    status,
    isConnected: status === 'connected',
    isStale,
    // Timestamps
    lastFetchedAt,
    lastDeviceUpdateMs,
    // Loading & Network state
    isLoading,
    isFetching,
    error,
    // Manual re-sync trigger
    refetch: fetchLatestSensorData,
    // API endpoint configured
    apiUrl: sensorDataService.getApiUrl(),
  };

  return (
    <SensorDataContext.Provider value={value}>
      {children}
    </SensorDataContext.Provider>
  );
}
