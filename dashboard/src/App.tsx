import { ControlBar } from '@/components/dashboard/ControlBar';
import { EnvSwitcher } from '@/components/dashboard/EnvSwitcher';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { TelemetryChart } from '@/components/dashboard/TelemetryChart';
import { ThemeToggle } from '@/components/dashboard/ThemeToggle';
import { ThemeProvider } from '@/components/theme-provider';
import { useSensorData } from '@/hooks/use-sensor-data';
import { DashboardLayout } from '@/layouts/dashboard-layout';
import { Droplets, Loader2, Thermometer, Wind } from 'lucide-react';

function AppContent() {
	const {
		data,
		devices,
		env,
		setEnv,
		currentVersion,
		setVersion,
		loading,
		isStreaming,
		error,
	} = useSensorData();

	// Linearly extract the absolute newest valid readings from the dynamic stream array
	const getMetric = (type: string) => {
		const logWithMetric = data.find((log) =>
			log.data.some((d) => d.value_type === type),
		);
		return (
			logWithMetric?.data.find((d) => d.value_type === type)?.value ??
			'--'
		);
	};

	return (
		<DashboardLayout
			headerActions={
				<>
					<EnvSwitcher env={env} setEnv={setEnv} />
					<ThemeToggle />
				</>
			}>
			<ControlBar
				currentVersion={currentVersion}
				onVersionChange={setVersion}
				devices={devices}
				isStreaming={isStreaming}
			/>

			{error && (
				<div className='mx-4 my-2 p-4 text-sm bg-destructive/10 border border-destructive/20 text-destructive rounded-lg'>
					{error}
				</div>
			)}

			{loading ? (
				<div className='flex flex-col gap-2 items-center justify-center min-h-[400px] text-muted-foreground'>
					<Loader2 className='h-8 w-8 animate-spin text-primary' />
					<p className='text-sm font-medium'>
						Mounting primary sensor matrix...
					</p>
				</div>
			) : (
				<div className='flex flex-col gap-6'>
					{/* Realtime Aggregated Core Metrics Grid Expanded to 5 items */}
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4'>
						<MetricCard
							title='Temperature'
							value={getMetric('temperature')}
							icon={Thermometer}
							unit='°C'
						/>
						<MetricCard
							title='Humidity'
							value={getMetric('humidity')}
							icon={Droplets}
							unit='%'
						/>
						<MetricCard
							title='PM 1.0'
							value={getMetric('P0')}
							icon={Wind}
							unit='µg/m³'
						/>
						<MetricCard
							title='PM 2.5'
							value={getMetric('P2')}
							icon={Wind}
							unit='µg/m³'
						/>
						<MetricCard
							title='PM 10'
							value={getMetric('P1')}
							icon={Wind}
							unit='µg/m³'
						/>
					</div>

					{/* Charts adjust smoothly as the hook appends historical items */}
					<TelemetryChart data={data} />
				</div>
			)}
		</DashboardLayout>
	);
}

export default function App() {
	return (
		<ThemeProvider defaultTheme='system' storageKey='telemetry-ui-theme'>
			<AppContent />
		</ThemeProvider>
	);
}
