import { useState, useEffect } from "react";
import { Droplets, Thermometer, Wind } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { getAqiCategory, type EnvKey } from "@/lib/sensor-data";
import { useSensorData } from "@/hooks/useSensorData";
import { DashboardHeader } from "./DashboardHeader";
import { MetricCard } from "./MetricCard";
import { EnvironmentChart } from "./EnvironmentChart";
import { AirChart } from "./AirChart";
import { cn } from "@/lib/utils";

export function Dashboard() {
  const [env, setEnv] = useState<EnvKey>("production");
  const {
    data, parsed, error, isLoading, isValidating, mutate,
    endpoint, availableDevices, selectedDevice, setSelectedDevice, refreshInterval
  } = useSensorData(env);

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

        <DashboardHeader
          env={env} setEnv={setEnv} error={error} pulse={pulse}
          refreshInterval={refreshInterval} selectedDevice={selectedDevice}
          setSelectedDevice={setSelectedDevice} availableDevices={availableDevices}
          isValidating={isValidating} isLoading={isLoading} mutate={mutate}
        />

        {parsed && (
          <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-inner">
            <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3.5 px-6">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/80">Active Node</span>
                <span className="text-sm font-semibold text-foreground">{endpoint.label}</span>
                {selectedDevice && (
                  <Badge variant="default" className="font-mono text-[10px] px-1.5 py-0 bg-primary/90">
                    v{selectedDevice}
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

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading && !data ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl border border-border/50 shadow-sm" />
            ))
          ) : parsed ? (
            <>
              <MetricCard
                  title="Ambient Temperature" value={parsed.latest.temperature?.toFixed(1)} unit="°C"
                  icon={Thermometer} accent="temp" hint="Thermal sensor calibration room level"
                  trend={parsed.deltas?.temperature ? (
                    <span className={parsed.deltas.temperature > 0 ? "text-orange-500" : "text-blue-500"}>
                      {parsed.deltas.temperature > 0 ? "↑" : "↓"} {Math.abs(parsed.deltas.temperature).toFixed(1)}°C
                    </span>
                  ) : null}
                />
                <MetricCard
                  title="Relative Humidity" value={parsed.latest.humidity?.toFixed(1)} unit="%"
                  icon={Droplets} accent="humidity" hint="Capacitive relative index"
                  trend={parsed.deltas?.humidity ? (
                    <span className={parsed.deltas.humidity > 0 ? "text-blue-500" : "text-amber-600"}>
                      {parsed.deltas.humidity > 0 ? "↑" : "↓"} {Math.abs(parsed.deltas.humidity).toFixed(0)}%
                    </span>
                  ) : null}
                />
                <MetricCard
                  title="Fine Matter (PM 2.5)" value={parsed.latest.P2} unit="µg/m³"
                  icon={Wind} accent="pm" hint={`Index Status: ${aqi.label}`}
                  trend={parsed.deltas?.P2 ? (
                    <span className={parsed.deltas.P2 > 0 ? "text-destructive font-semibold" : "text-emerald-500 font-semibold"}>
                      {parsed.deltas.P2 > 0 ? "↑" : "↓"} {Math.abs(parsed.deltas.P2)}
                    </span>
                ) : <span className={cn("inline-block w-2 h-2 rounded-full", aqi.tone)}>●</span>}
              />
              <MetricCard
                  title="Coarse Matter (PM 10)" value={parsed.latest.P1} unit="µg/m³"
                  icon={Wind} accent="pm" hint="Inhalable atmospheric particulate concentration"
              />
            </>
          ) : null}
        </section>

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
