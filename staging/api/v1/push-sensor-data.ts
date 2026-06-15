import { neon } from '@neondatabase/serverless';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { env } from 'bun';

// Ensure DATABASE_URL is defined at runtime
const databaseUrl = env.STAGING_DATABASE_URL as string;

// Initialize Neon client
const sql = neon(databaseUrl);

// Define TypeScript interfaces for incoming sensor data
interface SensorDataValue {
  value_type: string;
  value: string | number;
}

// Define the expected structure of the incoming request body
interface IncomingSensorBody {
  software_version?: string;
  sensordatavalues?: SensorDataValue[];
}

/**
 * Handles incoming POST requests with sensor data, validates the payload, determines sensor type, and inserts structured logs into the Neon database. Implements robust error handling and structured logging for observability.
 *
 * @param req - The incoming HTTP request containing sensor data in the body
 * @param res - The HTTP response object
 * @returns A promise resolving to void
 */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const timestamp = new Date().toISOString();
  const requestId = req.headers['x-vercel-id'] || 'local';

  // Structured request log
  console.log(`[${timestamp}] [INFO] [RID:${requestId}] Incoming ${req.method} request to sensor handler`);

  if (req.method !== 'POST') {
    console.warn(`[${timestamp}] [WARN] [RID:${requestId}] Method ${req.method} not allowed`);
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!databaseUrl) {
    console.error(`[${timestamp}] [ERROR] [RID:${requestId}] DATABASE_URL environment variable is missing`);
    res.status(500).json({ error: 'Database configuration missing' });
    return;
  }

  // Type-cast the incoming body safely
  const { software_version, sensordatavalues } = (req.body || {}) as IncomingSensorBody;

  if (!Array.isArray(sensordatavalues) || sensordatavalues.length === 0) {
    console.warn(`[${timestamp}] [WARN] [RID:${requestId}] Validation failed: Missing or empty sensordatavalues payload`);
    res.status(400).json({ error: 'Invalid or missing sensordatavalues array' });
    return;
  }

  // Determine sensor metadata safely
  const firstValueType = sensordatavalues[0]?.value_type;
  const sensorType = (firstValueType === 'P0' || firstValueType === 'P1') ? 'PMS' : 'DHT';

  console.log(`[${timestamp}] [INFO] [RID:${requestId}] Processing logs. Version: ${software_version || 'unknown'}, Type: ${sensorType}, Elements: ${sensordatavalues.length}`);

  try {
    await sql`
      INSERT INTO sensor_logs (software_version, sensor_type, data, created_at)
      VALUES (${software_version || null}, ${sensorType}, ${JSON.stringify(sensordatavalues)}, NOW())
    `;

    console.log(`[${timestamp}] [INFO] [RID:${requestId}] Successfully committed sensor logs to Neon DB`);
    res.status(201).json({ status: 'success', sensorType });
  } catch (error) {
    // Detailed error trace logging
    console.error(`[${timestamp}] [ERROR] [RID:${requestId}] Neon insertion failed:`, error instanceof Error ? error.message : error);
    res.status(500).json({ error: 'Database transaction failed' });
  }
}
