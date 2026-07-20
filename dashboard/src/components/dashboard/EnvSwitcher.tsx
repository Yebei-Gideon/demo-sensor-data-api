import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Server } from "lucide-react";
import type { Environment } from "@/hooks/use-sensor-data";

export function EnvSwitcher({ env, setEnv }: { env: Environment; setEnv: (e: Environment) => void }) {
    return (
        <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-muted-foreground" />
            <Select 
                value={env} 
                onValueChange={(val: string | null) => {
                    if (val) {
                        setEnv(val as Environment);
                    }
                }}
            >
                <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Environment" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}