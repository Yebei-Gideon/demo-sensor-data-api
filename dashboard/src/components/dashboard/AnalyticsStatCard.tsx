import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyticsStatCardProps {
  title: string;
  value: React.ReactNode;
  icon: LucideIcon;
  iconColorClass: string;
}

export function AnalyticsStatCard({ title, value, icon: Icon, iconColorClass }: AnalyticsStatCardProps) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm text-foreground/80 mb-2 font-medium">
        <Icon className={cn("w-5 h-5", iconColorClass)} aria-hidden="true" /> {title}
      </div>
      <div className="text-3xl font-bold tracking-tight">{value}</div>
    </div>
  );
}
