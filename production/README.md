# Schema for Sensor Logs
The `sensor_logs` table in the Neon database has the following schema:

```sql
DROP TABLE IF EXISTS sensor_logs;

CREATE TABLE sensor_logs (
  id SERIAL PRIMARY KEY,
  software_version TEXT,
  sensor_type TEXT, -- Calculated as 'PMS' or 'DHT'
  data JSONB,       -- Stores the sensordatavalues array
  created_at TIMESTAMP DEFAULT NOW()
);
```

# Test requests to push data to production

To test the API endpoint in the production environment, you can use the following `curl` command:

```bash
curl -X POST https://demo-sensor-data-production-api.vercel.app/api/v1/push-sensor-data \
  -H "Content-Type: application/json" \
  -d '{
    "software_version": "NRZ-2020-129",
    "sensordatavalues": [
      {
        "value_type": "P0",
        "value": 4
      },
      {
        "value_type": "P1",
        "value": 5
      },
      {
        "value_type": "P2",
        "value": 5
      }
    ]
  }'
```

```bash
curl -X POST https://demo-sensor-data-production-api.vercel.app/api/v1/push-sensor-data \
  -H "Content-Type: application/json" \
  -d '{
    "software_version": "NRZ-2020-129",
    "sensordatavalues": [
      {
        "value_type": "temperature",
        "value": 26.6
      },
      {
        "value_type": "humidity",
        "value": 53.1
      }
    ]
  }'
```
