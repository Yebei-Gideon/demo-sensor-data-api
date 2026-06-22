export type SensorDataType = {
  id: number;
  software_version: string;
  sensor_type: string;
  data: { value_type: string; value: number | string }[];
  created_at: string;
};

export type ParsedAirData = {
  timestamp: number;
  P0: number;
  P1: number;
  P2: number;
};
