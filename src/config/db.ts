import mysql2 from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";

// To prevent creating multiple pools in development due to hot reloads
const globalForDb = global as unknown as {
  pool: mysql2.Pool | undefined;
};

const pool =
  globalForDb.pool ??
  mysql2.createPool({
    uri: process.env.DATABASE_URL as string,
    connectionLimit: 20, // Increase limit
    maxIdle: 10,
    idleTimeout: 60000,
    enableKeepAlive: true,
  });

if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

export const db = drizzle(pool);
