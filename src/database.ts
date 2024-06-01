import { Pool } from 'pg';
import {POSTGRES_USER, DB_HOST, POSTGRES_DB, POSTGRES_PASSWORD, DB_PORT} from './config'
import logger from './utils/logger';

const pool = new Pool({
  user: POSTGRES_USER,
  host: DB_HOST,
  database: POSTGRES_DB,
  password: POSTGRES_PASSWORD,
  port: Number(DB_PORT),
});

async function initializeDatabase(): Promise<Pool> {
  try {
    await pool.connect();
    logger.info('Connected to the database');
    console.log(POSTGRES_USER)
    console.log(DB_HOST)
    console.log(POSTGRES_DB)
    console.log(POSTGRES_PASSWORD)
    console.log(DB_PORT)

    return pool;
  } catch (err) {
    logger.error('Failed to connect to the database', err);
    throw err;
  }
}

export { pool, initializeDatabase };
