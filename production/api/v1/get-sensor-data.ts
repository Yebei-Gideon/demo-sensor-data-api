import { neon } from '@neondatabase/serverless';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { env } from 'bun';

const sql = neon(env.PRODUCTION_DATABASE_URL as string);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, limit = '20', page = '1', software_version } = req.query;

  // Pagination Math
  const parsedLimit = parseInt(limit as string, 10) || 20;
  const parsedPage = parseInt(page as string, 10) || 1;
  const offset = (parsedPage - 1) * parsedLimit;

  try {
    let data;
    let countResult;

    // Handle combinations of filters
    if (type && software_version) {
      countResult = await sql`
        SELECT COUNT(*) FROM sensor_logs 
        WHERE sensor_type = ${String(type)} AND software_version = ${String(software_version)}
      `;
      data = await sql`
        SELECT id, software_version, sensor_type, data, created_at as timestamp 
        FROM sensor_logs
        WHERE sensor_type = ${String(type)} AND software_version = ${String(software_version)}
        ORDER BY created_at DESC
        LIMIT ${parsedLimit} OFFSET ${offset}
      `;
    } else if (type) {
      countResult = await sql`
        SELECT COUNT(*) FROM sensor_logs 
        WHERE sensor_type = ${String(type)}
      `;
      data = await sql`
        SELECT id, software_version, sensor_type, data, created_at as timestamp 
        FROM sensor_logs
        WHERE sensor_type = ${String(type)}
        ORDER BY created_at DESC
        LIMIT ${parsedLimit} OFFSET ${offset}
      `;
    } else if (software_version) {
      countResult = await sql`
        SELECT COUNT(*) FROM sensor_logs 
        WHERE software_version = ${String(software_version)}
      `;
      data = await sql`
        SELECT id, software_version, sensor_type, data, created_at as timestamp 
        FROM sensor_logs
        WHERE software_version = ${String(software_version)}
        ORDER BY created_at DESC
        LIMIT ${parsedLimit} OFFSET ${offset}
      `;
    } else {
      countResult = await sql`SELECT COUNT(*) FROM sensor_logs`;
      data = await sql`
        SELECT id, software_version, sensor_type, data, created_at as timestamp 
        FROM sensor_logs
        ORDER BY created_at DESC
        LIMIT ${parsedLimit} OFFSET ${offset}
      `;
    }

    // Postgres COUNT() returns a string (BigInt), so we parse it
    const count = parseInt(countResult[0]!.count, 10);

    // Construct pagination URLs
    const baseUrl = (req.headers['x-forwarded-proto'] || 'http') + '://' + req.headers.host + (req.url?.split('?')[0] || '');

    // Ensure both parameters are persisted in next/previous page links
    const typeParam = type ? `&type=${type}` : '';
    const versionParam = software_version ? `&software_version=${software_version}` : '';
    const queryParams = `${typeParam}${versionParam}`;

    const next = (parsedPage * parsedLimit) < count
        ? `${baseUrl}?page=${parsedPage + 1}&limit=${parsedLimit}${queryParams}`
        : null;

    const previous = parsedPage > 1
        ? `${baseUrl}?page=${parsedPage - 1}&limit=${parsedLimit}${queryParams}`
        : null;

    // Return structured paginated response
    return res.status(200).json({
      next,
      previous,
      count,
      results: data
    });

  } catch (error) {
    console.error("Fetch Error:", error);
    return res.status(500).json({ error: 'Failed to fetch sensor data' });
  }
}