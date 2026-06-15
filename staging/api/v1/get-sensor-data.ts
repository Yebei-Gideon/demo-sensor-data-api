import { neon } from '@neondatabase/serverless';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { env } from 'bun';

const sql = neon(env.STAGING_DATABASE_URL as string);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { type, limit = '20' } = req.query;

  try {
    const data = await sql`
      SELECT * FROM sensor_logs
      WHERE sensor_type = ${String(type)}
      ORDER BY created_at DESC
      LIMIT ${parseInt(limit as string)}
    `;

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch sensor data' });
  }
}
