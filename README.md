# Project Structure for Sensor Dashboard

```bash
my-sensor-dashboard/
├── production/            # Vercel Project: "sensor-dashboard-prod"
│   ├── api/               # Vercel Serverless Functions
│   │   └── v1/
│   │       └── push-sensor-data.ts
│   ├── src/               # React Frontend code
│   ├── package.json       # Dependencies for Prod
│   └── vercel.json        # Prod-specific config (optional)
│
├── staging/               # Vercel Project: "sensor-dashboard-staging"
│   ├── api/
│   │   └── v1/
│   │       └── push-sensor-data.ts
│   ├── src/
│   ├── package.json       # Dependencies for Staging
│   └── vercel.json
│
├── dashboard/              # Shared code for both environments
│   ├── components/         # React components
│   ├── utils/              # Utility functions
│   └── hooks/              # Custom React hooks
│
├── .gitignore
├── README.md
```

## Schema for Sensor Logs

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

# API Endpoint: `/v1/push-sensor-data`

This endpoint accepts POST requests with the following JSON payload:

```json
{
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
}
```

OR

```json
{
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
}
```

## Production Endpoint

### Post Sensor Data to Production

[https://demo-sensor-data-production-api.vercel.app/v1/push-sensor-data](https://demo-sensor-data-production-api.vercel.app/v1/push-sensor-data)

### Get Sensor Data from Production

[https://demo-sensor-data-production-api.vercel.app/v1/get-sensor-data](https://demo-sensor-data-production-api.vercel.app/v1/get-sensor-data)


## Staging Endpoint

### Post Sensor Data to Staging

[https://demo-sensor-data-staging-api.vercel.app/v1/push-sensor-data](https://demo-sensor-data-staging-api.vercel.app/v1/push-sensor-data)

### Get Sensor Data from Staging

[https://demo-sensor-data-staging-api.vercel.app/v1/get-sensor-data](https://demo-sensor-data-staging-api.vercel.app/v1/get-sensor-data)

