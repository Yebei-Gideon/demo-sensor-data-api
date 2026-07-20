import type { PaginatedResponse, SensorLog } from '#/types/sensor';
import { useCallback, useEffect, useState } from 'react';

const { VITE_STAGING_API_URL, VITE_PRODUCTION_API_URL } = import.meta.env;

if (!VITE_STAGING_API_URL || !VITE_PRODUCTION_API_URL) {
  throw new Error(
    'Environment variables VITE_STAGING_API_URL and VITE_PRODUCTION_API_URL must be defined',
  );
}

const ENVIRONMENTS = {
  staging: VITE_STAGING_API_URL as string,
  production: VITE_PRODUCTION_API_URL as string,
};

export type Environment = keyof typeof ENVIRONMENTS;

export function useSensorData() {
  const [logs, setLogs] = useState<SensorLog[]>([]);
  const [devices, setDevices] = useState<string[]>([]);
  const [currentVersion, setCurrentVersion] = useState<string>('');
  const [env, setEnv] = useState<Environment>('staging');

  const [loading, setLoading] = useState<boolean>(true);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Explicit handler to clear dynamic cache registries when toggling cloud clusters
  const handleEnvChange = useCallback((targetEnv: Environment) => {
    setEnv(targetEnv);
    setDevices([]);
    setCurrentVersion('');
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function streamTelemetryEngine() {
      setLoading(true);
      setError(null);

      let activeVersion = currentVersion;
      let existingDevices = devices;

      // STEP 1: Dynamic Discovery (Runs if no active version signature is known)
      if (existingDevices.length === 0 || !activeVersion) {
        try {
          const discoveryUrl = new URL(ENVIRONMENTS[env]);
          discoveryUrl.searchParams.append('page', '1');
          discoveryUrl.searchParams.append('limit', '100');

          const response = await fetch(discoveryUrl.toString());
          if (!response.ok)
            throw new Error(
              `Discovery Error: ${response.statusText}`,
            );
          const json: PaginatedResponse<SensorLog> =
            await response.json();

          if (!isMounted) return;

          const discovered = json.results
            .map((r) => r.software_version)
            .filter(
              (v): v is string =>
                typeof v === 'string' && v.length > 0,
            );

          const uniqueDevices = Array.from(new Set(discovered));

          if (uniqueDevices.length > 0) {
            setDevices(uniqueDevices);
            activeVersion = uniqueDevices[0];
            setCurrentVersion(activeVersion);
          } else {
            // Fallback scenario if backend data tables are empty
            setLogs(json.results);
            setLoading(false);
            return;
          }
        } catch (err) {
          if (isMounted)
            setError(
              err instanceof Error
                ? err.message
                : 'Discovery engine failed',
            );
          setLoading(false);
          return;
        }
      }

      // STEP 2: Incremental Multi-page Core Background Streamer
      setIsStreaming(true);
      setLogs([]); // Wipe out historical frames to avoid layout bleeding cross-device

      let nextCursor: string | null = null;
      let pageIndex = 1;

      try {
        // Render Page 1 Instantly
        const primaryUrl = new URL(ENVIRONMENTS[env]);
        primaryUrl.searchParams.append(
          'software_version',
          activeVersion,
        );
        primaryUrl.searchParams.append('page', '1');
        primaryUrl.searchParams.append('limit', '100');

        const firstPageResponse = await fetch(primaryUrl.toString());
        if (!firstPageResponse.ok)
          throw new Error(
            `Primary Fetch Failed: ${firstPageResponse.statusText}`,
          );
        const firstPageJson: PaginatedResponse<SensorLog> =
          await firstPageResponse.json();

        if (!isMounted) return;

        setLogs(firstPageJson.results);
        setLoading(false); // First page successfully mounted. Unlock Layout viewports.

        nextCursor = firstPageJson.next;
        pageIndex = 2;

        // Stream and swallow historical logs sequentially in the background
        while (nextCursor && isMounted) {
          const parsedCursor = new URL(nextCursor);
          const cursorPage =
            parsedCursor.searchParams.get('page') ||
            pageIndex.toString();

          const streamUrl = new URL(ENVIRONMENTS[env]);
          streamUrl.searchParams.append(
            'software_version',
            activeVersion,
          );
          streamUrl.searchParams.append('page', cursorPage);
          streamUrl.searchParams.append('limit', '100');

          const backgroundResponse = await fetch(
            streamUrl.toString(),
          );
          if (!backgroundResponse.ok) break; // Break out safely if index tails out

          const backgroundJson: PaginatedResponse<SensorLog> =
            await backgroundResponse.json();
          if (!isMounted) return;

          // Performance Optimization: Update list array reference natively to preserve re-rendering thread limits
          setLogs((prev) => [...prev, ...backgroundJson.results]);
          nextCursor = backgroundJson.next;
          pageIndex = Number(cursorPage) + 1;
        }
      } catch (err) {
        if (isMounted)
          setError(
            err instanceof Error ? err.message : 'Streaming fault',
          );
      } finally {
        if (isMounted) {
          setLoading(false);
          setIsStreaming(false);
        }
      }
    }

    streamTelemetryEngine();

    return () => {
      isMounted = false; // Safely discards overlapping async callbacks on device/env updates
    };
  }, [env, currentVersion]);

  return {
    data: logs,
    devices,
    env,
    setEnv: handleEnvChange,
    currentVersion,
    setVersion: setCurrentVersion,
    loading,
    isStreaming,
    error,
  };
}
