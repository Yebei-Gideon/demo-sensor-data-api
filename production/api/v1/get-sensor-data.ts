import { neon } from '@neondatabase/serverless';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { env } from 'bun';

const sql = neon(env.PRODUCTION_DATABASE_URL as string);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { type, limit = '20' } = req.query;

  try {
    let data;
    if (type) {
      // Filtered query
      data = await sql`
        SELECT * FROM sensor_logs
        WHERE sensor_type = ${String(type)}
        ORDER BY created_at DESC
        LIMIT ${parseInt(limit as string)}
      `;
    } else {
      // Return everything if no type is specified
      data = await sql`
        SELECT * FROM sensor_logs
        ORDER BY created_at DESC
        LIMIT ${parseInt(limit as string)}
      `;
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Fetch Error:", error);
    return res.status(500).json({ error: 'Failed to fetch sensor data' });
  }
}
