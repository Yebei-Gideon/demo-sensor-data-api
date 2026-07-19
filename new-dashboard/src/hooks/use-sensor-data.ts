import { useState, useEffect, useCallback } from "react";
import type {PaginatedResponse, SensorLog, SensorFetchParams} from "@/types/sensor";

// Define environment URLs
const ENVIRONMENTS = {
    staging: "https://demo-sensor-data-production-api.vercel.app/api/v1/get-sensor-data?limit=5000",
    production: "https://demo-sensor-data-staging-api.vercel.app/api/v1/get-sensor-data?limit=5000",
};

export type Environment = keyof typeof ENVIRONMENTS;

export interface ExtendedFetchParams extends SensorFetchParams {
    software_version?: string;
}

export function useSensorData(initialParams: ExtendedFetchParams = {}) {
    const [data, setData] = useState<PaginatedResponse<SensorLog> | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [env, setEnv] = useState<Environment>("staging");

    const [params, setParams] = useState<ExtendedFetchParams>({
        page: 1,
        limit: 20,
        ...initialParams,
    });

    const fetchLogs = useCallback(async (currentParams: ExtendedFetchParams, activeEnv: Environment) => {
        setLoading(true);
        setError(null);
        try {
            const url = new URL(ENVIRONMENTS[activeEnv]);
            if (currentParams.type && currentParams.type !== "ALL") {
                url.searchParams.append("type", currentParams.type);
            }
            if (currentParams.software_version && currentParams.software_version !== "ALL") {
                url.searchParams.append("software_version", currentParams.software_version);
            }
            url.searchParams.append("page", (currentParams.page || 1).toString());
            url.searchParams.append("limit", (currentParams.limit || 20).toString());

            const response = await fetch(url.toString());
            if (!response.ok) throw new Error(`API Error: ${response.statusText}`);

            const json: PaginatedResponse<SensorLog> = await response.json();
            setData(json);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An anonymous error occurred");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLogs(params, env);
    }, [params, env, fetchLogs]);

    return {
        data: data?.results || [],
        pagination: {
            count: data?.count || 0,
            next: data?.next,
            previous: data?.previous,
            currentPage: params.page || 1,
            limit: params.limit || 20,
        },
        loading,
        error,
        env,
        setEnv,
        setPage: (page: number) => setParams(prev => ({ ...prev, page })),
        setType: (type: "PMS" | "DHT" | "ALL") => setParams(prev => ({ ...prev, type, page: 1 })),
        setVersion: (version: string) => setParams(prev => ({ ...prev, software_version: version, page: 1 })),
        currentParams: params,
        refresh: () => fetchLogs(params, env),
    };
}