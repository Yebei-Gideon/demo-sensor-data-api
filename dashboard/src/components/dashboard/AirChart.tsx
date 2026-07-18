import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Maximize2, Wind, AlertTriangle } from "lucide-react";

type Point = { timestamp: number; P0: number; P1: number; P2: number };

const chartConfig = {
    P0: { label: "PM 1.0", color: "#10b981" }, // Emerald
    P1: { label: "PM 10 (Coarse)", color: "#f59e0b" }, // Amber
    P2: { label: "PM 2.5 (Fine)", color: "#ef4444" }, // Red
} satisfies ChartConfig;

// Robust Date formatter that handles both numeric and string-based epochs safely
const safeFormatDate = (tick: any, style: 'axis' | 'tooltip' = 'axis') => {
    if (tick === undefined || tick === null) return "—";

    let parsedTick = tick;
    if (typeof tick === "string") {
        parsedTick = parseFloat(tick);
    }

    const date = typeof parsedTick === "number" && parsedTick < 10000000000
        ? new Date(parsedTick * 1000) // Seconds to ms
        : new Date(parsedTick);

    if (isNaN(date.getTime())) return "—";

    if (style === 'axis') {
        return new Intl.DateTimeFormat(navigator.language, {
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    return new Intl.DateTimeFormat(navigator.language, {
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(date);
};

// Extracted core Recharts component to reuse across standard and expanded dialog screens
function CoreAirChart({ data }: { data: Point[] }) {
    return (
        <ChartContainer config={chartConfig} className="h-full w-full">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis
                    dataKey="timestamp"
                    tickFormatter={(tick) => safeFormatDate(tick, 'axis')}
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                />
                <YAxis
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                />
                <ChartTooltip
                    cursor={{ stroke: "var(--color-border)", strokeWidth: 1 }}
                    content={<ChartTooltipContent labelFormatter={(val) => safeFormatDate(val, 'tooltip')} />}
                />
                <ReferenceLine
                    y={35}
                    stroke="#eab308"
                    strokeDasharray="3 3"
                    label={{
                        position: 'insideTopLeft',
                        value: 'PM2.5 Threshold (35 µg/m³)',
                        fill: '#eab308',
                        fontSize: 10,
                        fontWeight: 500
                    }}
                />
                <Line type="monotone" dataKey="P0" stroke="var(--color-P0)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="P1" stroke="var(--color-P1)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="P2" stroke="var(--color-P2)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
        </ChartContainer>
    );
}

export function AirChart({ data }: { data: Point[] }) {
    const [isOpen, setIsOpen] = useState(false);

    // Compute metrics memoized for the dialog panel analytics grid
    const analytics = useMemo(() => {
        if (!data || data.length === 0) return { avgP2: 0, maxP1: 0, breaches: 0 };
        let sumP2 = 0;
        let maxP1 = 0;
        let breaches = 0;

        data.forEach(p => {
            sumP2 += p.P2;
            if (p.P1 > maxP1) maxP1 = p.P1;
            if (p.P2 > 35) breaches++;
        });

        return {
            avgP2: Math.round((sumP2 / data.length) * 10) / 10,
            maxP1: Math.round(maxP1 * 10) / 10,
            breaches
        };
    }, [data]);

    return (
        <Card className="border-border/50 shadow-sm relative group">
            <CardHeader className="pb-4 flex flex-row items-start justify-between space-y-0">
                <div className="space-y-1">
                    <CardTitle className="text-base font-semibold">Particulate Matter Distribution</CardTitle>
                    <CardDescription>Real-time optical laser scattering mass concentration analysis (PM1.0, PM2.5, PM10).</CardDescription>
                </div>

                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="icon" className="h-8 w-8 opacity-70 group-hover:opacity-100 transition-opacity">
                            <Maximize2 className="h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl w-[92vw]">
                        <DialogHeader>
                            <DialogTitle>Particulate Matter In-Depth Analytics</DialogTitle>
                            <DialogDescription>
                                Extended real-time particle concentration mapping logs.
                            </DialogDescription>
                        </DialogHeader>

                        {/* Analytics Metric Blocks */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-2">
                            <div className="rounded-lg border bg-card p-3 shadow-sm">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                    <Wind className="w-4 h-4 text-emerald-500" /> Avg PM2.5
                                </div>
                                <div className="text-2xl font-bold">
                                    {analytics.avgP2} <span className="text-xs font-normal text-muted-foreground">µg/m³</span>
                                </div>
                            </div>
                            <div className="rounded-lg border bg-card p-3 shadow-sm">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                    <Wind className="w-4 h-4 text-amber-500" /> Peak PM10
                                </div>
                                <div className="text-2xl font-bold">
                                    {analytics.maxP1} <span className="text-xs font-normal text-muted-foreground">µg/m³</span>
                                </div>
                            </div>
                            <div className="rounded-lg border bg-card p-3 shadow-sm">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                    <AlertTriangle className="w-4 h-4 text-destructive" /> Limit Breaches
                                </div>
                                <div className="text-2xl font-bold">
                                    {analytics.breaches} <span className="text-xs font-normal text-muted-foreground">times</span>
                                </div>
                            </div>
                        </div>

                        <div className="border rounded-lg p-2 sm:p-4 bg-card/30">
                            <div className="h-[50vh] w-full">
                                <CoreAirChart data={data} />
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent className="px-2 sm:p-6">
                <div className="h-72 w-full">
                    <CoreAirChart data={data} />
                </div>
            </CardContent>
        </Card>
    );
}