import { useEffect, useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { Activity, Droplets, Thermometer, Wind, RefreshCw, CircleDot } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
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
import { ModeToggle } from "./ModeToggle"; // Integrated Mode Toggle Component
import type { SensorDataType } from "@/types/data";
import { cn } from "@/lib/utils";

const refreshInterval = 30000;

const fetcher = async (url: string): Promise<SensorDataType[]> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Data synchronization failed (${res.status})`);
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
          toast.error("Telemetry Link Dropped", { description: err?.message });
        },
      },
  );

  const parsed = data ? parseSensorData(data) : null;
  const aqi = parsed ? getAqiCategory(parsed.latest.P2) : { label: "Analyzing", tone: "text-muted", className: "" };

  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    if (!data) return;
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 800);
    return () => clearTimeout(t);
  }, [data]);

  return (
      <div className="min-h-screen bg-background/40 antialiased selection:bg-primary/10 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">

          {/* Header */}
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-6">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/10">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Environmental Matrix</h1>
                <p className="text-sm text-muted-foreground">High-fidelity environmental diagnostic streaming</p>
              </div>
            </div>

            {/* Action controls flex layout wrap container */}
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="h-9 px-3 gap-2 bg-background shadow-sm">
                <CircleDot className={`h-3 w-3 transition-transform ${error ? "text-destructive" : pulse ? "text-emerald-500 scale-110" : "text-emerald-500"}`} />
                <span className="tabular-nums">{error ? "Offline" : `Live sync: ${refreshInterval / 1000}s`}</span>
              </Badge>

              <EnvironmentSwitcher value={env} onChange={setEnv} />

              {/* Mounted Dropdown Mode Toggle directly in the header container view block */}
              <ModeToggle />

              <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 bg-background shadow-sm"
                  onClick={() => mutate()}
                  disabled={isValidating || isLoading}
                  aria-label="Synchronize data node"
              >
                <RefreshCw className={`h-4 w-4 text-muted-foreground ${isValidating ? "animate-spin text-primary" : ""}`} />
              </Button>
            </div>
          </header>

          {/* Node Metadata Summary Banner */}
          {parsed && (
              <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-inner">
                <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3.5 px-6">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/80">Active Node</span>
                    <span className="text-sm font-semibold text-foreground">{endpoint.label}</span>
                    {parsed.softwareVersion && (
                        <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0">
                          v{parsed.softwareVersion}
                        </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <span>Aggregated Packets:</span>
                      <span className="font-semibold text-foreground tabular-nums">{parsed.totalReadings}</span>
                    </div>
                    <Separator orientation="vertical" className="hidden sm:block h-3" />
                    <div className="flex items-center gap-1.5">
                      <span>Air Matrices:</span>
                      <span className="font-semibold text-foreground tabular-nums">{parsed.air.length}</span>
                    </div>
                    <Separator orientation="vertical" className="hidden sm:block h-3" />
                    <div className="flex items-center gap-1.5">
                      <span>Climate Logs:</span>
                      <span className="font-semibold text-foreground tabular-nums">{parsed.env.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
          )}

          {/* Metric Cards Grid */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading && !data ? (
                Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 rounded-xl border border-border/50 shadow-sm" />
                ))
            ) : parsed ? (
                <>
                  <MetricCard
                      title="Ambient Temperature"
                      value={parsed.latest.temperature?.toFixed(1)}
                      unit="°C"
                      icon={Thermometer}
                      accent="temp"
                      hint="Thermal sensor calibration room level"
                      trend={
                        parsed.deltas?.temperature ? (
                            <span className={parsed.deltas.temperature > 0 ? "text-orange-500" : "text-blue-500"}>
                      {parsed.deltas.temperature > 0 ? "↑" : "↓"} {Math.abs(parsed.deltas.temperature).toFixed(1)}°C
                    </span>
                        ) : null
                      }
                  />
                  <MetricCard
                      title="Relative Humidity"
                      value={parsed.latest.humidity?.toFixed(1)}
                      unit="%"
                      icon={Droplets}
                      accent="humidity"
                      hint="Capacitive relative index"
                      trend={
                        parsed.deltas?.humidity ? (
                            <span className={parsed.deltas.humidity > 0 ? "text-blue-500" : "text-amber-600"}>
                      {parsed.deltas.humidity > 0 ? "↑" : "↓"} {Math.abs(parsed.deltas.humidity).toFixed(0)}%
                    </span>
                        ) : null
                      }
                  />
                  <MetricCard
                      title="Fine Matter (PM 2.5)"
                      value={parsed.latest.P2}
                      unit="µg/m³"
                      icon={Wind}
                      accent="pm"
                      hint={`Index Status: ${aqi.label}`}
                      trend={
                        parsed.deltas?.P2 ? (
                            <span className={parsed.deltas.P2 > 0 ? "text-destructive font-semibold" : "text-emerald-500 font-semibold"}>
                      {parsed.deltas.P2 > 0 ? "↑" : "↓"} {Math.abs(parsed.deltas.P2)}
                    </span>
                        ) : <span className={cn("inline-block w-2 h-2 rounded-full", aqi.tone)}>●</span>
                      }
                  />
                  <MetricCard
                      title="Coarse Matter (PM 10)"
                      value={parsed.latest.P1}
                      unit="µg/m³"
                      icon={Wind}
                      accent="pm"
                      hint="Inhalable atmospheric particulate concentration"
                  />
                </>
            ) : null}
          </section>

          {/* Analytics Time-Series Section */}
          <section className="grid gap-6 lg:grid-cols-2">
            {isLoading && !data ? (
                <>
                  <Skeleton className="h-96 rounded-xl border border-border/50" />
                  <Skeleton className="h-96 rounded-xl border border-border/50" />
                </>
            ) : parsed ? (
                <>
                  <EnvironmentChart data={parsed.env.slice(-300)} />
                  <AirChart data={parsed.air.slice(-300)} />
                </>
            ) : null}
          </section>

          {/* Fallback Connectivity Status */}
          {error && (
              <Card className="border-destructive/30 bg-destructive/5 backdrop-blur-sm shadow-sm transition-all animate-in fade-in duration-300">
                <CardContent className="flex items-center gap-3 py-4 text-sm text-destructive font-medium">
                  <span className="flex h-2 w-2 rounded-full bg-destructive animate-ping" />
                  Telemetry pipeline down to node: {endpoint.label}. Automatic connection cycling active.
                </CardContent>
              </Card>
          )}
        </div>
      </div>
  );
}