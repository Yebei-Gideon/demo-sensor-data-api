// src/layouts/dashboard-layout.tsx
export function DashboardLayout({ children, headerActions }: { children: React.ReactNode; headerActions?: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background">
            <header className="border-b px-6 py-4 flex items-center justify-between">
                <h1 className="font-semibold text-lg">Telemetry Dashboard</h1>
                <div className="flex items-center gap-2">
                    {headerActions}
                </div>
            </header>
            <main className="p-6">{children}</main>
        </div>
    );
}