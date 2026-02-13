/**
 * Database Connection and Utilities
 */

import { Pool, PoolClient } from "pg";
import path from "path";
import dotenv from "dotenv";
import { runMigrations } from "./migrate";

// Load server/.env (db/index.ts is in src/db, so go up two levels to server/)
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

let pool: Pool | null = null;

/**
 * Get or create the database connection pool
 * Returns null if DATABASE_URL is not configured
 */
export function getPool(): Pool | null {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      return null;
    }

    const timeoutMs = Number(process.env.DB_CONNECTION_TIMEOUT_MS) || 30000;
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: timeoutMs,
    });

    pool.on("error", (err) => {
      console.error("Unexpected error on idle client", err);
    });
  }

  return pool;
}

/**
 * Initialize database connection and run migrations
 */
export async function initializeDatabase(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.warn(
      "⚠️  DATABASE_URL not set. Database features will be unavailable."
    );
    return;
  }

  try {
    const testPool = getPool();
    if (!testPool) {
      throw new Error("Failed to create database connection pool");
    }
    await testPool.query("SELECT 1");
    console.log("✅ Database connection established");

    await runMigrations();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("❌ Database initialization failed:", message);
    throw err;
  }
}

/**
 * Close database connection pool
 */
export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log("Database connection pool closed");
  }
}

/**
 * Returns true if the error is due to DB connection (timeout, refused, etc.)
 * Use this to return 503 instead of 500 so the client can show "Database unavailable".
 */
export function isDatabaseConnectionError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  const lower = msg.toLowerCase();
  return (
    lower.includes("connection timeout") ||
    lower.includes("connection terminated") ||
    lower.includes("connection refused") ||
    lower.includes("econnrefused") ||
    lower.includes("etimedout") ||
    lower.includes("connection not available")
  );
}

/**
 * Run a query and return all rows
 */
export async function query<T = unknown>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const dbPool = getPool();
  if (!dbPool) {
    throw new Error(
      "Database connection not available. Check DATABASE_URL in .env"
    );
  }
  const result = await dbPool.query(text, params);
  return result.rows as T[];
}

/**
 * Run a query and return the first row or undefined
 */
export async function queryOne<T = unknown>(
  text: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

/**
 * Get a client from the pool for transactions
 */
export async function getClient(): Promise<PoolClient> {
  const dbPool = getPool();
  if (!dbPool) {
    throw new Error(
      "Database connection not available. Check DATABASE_URL in .env"
    );
  }
  return dbPool.connect();
}
