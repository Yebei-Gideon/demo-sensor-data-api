import { Activity, RefreshCw, CircleDot, Cpu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EnvironmentSwitcher } from "./EnvironmentSwitcher";
import { ModeToggle } from "./ModeToggle";
import type { EnvKey } from "@/lib/sensor-data";

interface DashboardHeaderProps {
  env: EnvKey;
  setEnv: (env: EnvKey) => void;
  error: any;
  pulse: boolean;
  refreshInterval: number;
  selectedDevice: string;
  setSelectedDevice: (device: string) => void;
  availableDevices: string[];
  isValidating: boolean;
  isLoading: boolean;
  mutate: () => void;
}

export function DashboardHeader({
  env, setEnv, error, pulse, refreshInterval, selectedDevice,
  setSelectedDevice, availableDevices, isValidating, isLoading, mutate
}: DashboardHeaderProps) {
  return (
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

      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="outline" className="h-9 px-3 gap-2 bg-background shadow-sm">
          <CircleDot className={`h-3 w-3 transition-transform ${error ? "text-destructive" : pulse ? "text-emerald-500 scale-110" : "text-emerald-500"}`} />
          <span className="tabular-nums">{error ? "Offline" : `Live sync: ${refreshInterval / 1000}s`}</span>
        </Badge>

        <EnvironmentSwitcher value={env} onChange={setEnv} />

        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedDevice} onValueChange={setSelectedDevice} disabled={availableDevices.length === 0}>
            <SelectTrigger className="w-48 bg-card text-left">
              <SelectValue placeholder="Locating devices..." />
            </SelectTrigger>
            <SelectContent>
              {availableDevices.map((device) => (
                <SelectItem key={device} value={device}>
                  Device v{device}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ModeToggle />

        <Button
          variant="outline" size="icon" className="h-9 w-9 bg-background shadow-sm"
          onClick={() => mutate()} disabled={isValidating || isLoading} aria-label="Synchronize data node"
        >
          <RefreshCw className={`h-4 w-4 text-muted-foreground ${isValidating ? "animate-spin text-primary" : ""}`} />
        </Button>
      </div>
    </header>
  );
}
