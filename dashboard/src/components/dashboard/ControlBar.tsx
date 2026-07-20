import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2, Microchip } from 'lucide-react';

interface ControlBarProps {
	currentVersion: string;
	onVersionChange: (version: string) => void;
	devices: string[];
	isStreaming: boolean;
}

export function ControlBar({
	currentVersion,
	onVersionChange,
	devices,
	isStreaming,
}: ControlBarProps) {
	return (
		<div className='flex items-center justify-between p-4 w-full'>
			<div className='flex gap-4 items-center'>
				<Select
					value={currentVersion}
					onValueChange={(val: string | null) => {
						if (val) {
							onVersionChange(val);
						}
					}}>
					<SelectTrigger className='w-[250px]'>
						<Microchip className='h-4 w-4 mr-2' />
						<SelectValue placeholder='Select Device' />
					</SelectTrigger>
					<SelectContent>
						{devices.map((device: string) => (
							<SelectItem key={device} value={device}>
								{device}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Background syncing activity status layout */}
			{isStreaming && (
				<div className='flex items-center text-xs text-muted-foreground animate-pulse gap-1.5 bg-secondary px-3 py-1.5 rounded-full border shadow-sm'>
					<Loader2 className='h-3.5 w-3.5 animate-spin text-primary' />
					Syncing remaining historical logs...
				</div>
			)}
		</div>
	);
}
