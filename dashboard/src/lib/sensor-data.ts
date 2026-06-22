import type { SensorDataType } from "@/types/data";

export type SensorValue = { value_type: string; value: number | string };
export type SensorReading = { software_version: string; sensordatavalues: SensorValue[] };

export type EnvKey = "production" | "staging";

export const ENV_ENDPOINTS: Record<EnvKey, { label: string; url: string }> = {
  production: {
    label: "Production",
    url: "https://demo-sensor-data-production-api.vercel.app/api/v1/get-sensor-data?limit=5000",
  },
  staging: {
    label: "Staging",
    url: "https://demo-sensor-data-staging-api.vercel.app/api/v1/get-sensor-data?limit=5000",
  },
};

export type ParsedData = {
  air: { timestamp: number; P0: number; P1: number; P2: number }[];
  env: { timestamp: number; temperature: number; humidity: number }[];
  latest: {
    temperature?: number;
    humidity?: number;
    P0?: number;
    P1?: number;
    P2?: number;
  };
  deltas: {
    temperature?: number;
    humidity?: number;
    P2?: number;
  };
  softwareVersion?: string;
  totalReadings: number;
};

const num = (v: number | string) => (typeof v === "number" ? v : parseFloat(v));

export function parseSensorData(raw: SensorDataType[]): ParsedData {
  const air: ParsedData["air"] = [];
  const env: ParsedData["env"] = [];
  const latest: ParsedData["latest"] = {};
  const deltas: ParsedData["deltas"] = {};
  let version: string | undefined;

  if (!raw || !Array.isArray(raw) || raw.length === 0) {
    return { air, env, latest, deltas, softwareVersion: version, totalReadings: 0 };
  }

  // API returns DESC order (newest first). Reversing allows us to populate
  // chronological chart data points sequentially, while cleanly logging the final state as "latest"
  const chronologicalRaw = [...raw].reverse();

  chronologicalRaw.forEach((reading) => {
    version = reading.software_version;
    const map: Record<string, number> = {};
    const time = new Date(reading.created_at).getTime();

    reading.data.forEach((v) => {
      map[v.value_type] = num(v.value);
    });

    const hasPM = "P0" in map || "P1" in map || "P2" in map;
    const hasEnv = "temperature" in map || "humidity" in map;

    if (hasPM) {
      air.push({
        timestamp: time,
        P0: map.P0 ?? 0,
        P1: map.P1 ?? 0,
        P2: map.P2 ?? 0,
      });
      if (map.P0 !== undefined) latest.P0 = map.P0;
      if (map.P1 !== undefined) latest.P1 = map.P1;
      if (map.P2 !== undefined) latest.P2 = map.P2;
    }
    if (hasEnv) {
      env.push({
        timestamp: time,
        temperature: map.temperature ?? 0,
        humidity: map.humidity ?? 0,
      });
      if (map.temperature !== undefined) latest.temperature = map.temperature;
      if (map.humidity !== undefined) latest.humidity = map.humidity;
    }
  });

  // CALCULATE INSIGHT DELTAS
  const ONE_HOUR_MS = 60 * 60 * 1000;

  if (env.length > 0 && latest.temperature !== undefined && latest.humidity !== undefined) {
    const currentTimestamp = env[env.length - 1].timestamp;
    const targetTime = currentTimestamp - ONE_HOUR_MS;
    // Find the closest log entry matching 1 hour ago
    const historicalPoint = env.find((p) => p.timestamp >= targetTime) || env[0];

    deltas.temperature = latest.temperature - historicalPoint.temperature;
    deltas.humidity = latest.humidity - historicalPoint.humidity;
  }

  if (air.length > 0 && latest.P2 !== undefined) {
    const currentTimestamp = air[air.length - 1].timestamp;
    const targetTime = currentTimestamp - ONE_HOUR_MS;
    const historicalPoint = air.find((p) => p.timestamp >= targetTime) || air[0];

    deltas.P2 = latest.P2 - historicalPoint.P2;
  }

  return {
    air,
    env,
    latest,
    deltas,
    softwareVersion: version,
    totalReadings: raw.length,
  };
}

export function getAqiCategory(pm25?: number): { label: string; tone: string } {
  if (pm25 === undefined) return { label: "—", tone: "text-muted-foreground" };
  if (pm25 <= 12) return { label: "Good", tone: "text-emerald-600" };
  if (pm25 <= 35) return { label: "Moderate", tone: "text-yellow-600" };
  if (pm25 <= 55) return { label: "Unhealthy (SG)", tone: "text-orange-600" };
  if (pm25 <= 150) return { label: "Unhealthy", tone: "text-red-600" };
  return { label: "Hazardous", tone: "text-purple-700" };
}
