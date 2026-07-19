import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Microchip } from "lucide-react";

export function ControlBar({ currentParams, onVersionChange, devices = ["v1.2.4-PMS", "v1.2.4-DHT"] }: any) {
    return (
        <div className="flex gap-4 p-4">
            <Select
                value={currentParams.software_version || devices[0]}
                onValueChange={onVersionChange}
            >
                <SelectTrigger className="w-[200px]">
                    <Microchip className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Select Device" />
                </SelectTrigger>
                <SelectContent>
                    {devices.map((device: string) => (
                        <SelectItem key={device} value={device}>{device}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}