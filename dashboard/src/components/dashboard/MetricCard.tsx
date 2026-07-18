import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
    title: string;
    value: string | number | undefined;
    unit?: string;
    icon: LucideIcon;
    accent: "temp" | "humidity" | "pm";
    hint?: string;
    trend?: React.ReactNode;
}

export function MetricCard({
                               title,
                               value,
                               unit,
                               icon: Icon,
                               accent,
                               hint,
                               trend,
                           }: MetricCardProps) {
    // Resolved the broken "bg-[margin]" Tailwind utility bug from the original configuration
    const accentClasses = {
        temp: {
            border: "before:bg-orange-500",
            icon: "bg-orange-500/10 text-orange-500",
            glow: "group-hover:bg-orange-500/[0.015]",
        },
        humidity: {
            border: "before:bg-blue-500",
            icon: "bg-blue-500/10 text-blue-500",
            glow: "group-hover:bg-blue-500/[0.015]",
        },
        pm: {
            border: "before:bg-emerald-500",
            icon: "bg-emerald-500/10 text-emerald-500",
            glow: "group-hover:bg-emerald-500/[0.015]",
        },
    }[accent];

    return (
        <Card className={cn(
            "group relative overflow-hidden border-border/50 bg-card transition-all duration-300 ease-in-out hover:shadow-md hover:border-border/80 before:absolute before:inset-x-0 before:top-0 before:h-[3px]",
            accentClasses.border
        )}>
            {/* Ambient subtle backglow container mapped dynamically to sensor type on hover */}
            <div className={cn(
                "absolute inset-0 pointer-events-none transition-colors duration-300 ease-in-out",
                accentClasses.glow
            )} />

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 group-hover:text-muted-foreground transition-colors duration-200">
                    {title}
                </CardTitle>
                <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300 ease-out group-hover:scale-105 group-hover:shadow-sm",
                    accentClasses.icon
                )}>
                    <Icon className="h-4 w-4" />
                </div>
            </CardHeader>
            <CardContent className="space-y-2 relative z-10">
                <div className="flex items-baseline gap-1">
                    <span className={cn(
                        "text-3xl font-bold tracking-tight tabular-nums transition-colors duration-200",
                        value === undefined || value === null ? "text-muted-foreground/40" : "text-foreground"
                    )}>
                        {value ?? "—"}
                    </span>
                    {unit && value !== undefined && value !== null && (
                        <span className="text-sm font-medium text-muted-foreground/70 select-none">
                            {unit}
                        </span>
                    )}
                </div>

                {(hint || trend) && (
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground/80 transition-colors duration-200">
                        {trend && (
                            <div className="flex items-center font-medium">
                                {trend}
                            </div>
                        )}
                        {trend && hint && (
                            <span className="text-muted-foreground/30 select-none" aria-hidden="true">•</span>
                        )}
                        {hint && (
                            <span className="truncate group-hover:text-muted-foreground transition-colors duration-200">
                                {hint}
                            </span>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}