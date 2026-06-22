import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Point = { timestamp: number; temperature: number; humidity: number };

export function EnvironmentChart({ data }: { data: Point[] }) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Temperature & Humidity</CardTitle>
        <CardDescription>Live environmental trends from DHT sensors</CardDescription>
      </CardHeader>
      <CardContent className="h-75 pl-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-temp)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--color-temp)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="humGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-humidity)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--color-humidity)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />

            {/* Setup time domain configuration for temporal tracking */}
            <XAxis
              dataKey="timestamp"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(tick) => new Intl.DateTimeFormat(navigator.language, {
                hour: 'numeric',
                minute: 'numeric'
              }).format(tick)}
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              yAxisId="left"
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              labelFormatter={(label) => new Intl.DateTimeFormat(navigator.language, {
                dateStyle: 'short',
                timeStyle: 'short'
              }).format(label)}
              contentStyle={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="temperature"
              name="Temperature (°C)"
              stroke="var(--color-temp)"
              strokeWidth={2}
              fill="url(#tempGrad)"
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="humidity"
              name="Humidity (%)"
              stroke="var(--color-humidity)"
              strokeWidth={2}
              fill="url(#humGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
