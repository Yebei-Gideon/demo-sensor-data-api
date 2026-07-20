import { ThemeProvider } from "@/components/theme-provider";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { EnvSwitcher } from "@/components/dashboard/EnvSwitcher";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";
import { ControlBar } from "@/components/dashboard/ControlBar";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { TelemetryChart } from "@/components/dashboard/TelemetryChart";
import { useSensorData } from "@/hooks/use-sensor-data";
import { Thermometer, Droplets, Wind, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

function AppContent() {
    const {
        data,
        env,
        setEnv,
        currentParams,
        setVersion,
        pagination,
        setPage,
        loading
    } = useSensorData();

    // Extract latest metrics from the first record (most recent)
    const latest = data.length > 0 ? data[0] : null;
    const getMetric = (type: string) => latest?.data.find((d) => d.value_type === type)?.value || "--";

    return (
        <DashboardLayout
            headerActions={
                <>
                    <EnvSwitcher env={env} setEnv={setEnv} />
                    <ThemeToggle />
                </>
            }
        >
            <ControlBar
                currentParams={currentParams}
                onVersionChange={setVersion}
                devices={["v1.2.4-PMS", "v1.2.4-DHT"]}
            />

            {/* Updated Aggregated Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title="Temperature" value={getMetric("temperature")} icon={Thermometer} unit="°C" />
                <MetricCard title="Humidity" value={getMetric("humidity")} icon={Droplets} unit="%" />
                <MetricCard title="PM 2.5" value={getMetric("P2")} icon={Wind} unit="µg/m³" />
                <MetricCard title="PM 10" value={getMetric("P1")} icon={Wind} unit="µg/m³" />
            </div>

            <TelemetryChart data={data} />

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-muted-foreground">
                    Showing page {pagination.currentPage} • {pagination.count} total records
                </p>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(pagination.currentPage - 1)}
                        disabled={!pagination.previous || loading}
                    >
                        <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(pagination.currentPage + 1)}
                        disabled={!pagination.next || loading}
                    >
                        Next <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default function App() {
    return (
        <ThemeProvider defaultTheme="system" storageKey="telemetry-ui-theme">
            <AppContent />
        </ThemeProvider>
    );
}