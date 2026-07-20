import { neon } from '@neondatabase/serverless';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { env } from 'bun';

// Ensure DATABASE_URL is defined at runtime
const databaseUrl = env.PRODUCTION_DATABASE_URL as string;

// Initialize Neon client
const sql = neon(databaseUrl);

// Define TypeScript interfaces for incoming sensor data
interface SensorDataValue {
  value_type: string;
  value: string | number;
}

interface IncomingSensorBody {
  software_version?: string;
  timestamp?: string; // Newly added to support sensor payload[cite: 28]
  sensordatavalues?: SensorDataValue[];
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const requestTime = new Date().toISOString();
  const requestId = req.headers['x-vercel-id'] || 'local';

  console.log(`[${requestTime}] [INFO] [RID:${requestId}] Incoming ${req.method} request to sensor handler`);

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!databaseUrl) {
    res.status(500).json({ error: 'Database configuration missing' });
    return;
  }

  const { software_version, timestamp, sensordatavalues } = (req.body || {}) as IncomingSensorBody;

  if (!Array.isArray(sensordatavalues) || sensordatavalues.length === 0) {
    res.status(400).json({ error: 'Invalid or missing sensordatavalues array' });
    return;
  }

  const firstValueType = sensordatavalues[0]?.value_type;
  const sensorType = (firstValueType === 'P0' || firstValueType === 'P1') ? 'PMS' : 'DHT';

  // Use sensor's timestamp if available, otherwise fallback to server time
  const recordTimestamp = timestamp || requestTime;

  try {
    await sql`
      INSERT INTO sensor_logs (software_version, sensor_type, data, created_at)
      VALUES (${software_version || null}, ${sensorType}, ${JSON.stringify(sensordatavalues)}, ${recordTimestamp})
    `;

    console.log(`[${requestTime}] [INFO] [RID:${requestId}] Successfully committed sensor logs`);
    res.status(201).json({ status: 'success', sensorType });
  } catch (error) {
    console.error(`[${requestTime}] [ERROR] [RID:${requestId}] Neon insertion failed:`, error);
    res.status(500).json({ error: 'Database transaction failed' });
  }
}