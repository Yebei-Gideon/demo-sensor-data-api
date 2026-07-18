import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sensor Dashboard · Real-time Environmental Monitoring" },
      {
        name: "description",
        content:
            "Dashboard visualizing real-time air quality and environmental sensor data.",
      },
      { property: "og:title", content: "Sensor Dashboard" },
      { property: "og:description", content: "Real-time environmental monitoring dashboard." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
      <ThemeProvider defaultTheme="system" storageKey="sensor-dashboard-theme">
        <Dashboard />
        <Toaster richColors position="top-right" />
      </ThemeProvider>
  );
}