import { useEffect, useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { Activity, Droplets, Thermometer, Wind, RefreshCw, CircleDot } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ENV_ENDPOINTS,
  parseSensorData,
  getAqiCategory,
  type EnvKey,
} from "@/lib/sensor-data";
import { EnvironmentSwitcher } from "./EnvironmentSwitcher";
import { MetricCard } from "./MetricCard";
import { EnvironmentChart } from "./EnvironmentChart";
import { AirChart } from "./AirChart";
import type { SensorDataType } from "@/types/data";

const refreshInterval = 30000; // 30 seconds

const fetcher = async (url: string): Promise<SensorDataType[]> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
};

export function Dashboard() {
  const [env, setEnv] = useState<EnvKey>("production");
  const endpoint = ENV_ENDPOINTS[env];

  const { data, error, isLoading, isValidating, mutate } = useSWR<SensorDataType[]>(
    endpoint.url,
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus: false,
      shouldRetryOnError: true,
      onError: (err) => {
        toast.error("Failed to fetch sensor data", { description: err?.message });
      },
    },
  );

  const parsed = parseSensorData(data!);
  const aqi = getAqiCategory(parsed.latest.P2);

  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    if (!data) return;
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 800);
    return () => clearTimeout(t);
  }, [data]);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Sensor Dashboard</h1>
              <p className="text-sm text-muted-foreground">Real-time environmental monitoring</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="gap-1.5 font-normal">
              <CircleDot
                className={`h-3 w-3 transition ${error
                    ? "text-destructive"
                    : pulse
                      ? "text-emerald-500 animate-pulse"
                      : "text-emerald-500"
                  }`}
              />
              {error ? "Disconnected" : `Live: ${refreshInterval / 1000}s`}
            </Badge>
            <EnvironmentSwitcher value={env} onChange={setEnv} />
            <Button
              variant="outline"
              size="icon"
              onClick={() => mutate()}
              disabled={isValidating}
              aria-label="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${isValidating ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </header>

        {/* Environment banner */}
        <Card className="mb-6 border-border/60 bg-card/60 backdrop-blur">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div className="flex items-center gap-3">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Environment
              </div>
              <div className="text-base font-medium">{endpoint.label}</div>
              {parsed.softwareVersion && (
                <Badge variant="outline" className="font-mono text-[10px]">
                  {parsed.softwareVersion}
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-muted-foreground">
              <span>
                Readings:{" "}
                <span className="font-medium text-foreground tabular-nums">
                  {parsed.totalReadings}
                </span>
              </span>
              <span>
                Air samples:{" "}
                <span className="font-medium text-foreground tabular-nums">
                  {parsed.air.length}
                </span>
              </span>
              <span>
                Env samples:{" "}
                <span className="font-medium text-foreground tabular-nums">
                  {parsed.env.length}
                </span>
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Metric Cards */}
        <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading && !data ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-30 rounded-xl" />
            ))
          ) : (
            <>
                {/* Standardized delta check on valid parameter keys */}
              <MetricCard
                title="Temperature"
                value={parsed.latest.temperature?.toFixed(1)}
                unit="°C"
                icon={Thermometer}
                accent="temp"
                hint="DHT sensor"
                  trend={
                    parsed.deltas?.temperature !== undefined && parsed.deltas.temperature !== 0 ? (
                      <span className={parsed.deltas.temperature > 0 ? "text-red-500" : "text-blue-500"}>
                        {parsed.deltas.temperature > 0 ? "↑" : "↓"} {Math.abs(parsed.deltas.temperature).toFixed(1)}°C last hr
                      </span>
                    ) : undefined
                  }
              />
              <MetricCard
                title="Humidity"
                value={parsed.latest.humidity?.toFixed(1)}
                unit="%"
                icon={Droplets}
                accent="humidity"
                hint="Relative"
                  trend={
                    parsed.deltas?.humidity !== undefined && parsed.deltas.humidity !== 0 ? (
                      <span className={parsed.deltas.humidity > 0 ? "text-blue-500" : "text-amber-600"}>
                        {parsed.deltas.humidity > 0 ? "↑" : "↓"} {Math.abs(parsed.deltas.humidity).toFixed(0)}% last hr
                      </span>
                    ) : undefined
                  }
              />
              <MetricCard
                title="PM 2.5"
                value={parsed.latest.P2}
                unit="µg/m³"
                icon={Wind}
                accent="pm"
                hint={aqi.label}
                  trend={
                    parsed.deltas?.P2 !== undefined && parsed.deltas.P2 !== 0 ? (
                      <span className={parsed.deltas.P2 > 0 ? "text-red-500" : "text-emerald-500"}>
                        {parsed.deltas.P2 > 0 ? "↑" : "↓"} {Math.abs(parsed.deltas.P2)} last hr
                      </span>
                    ) : <span className={aqi.tone}>●</span>
                  }
              />
              <MetricCard
                title="PM 10"
                value={parsed.latest.P1}
                unit="µg/m³"
                icon={Wind}
                accent="pm"
                hint="Coarse particles"
              />
            </>
          )}
        </section>

        {/* Charts */}
        <section className="grid gap-4 lg:grid-cols-2">
          {isLoading && !data ? (
            <>
              <Skeleton className="h-95 rounded-xl" />
              <Skeleton className="h-95 rounded-xl" />
            </>
          ) : (
            <>
                {/* Only rendering a digestible slice of data history prevents browser frame lag */}
                <EnvironmentChart data={parsed.env.slice(-300)} />
                <AirChart data={parsed.air.slice(-300)} />
            </>
          )}
        </section>

        {error && (
          <Card className="mt-6 border-destructive/40 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-sm text-destructive">Connection error</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Unable to reach the {endpoint.label} endpoint. Retrying automatically…
            </CardContent>
          </Card>
        )}

        <footer className="mt-10 text-center text-xs text-muted-foreground">
          Polling every 30 seconds · {endpoint.url.replace(/^https?:\/\//, "")}
        </footer>
      </div>
    </div>
  );
}
