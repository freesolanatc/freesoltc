import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { serverEnv } from "@/lib/env";
import * as schema from "@/lib/db/schema";

let cachedDb: ReturnType<typeof drizzle<typeof schema>> | null = null;

/** Lazily-created Neon connection. Returns null when DATABASE_URL isn't configured, so the
 *  points/referral system can no-op instead of crashing routes that don't need it. */
export function getDb() {
  if (!serverEnv.DATABASE_URL) return null;
  if (!cachedDb) {
    cachedDb = drizzle(neon(serverEnv.DATABASE_URL), { schema });
  }
  return cachedDb;
}
