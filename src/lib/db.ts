import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: (process.env.POSTGRES_URL ?? '').includes('localhost') ? false : { rejectUnauthorized: false },
});

export default pool;