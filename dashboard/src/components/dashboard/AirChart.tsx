import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine
} from "recharts";

type Point = { timestamp: number; P0: number; P1: number; P2: number };

export function AirChart({ data }: { data: Point[] }) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Particulate Matter</CardTitle>
        <CardDescription>P0, P1 (PM10), P2 (PM2.5) levels from PMS sensor</CardDescription>
      </CardHeader>
      <CardContent className="h-75 pl-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />

            <ReferenceLine
              y={35}
              stroke="var(--color-yellow-500, #eab308)"
              strokeDasharray="3 3"
              label={{
                position: 'insideTopLeft',
                value: 'Moderate AQI Limit',
                fill: 'var(--color-muted-foreground)',
                fontSize: 10
              }}
            />

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
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
              tickLine={false}
              axisLine={false}
            />

            <Tooltip
              contentStyle={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="P0"
              stroke="var(--color-chart-3)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="P1"
              stroke="var(--color-chart-4)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="P2"
              stroke="var(--color-chart-5)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
