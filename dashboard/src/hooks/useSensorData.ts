import { useState, useMemo, useEffect } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { ENV_ENDPOINTS, parseSensorData, type EnvKey } from "@/lib/sensor-data";
import type { SensorDataType } from "@/types/data";

const refreshInterval = 30000;

const fetcher = async (url: string): Promise<SensorDataType[]> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Data synchronization failed (${res.status})`);
  return res.json();
};

export function useSensorData(env: EnvKey) {
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const endpoint = ENV_ENDPOINTS[env];

  const { data, error, isLoading, isValidating, mutate } = useSWR<SensorDataType[]>(
    endpoint.url,
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus: false,
      shouldRetryOnError: true,
      onError: (err) => {
        toast.error("Telemetry Link Dropped", { description: err?.message });
      },
    }
  );

  const availableDevices = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    const versions = data.map((d) => d.software_version).filter(Boolean);
    return Array.from(new Set(versions)).sort();
  }, [data]);

  useEffect(() => {
    if (availableDevices.length > 0) {
      if (!selectedDevice || !availableDevices.includes(selectedDevice)) {
        setSelectedDevice(availableDevices[0]);
      }
    } else {
      setSelectedDevice("");
    }
  }, [availableDevices, selectedDevice]);

  const filteredRawData = useMemo(() => {
    if (!data || !selectedDevice) return null;
    return data.filter((item) => item.software_version === selectedDevice);
  }, [data, selectedDevice]);

  const parsed = filteredRawData ? parseSensorData(filteredRawData) : null;

  return {
    data,
    parsed,
    error,
    isLoading,
    isValidating,
    mutate,
    endpoint,
    availableDevices,
    selectedDevice,
    setSelectedDevice,
    refreshInterval
  };
}
