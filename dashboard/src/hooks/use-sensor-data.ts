import type {
  PaginatedResponse,
  SensorFetchParams,
  SensorLog,
} from '@/types/sensor';
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

export interface ExtendedFetchParams extends Omit<SensorFetchParams, 'type'> {
  software_version?: string;
}

export function useSensorData(initialParams: ExtendedFetchParams = {}) {
  const [data, setData] = useState<PaginatedResponse<SensorLog> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [env, setEnv] = useState<Environment>('staging');

  // Dynamic list populated straight from API log signatures
  const [devices, setDevices] = useState<string[]>([]);

  const [params, setParams] = useState<ExtendedFetchParams>({
    page: 1,
    limit: 100,
    ...initialParams,
  });

  const fetchLogs = useCallback(
    async (currentParams: ExtendedFetchParams, activeEnv: Environment) => {
      setLoading(true);
      setError(null);
      try {
        const url = new URL(ENVIRONMENTS[activeEnv]);

        if (currentParams.software_version) {
          url.searchParams.append(
            'software_version',
            currentParams.software_version,
          );
        }
        url.searchParams.append(
          'page',
          (currentParams.page || 1).toString(),
        );
        url.searchParams.append(
          'limit',
          (currentParams.limit || 100).toString(),
        );

        const response = await fetch(url.toString());
        if (!response.ok)
          throw new Error(`API Error: ${response.statusText}`);

        const json: PaginatedResponse<SensorLog> =
          await response.json();
        setData(json);

        // Dynamically extract unique devices from results and append to known list
        if (json.results && json.results.length > 0) {
          setDevices((prev) => {
            const discovered = json.results
              .map((r) => r.software_version)
              .filter(
                (v): v is string =>
                  typeof v === 'string' && v.length > 0,
              );
            return Array.from(new Set([...prev, ...discovered]));
          });
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'An anonymous error occurred',
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Automatically default to the first discovered device if nothing is selected yet
  useEffect(() => {
    if (devices.length > 0 && !params.software_version) {
      setParams((prev) => ({
        ...prev,
        software_version: devices[0],
        page: 1,
      }));
    }
  }, [devices, params.software_version]);

  useEffect(() => {
    fetchLogs(params, env);
  }, [params, env, fetchLogs]);

  return {
    data: data?.results || [],
    devices, // Exposed to feed into the ControlBar component
    pagination: {
      count: data?.count || 0,
      next: data?.next,
      previous: data?.previous,
      currentPage: params.page || 1,
      limit: params.limit || 100,
    },
    loading,
    error,
    env,
    setEnv,
    setPage: (page: number) => setParams((prev) => ({ ...prev, page })),
    setVersion: (version: string) =>
      setParams((prev) => ({
        ...prev,
        software_version: version,
        page: 1,
      })),
    currentParams: params,
    refresh: () => fetchLogs(params, env),
  };
}
