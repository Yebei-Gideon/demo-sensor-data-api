export interface SensorDataValue {
    value_type: string;
    value: string | number;
}

export interface SensorLog {
    id: number;
    software_version: string | null;
    sensor_type: "PMS" | "DHT";
    data: SensorDataValue[];
    timestamp: string;
}

export interface PaginatedResponse<T> {
    next: string | null;
    previous: string | null;
    count: number;
    results: T[];
}

export interface SensorFetchParams {
    type?: "PMS" | "DHT";
    page?: number;
    limit?: number;
}