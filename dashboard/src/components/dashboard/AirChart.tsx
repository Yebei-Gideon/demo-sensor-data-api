import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis, Brush, Legend } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Maximize2, Wind, AlertTriangle } from "lucide-react";
import { safeFormatDate } from "@/lib/utils/formatters";
import { AnalyticsStatCard } from "./AnalyticsStatCard";

type Point = { timestamp: number; P0: number; P1: number; P2: number };

const chartConfig = {
  P0: { label: "PM 1.0", color: "#059669" },
  P1: { label: "PM 10 (Coarse)", color: "#d97706" },
  P2: { label: "PM 2.5 (Fine)", color: "#dc2626" },
} satisfies ChartConfig;

function CoreAirChart({ data, showBrush = false }: { data: Point[], showBrush?: boolean }) {
  return (
    <ChartContainer config={chartConfig} className="h-full w-full text-muted-foreground">
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: showBrush ? 20 : 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
        <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '14px', fontWeight: 500, color: 'currentColor' }} />
        <XAxis dataKey="timestamp" tickFormatter={(tick) => safeFormatDate(tick, 'axis')} tick={{ fontSize: 12, fill: "currentColor", opacity: 0.8 }} tickLine={false} axisLine={false} dy={10} />
        <YAxis tick={{ fontSize: 12, fill: "currentColor", opacity: 0.8 }} tickLine={false} axisLine={false} />
        <ChartTooltip cursor={{ stroke: "hsl(var(--border))", strokeWidth: 2 }} content={<ChartTooltipContent labelFormatter={(val) => safeFormatDate(val, 'tooltip')} />} />
        <ReferenceLine y={35} stroke="var(--color-P1)" strokeWidth={2} strokeDasharray="4 4" label={{ position: 'insideTopLeft', value: 'Threshold (35 µg/m³)', fill: 'currentColor', fontSize: 12, fontWeight: 600, opacity: 0.8 }} />
        <Line type="monotone" dataKey="P0" name="PM 1.0 (Ultrafine)" stroke="var(--color-P0)" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
        <Line type="monotone" dataKey="P1" name="PM 10 (Coarse)" stroke="var(--color-P1)" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
        <Line type="monotone" dataKey="P2" name="PM 2.5 (Fine)" stroke="var(--color-P2)" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
        {showBrush && <Brush dataKey="timestamp" height={30} stroke="hsl(var(--border))" fill="hsl(var(--background))" tickFormatter={(tick) => safeFormatDate(tick, 'axis')} />}
      </LineChart>
    </ChartContainer>
  );
}

export function AirChart({ data }: { data: Point[] }) {
  const [isOpen, setIsOpen] = useState(false);

  const analytics = useMemo(() => {
    if (!data || data.length === 0) return { avgP2: 0, maxP1: 0, breaches: 0 };
    let sumP2 = 0, maxP1 = 0, breaches = 0;

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
    <Card className="border-border/50 shadow-sm relative group focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
      <CardHeader className="pb-4 flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold">Particulate Matter Distribution</CardTitle>
          <CardDescription className="text-sm">Real-time optical laser scattering mass concentration analysis.</CardDescription>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" className="h-9 w-9 opacity-70 hover:opacity-100 transition-opacity" aria-label="Expand Air Quality Chart">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">Particulate Matter In-Depth Analytics</DialogTitle>
              <DialogDescription>Extended real-time particle concentration. Drag the timeline below the chart to zoom and pan.</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4">
              <AnalyticsStatCard
                title="Avg PM2.5"
                value={<>{analytics.avgP2} <span className="text-sm font-normal text-muted-foreground">µg/m³</span></>}
                icon={Wind}
                iconColorClass="text-emerald-600"
              />
              <AnalyticsStatCard
                title="Peak PM10"
                value={<>{analytics.maxP1} <span className="text-sm font-normal text-muted-foreground">µg/m³</span></>}
                icon={Wind}
                iconColorClass="text-amber-600"
              />
              <AnalyticsStatCard
                title="Limit Breaches"
                value={<span className="text-destructive">{analytics.breaches} <span className="text-sm font-normal text-muted-foreground">times</span></span>}
                icon={AlertTriangle}
                iconColorClass="text-red-600"
              />
            </div>

            <div className="border rounded-xl p-4 sm:p-6 bg-card/30">
              <div className="sr-only">Detailed particulate matter chart. The average PM 2.5 concentration is {analytics.avgP2} micrograms per cubic meter, with {analytics.breaches} threshold breaches recorded.</div>
              <div className="h-[50vh] min-h-[400px] w-full" role="graphics-document" aria-label="Expanded Air Quality Chart">
                <CoreAirChart data={data} showBrush={true} />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="px-2 sm:p-6 pt-0">
        <div className="sr-only">Particulate matter chart mapping PM 1.0, PM 2.5, and PM 10 levels over time against a safe threshold of 35.</div>
        <div className="h-[400px] w-full" role="graphics-document" aria-label="Air Quality Data Chart">
          <CoreAirChart data={data} />
        </div>
      </CardContent>
    </Card>
  );
}
