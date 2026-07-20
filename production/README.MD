Here are the `curl` commands to push sample data to your POST endpoint. These test both the PMS (particulate matter) and DHT (temperature/humidity) logic, as well as your new `timestamp` support.

### 1. Push PMS Sensor Data

This payload uses `P1` as the first value type, which your backend will detect and categorize as a `PMS` sensor.

```bash
curl -X POST "http://localhost:3000/v1/push-sensor-data" \
  -H "Content-Type: application/json" \
  -d '{
    "software_version": "v1.2.4-PMS",
    "timestamp": "2026-07-18T14:20:04.029266Z",
    "sensordatavalues": [
      { "value_type": "P0", "value": "5.3" },
      { "value_type": "P1", "value": "8.1" },
      { "value_type": "P2", "value": "11.4" }
    ]
  }'

```

### 2. Push DHT Sensor Data

This payload does not use `P0` or `P1` as the first value, so your backend will correctly fall back to categorizing it as a `DHT` sensor.

```bash
curl -X POST "http://localhost:3000/v1/push-sensor-data" \
  -H "Content-Type: application/json" \
  -d '{
    "software_version": "v1.2.4-DHT",
    "timestamp": "2026-07-18T14:25:00.000000Z",
    "sensordatavalues": [
      { "value_type": "temperature", "value": "24.5" },
      { "value_type": "humidity", "value": "60.2" }
    ]
  }'

```

### 3. Push Data Without a Timestamp (Fallback Test)

This tests the logic we added to default to the server's current time if the sensor fails to send a `timestamp` payload.

```bash
curl -X POST "http://localhost:3000/v1/push-sensor-data" \
  -H "Content-Type: application/json" \
  -d '{
    "software_version": "v1.2.4-LEGACY",
    "sensordatavalues": [
      { "value_type": "P1", "value": "15.2" },
      { "value_type": "P2", "value": "18.7" }
    ]
  }'

```