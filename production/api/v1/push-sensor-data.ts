import { neon } from '@neondatabase/serverless';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only accept POST
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Neon connection string will be provided by Vercel Environment Variables
  const sql = neon(process.env.DATABASE_URL!);

  // Accept either a single object or an array of sensor readings
  const payload = Array.isArray(req.body) ? req.body : [req.body];

  try {
    for (const entry of payload) {
      // Insert into Production DB
      await sql`
        INSERT INTO sensor_logs (sensor_id, sensor_type, data, created_at)
        VALUES (${req.headers['x-sensor'] || 'prod-device'},
                ${entry.sensor_type || 'default'},
                ${JSON.stringify(entry.sensordatavalues)},
                NOW())
      `;
    }
    return res.status(201).json({ status: 'success' });
  } catch (error) {
    console.error('Production API Error:', error);
    return res.status(500).json({ error: 'Database transaction failed' });
  }
}
