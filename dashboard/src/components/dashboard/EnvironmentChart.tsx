import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Maximize2, Thermometer, Droplets } from "lucide-react";

type Point = { timestamp: number; temperature: number; humidity: number };

const chartConfig = {
  temperature: {
    label: "Temperature",
    color: "#f97316", // Explicit Bright Orange
  },
  humidity: {
    label: "Humidity",
    color: "#0ea5e9", // Explicit Bright Blue
  },
} satisfies ChartConfig;

// Robust Date formatter that handles both numeric and string-based epochs safely
const safeFormatDate = (tick: any, style: 'axis' | 'tooltip' = 'axis') => {
  if (tick === undefined || tick === null) return "—";

  let parsedTick = tick;
  if (typeof tick === "string") {
    parsedTick = parseFloat(tick);
  }

  const date = typeof parsedTick === "number" && parsedTick < 10000000000
      ? new Date(parsedTick * 1000)
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

// Core Area chart extracted for reusability with smooth gradient fills and dual Y-axes
function CoreEnvironmentChart({ data }: { data: Point[] }) {
  return (
      <ChartContainer config={chartConfig} className="h-full w-full">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="humGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
            </linearGradient>
          </defs>
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
              yAxisId="left"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
          />
          <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              dx={10}
          />
          <ChartTooltip
              cursor={{ stroke: "var(--color-border)", strokeWidth: 1 }}
              content={<ChartTooltipContent labelFormatter={(val) => safeFormatDate(val, 'tooltip')} />}
          />
          <Area
              yAxisId="left"
              type="monotone"
              dataKey="temperature"
              stroke="var(--color-temperature)"
              strokeWidth={2}
              fill="url(#tempGrad)"
          />
          <Area
              yAxisId="right"
              type="monotone"
              dataKey="humidity"
              stroke="var(--color-humidity)"
              strokeWidth={2}
              fill="url(#humGrad)"
          />
        </AreaChart>
      </ChartContainer>
  );
}

export function EnvironmentChart({ data }: { data: Point[] }) {
  const [isOpen, setIsOpen] = useState(false);

  const analytics = useMemo(() => {
    if (!data || data.length === 0) return { maxTemp: 0, avgTemp: 0, maxHum: 0, avgHum: 0 };
    let sumTemp = 0;
    let maxTemp = -Infinity;
    let sumHum = 0;
    let maxHum = -Infinity;

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
      <Card className="border-border/50 shadow-sm relative group">
        <CardHeader className="pb-4 flex flex-row items-start justify-between space-y-0">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold">Climate Dynamics</CardTitle>
            <CardDescription>Microclimate ambient metrics from high-precision DHT hardware sensors.</CardDescription>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8 opacity-70 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl w-[92vw]">
              <DialogHeader>
                <DialogTitle>Climate Dynamics Analysis</DialogTitle>
                <DialogDescription>
                  Historical microclimate metrics from hardware sensors.
                </DialogDescription>
              </DialogHeader>

              {/* Analytics Metric Blocks */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-2">
                <div className="rounded-lg border bg-card p-3 shadow-sm">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Thermometer className="w-4 h-4 text-orange-500" /> Peak Temp
                  </div>
                  <div className="text-2xl font-bold">{analytics.maxTemp}°C</div>
                </div>
                <div className="rounded-lg border bg-card p-3 shadow-sm">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Thermometer className="w-4 h-4 text-muted-foreground" /> Avg Temp
                  </div>
                  <div className="text-2xl font-bold">{analytics.avgTemp}°C</div>
                </div>
                <div className="rounded-lg border bg-card p-3 shadow-sm">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Droplets className="w-4 h-4 text-blue-500" /> Peak Hum
                  </div>
                  <div className="text-2xl font-bold">{analytics.maxHum}%</div>
                </div>
                <div className="rounded-lg border bg-card p-3 shadow-sm">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Droplets className="w-4 h-4 text-muted-foreground" /> Avg Hum
                  </div>
                  <div className="text-2xl font-bold">{analytics.avgHum}%</div>
                </div>
              </div>

              <div className="border rounded-lg p-2 sm:p-4 bg-card/30">
                <div className="h-[50vh] w-full">
                  <CoreEnvironmentChart data={data} />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="px-2 sm:p-6">
          <div className="h-72 w-full">
            <CoreEnvironmentChart data={data} />
          </div>
        </CardContent>
      </Card>
  );
}