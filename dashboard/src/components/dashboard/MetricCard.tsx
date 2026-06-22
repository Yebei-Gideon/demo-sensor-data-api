import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function MetricCard({
  title,
  value,
  unit,
  icon: Icon,
  accent,
  hint,
  trend,
}: {
  title: string;
  value: string | number | undefined;
  unit?: string;
  icon: LucideIcon;
  accent: "temp" | "humidity" | "pm";
  hint?: string;
  trend?: React.ReactNode;
}) {
  const accentBg = {
    temp: "bg-[color:var(--color-temp)]/10 text-[color:var(--color-temp)]",
    humidity: "bg-[color:var(--color-humidity)]/10 text-[color:var(--color-humidity)]",
    pm: "bg-[color:var(--color-pm)]/10 text-[color:var(--color-pm)]",
  }[accent];

  return (
    <Card className="relative overflow-hidden border-border/60 shadow-sm transition hover:shadow-md">
      <div
        className={cn("absolute inset-x-0 top-0 h-1", {
          "bg-(--color-temp)": accent === "temp",
          "bg-(--color-humidity)": accent === "humidity",
          "bg-(--color-pm)": accent === "pm",
        })}
      />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", accentBg)}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-1">
          <div className="text-3xl font-semibold tracking-tight tabular-nums">{value ?? "—"}</div>
          {unit && <div className="text-sm text-muted-foreground">{unit}</div>}
        </div>
        {(hint || trend) && (
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            {trend}
            {hint && <span>{hint}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
