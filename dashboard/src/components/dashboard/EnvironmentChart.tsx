import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Brush, Legend } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Maximize2, Thermometer, Droplets } from "lucide-react";
import { safeFormatDate } from "@/lib/utils/formatters";
import { AnalyticsStatCard } from "./AnalyticsStatCard";

type Point = { timestamp: number; temperature: number; humidity: number };

const chartConfig = {
  temperature: { label: "Temperature", color: "#ea580c" },
  humidity: { label: "Humidity", color: "#0284c7" },
} satisfies ChartConfig;

function CoreEnvironmentChart({ data, showBrush = false }: { data: Point[], showBrush?: boolean }) {
  return (
    <ChartContainer config={chartConfig} className="h-full w-full text-muted-foreground">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: showBrush ? 20 : 0 }}>
        <defs>
          <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-temperature)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="var(--color-temperature)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="humGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-humidity)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="var(--color-humidity)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
        <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '14px', fontWeight: 500, color: 'currentColor' }} />
        <XAxis dataKey="timestamp" tickFormatter={(tick) => safeFormatDate(tick, 'axis')} tick={{ fontSize: 12, fill: "currentColor", opacity: 0.8 }} tickLine={false} axisLine={false} dy={10} />
        <YAxis yAxisId="left" tick={{ fontSize: 12, fill: "currentColor", opacity: 0.8 }} tickLine={false} axisLine={false} />
        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: "currentColor", opacity: 0.8 }} tickLine={false} axisLine={false} dx={10} />
        <ChartTooltip cursor={{ stroke: "hsl(var(--border))", strokeWidth: 2 }} content={<ChartTooltipContent labelFormatter={(val) => safeFormatDate(val, 'tooltip')} />} />
        <Area yAxisId="left" type="monotone" dataKey="temperature" name="Temperature (°C)" stroke="var(--color-temperature)" strokeWidth={3} fill="url(#tempGrad)" activeDot={{ r: 6, strokeWidth: 0 }} />
        <Area yAxisId="right" type="monotone" dataKey="humidity" name="Relative Humidity (%)" stroke="var(--color-humidity)" strokeWidth={3} fill="url(#humGrad)" activeDot={{ r: 6, strokeWidth: 0 }} />
        {showBrush && <Brush dataKey="timestamp" height={30} stroke="hsl(var(--border))" fill="hsl(var(--background))" tickFormatter={(tick) => safeFormatDate(tick, 'axis')} />}
      </AreaChart>
    </ChartContainer>
  );
}

export function EnvironmentChart({ data }: { data: Point[] }) {
  const [isOpen, setIsOpen] = useState(false);

  const analytics = useMemo(() => {
    if (!data || data.length === 0) return { maxTemp: 0, avgTemp: 0, maxHum: 0, avgHum: 0 };
    let sumTemp = 0, maxTemp = -Infinity, sumHum = 0, maxHum = -Infinity;

    data.forEach(p => {
      sumTemp += p.temperature;
      if (p.temperature > maxTemp) maxTemp = p.temperature;
      sumHum += p.humidity;
      if (p.humidity > maxHum) maxHum = p.humidity;
    });

    return {
      maxTemp: maxTemp === -Infinity ? 0 : Math.round(maxTemp * 10) / 10,
      avgTemp: Math.round((sumTemp / data.length) * 10) / 10,
      maxHum: maxHum === -Infinity ? 0 : Math.round(maxHum * 10) / 10,
      avgHum: Math.round((sumHum / data.length) * 10) / 10,
    };
  }, [data]);

  return (
    <Card className="border-border/50 shadow-sm relative group focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
      <CardHeader className="pb-4 flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold">Climate Dynamics</CardTitle>
          <CardDescription className="text-sm">Microclimate ambient metrics from high-precision DHT hardware sensors.</CardDescription>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" className="h-9 w-9 opacity-70 hover:opacity-100 transition-opacity" aria-label="Expand Climate Chart">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">Climate Dynamics Analysis</DialogTitle>
              <DialogDescription>Historical microclimate metrics. Drag the timeline below the chart to zoom and pan.</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-4">
              <AnalyticsStatCard title="Peak Temp" value={`${analytics.maxTemp}°C`} icon={Thermometer} iconColorClass="text-orange-600" />
              <AnalyticsStatCard title="Avg Temp" value={`${analytics.avgTemp}°C`} icon={Thermometer} iconColorClass="text-muted-foreground" />
              <AnalyticsStatCard title="Peak Hum" value={`${analytics.maxHum}%`} icon={Droplets} iconColorClass="text-blue-600" />
              <AnalyticsStatCard title="Avg Hum" value={`${analytics.avgHum}%`} icon={Droplets} iconColorClass="text-muted-foreground" />
            </div>

            <div className="border rounded-xl p-4 sm:p-6 bg-card/30">
              <div className="sr-only">Interactive climate chart showing historical temperature averaging {analytics.avgTemp} degrees and humidity averaging {analytics.avgHum} percent.</div>
              <div className="h-[50vh] min-h-[400px] w-full" role="graphics-document" aria-label="Expanded Climate Data Chart">
                <CoreEnvironmentChart data={data} showBrush={true} />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="px-2 sm:p-6 pt-0">
        <div className="sr-only">Climate dynamics chart tracking temperature and humidity.</div>
        <div className="h-[400px] w-full" role="graphics-document" aria-label="Climate Data Chart">
          <CoreEnvironmentChart data={data} />
        </div>
      </CardContent>
    </Card>
  );
}
