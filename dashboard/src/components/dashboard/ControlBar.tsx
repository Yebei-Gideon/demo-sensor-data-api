import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Microchip } from 'lucide-react';

interface ControlBarProps {
	currentParams: { software_version?: string };
	onVersionChange: (version: string) => void;
	devices: string[];
}

export function ControlBar({
	currentParams,
	onVersionChange,
	devices,
}: ControlBarProps) {
	return (
		<div className='flex gap-4 p-4'>
			<Select
				value={
					currentParams.software_version ||
					(devices.length > 0 ? devices[0] : '')
				}
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
	);
}
