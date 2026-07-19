import { useMemo } from "react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from "recharts";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

import type { SensorLog } from "@/types/sensor";

const chartConfig = {
    temperature: {
        label: "Temperature (°C)",
        color: "hsl(var(--chart-1))",
    },
    humidity: {
        label: "Humidity (%)",
        color: "hsl(var(--chart-2))",
    },
    P1: {
        label: "PM10 (µg/m³)",
        color: "hsl(var(--chart-3))",
    },
    P2: {
        label: "PM2.5 (µg/m³)",
        color: "hsl(var(--chart-4))",
    },
};

export function TelemetryChart({ data }: { data: SensorLog[] }) {
    const chartData = useMemo(() => {
        return [...data].reverse().map((log) => ({
            time: new Date(log.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),

            ...Object.fromEntries(
                log.data.map((m) => [m.value_type, Number(m.value)])
            ),
        }));
    }, [data]);

    return (
        <div className="grid gap-6">
            {/* ================= Climate ================= */}
            <Card>
                <CardHeader>
                    <CardTitle>Climate Analytics (DHT)</CardTitle>
                </CardHeader>

                <CardContent className="h-[320px]">
                    <ChartContainer config={chartConfig} className="h-full w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={chartData}
                                margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient
                                        id="fillTemperature"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="var(--color-temperature)"
                                            stopOpacity={0.35}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="var(--color-temperature)"
                                            stopOpacity={0}
                                        />
                                    </linearGradient>

                                    <linearGradient
                                        id="fillHumidity"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="var(--color-humidity)"
                                            stopOpacity={0.35}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="var(--color-humidity)"
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>

                                <CartesianGrid vertical={false} strokeDasharray="3 3" />

                                <XAxis
                                    dataKey="time"
                                    tickLine={false}
                                    axisLine={false}
                                />

                                <YAxis
                                    yAxisId="left"
                                    tickLine={false}
                                    axisLine={false}
                                />

                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    tickLine={false}
                                    axisLine={false}
                                />

                                <ChartTooltip content={<ChartTooltipContent />} />
                                <ChartLegend content={<ChartLegendContent />} />

                                <Area
                                    yAxisId="left"
                                    type="natural"
                                    dataKey="temperature"
                                    stroke="var(--color-temperature)"
                                    fill="url(#fillTemperature)"
                                    strokeWidth={3}
                                    connectNulls
                                    dot={false}
                                    activeDot={{ r: 6 }}
                                />

                                <Area
                                    yAxisId="right"
                                    type="natural"
                                    dataKey="humidity"
                                    stroke="var(--color-humidity)"
                                    fill="url(#fillHumidity)"
                                    strokeWidth={3}
                                    connectNulls
                                    dot={false}
                                    activeDot={{ r: 6 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* ================= Air Quality ================= */}
            <Card>
                <CardHeader>
                    <CardTitle>Air Quality Analytics (PMS)</CardTitle>
                </CardHeader>

                <CardContent className="h-[320px]">
                    <ChartContainer config={chartConfig} className="h-full w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={chartData}
                                margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient
                                        id="fillP1"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="var(--color-P1)"
                                            stopOpacity={0.35}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="var(--color-P1)"
                                            stopOpacity={0}
                                        />
                                    </linearGradient>

                                    <linearGradient
                                        id="fillP2"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="var(--color-P2)"
                                            stopOpacity={0.35}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="var(--color-P2)"
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>

                                <CartesianGrid vertical={false} strokeDasharray="3 3" />

                                <XAxis
                                    dataKey="time"
                                    tickLine={false}
                                    axisLine={false}
                                />

                                <YAxis
                                    yAxisId="left"
                                    tickLine={false}
                                    axisLine={false}
                                />

                                <ChartTooltip content={<ChartTooltipContent />} />
                                <ChartLegend content={<ChartLegendContent />} />

                                <Area
                                    yAxisId="left"
                                    type="natural"
                                    dataKey="P1"
                                    stroke="var(--color-P1)"
                                    fill="url(#fillP1)"
                                    strokeWidth={3}
                                    connectNulls
                                    dot={false}
                                    activeDot={{ r: 6 }}
                                />

                                <Area
                                    yAxisId="left"
                                    type="natural"
                                    dataKey="P2"
                                    stroke="var(--color-P2)"
                                    fill="url(#fillP2)"
                                    strokeWidth={3}
                                    connectNulls
                                    dot={false}
                                    activeDot={{ r: 6 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    );
}