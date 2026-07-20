import { ControlBar } from '@/components/dashboard/ControlBar';
import { EnvSwitcher } from '@/components/dashboard/EnvSwitcher';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { TelemetryChart } from '@/components/dashboard/TelemetryChart';
import { ThemeToggle } from '@/components/dashboard/ThemeToggle';
import { ThemeProvider } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { useSensorData } from '@/hooks/use-sensor-data';
import { DashboardLayout } from '@/layouts/dashboard-layout';
import {
    ChevronLeft,
    ChevronRight,
    Droplets,
    Thermometer,
    Wind,
} from 'lucide-react';

function AppContent() {
	const {
		data,
		devices, // Dynamic list retrieved directly from backend logs
		env,
		setEnv,
		currentParams,
		setVersion,
		pagination,
		setPage,
		loading,
	} = useSensorData();

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
			{/* Feed dynamic device metrics gathered straight from runtime context */}
			<ControlBar
				currentParams={currentParams}
				onVersionChange={setVersion}
				devices={devices}
			/>

			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
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

			<TelemetryChart data={data} />

			<div className='flex items-center justify-between pt-4'>
				<p className='text-sm text-muted-foreground'>
					Showing page {pagination.currentPage} • {pagination.count}{' '}
					total records
				</p>
				<div className='flex gap-2'>
					<Button
						variant='outline'
						size='sm'
						onClick={() => setPage(pagination.currentPage - 1)}
						disabled={!pagination.previous || loading}>
						<ChevronLeft className='h-4 w-4 mr-2' /> Previous
					</Button>
					<Button
						variant='outline'
						size='sm'
						onClick={() => setPage(pagination.currentPage + 1)}
						disabled={!pagination.next || loading}>
						Next <ChevronRight className='h-4 w-4 ml-2' />
					</Button>
				</div>
			</div>
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
