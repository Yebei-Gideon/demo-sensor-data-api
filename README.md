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

## Test requests to  production

To test the API endpoint in the production environment, you can use the following `curl` command:

```bash
curl -X POST https://demo-sensor-data-api.vercel.app/api/v1/push-sensor-data \
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
curl -X POST https://demo-sensor-data-api.vercel.app/api/v1/push-sensor-data \
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
