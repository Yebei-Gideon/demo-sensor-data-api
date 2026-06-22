import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ENV_ENDPOINTS, type EnvKey } from "@/lib/sensor-data";
import { Server } from "lucide-react";

export function EnvironmentSwitcher({
  value,
  onChange,
}: {
  value: EnvKey;
  onChange: (v: EnvKey) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Server className="h-4 w-4 text-muted-foreground" />
      <Select value={value} onValueChange={(v) => onChange(v as EnvKey)}>
        <SelectTrigger className="w-45 bg-card">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(ENV_ENDPOINTS) as EnvKey[]).map((k) => (
            <SelectItem key={k} value={k}>
              {ENV_ENDPOINTS[k].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
