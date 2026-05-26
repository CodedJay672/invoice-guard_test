import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";

import {
  createPostgresClient,
  getDatabaseConnectionString,
  type PostgresClient,
} from "./connection.js";
import * as schema from "./schema/index.js";

export type Database = PostgresJsDatabase<typeof schema>;

export function createDatabase(connectionString: string): Database {
  const postgresClient = createPostgresClient({ connectionString });

  return createDatabaseFromClient(postgresClient);
}

export function createDatabaseFromClient(postgresClient: PostgresClient): Database {
  return drizzle(postgresClient, { schema });
}

export function createDatabaseFromEnv(env?: Record<string, string | undefined>): Database {
  return createDatabase(getDatabaseConnectionString(env));
}
