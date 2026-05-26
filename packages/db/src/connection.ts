import postgres from "postgres";

export interface DatabaseConnectionOptions {
  connectionString: string;
}

export type PostgresClient = ReturnType<typeof postgres>;

export function getDatabaseConnectionString(
  env: Record<string, string | undefined> = process.env,
): string {
  const connectionString = env["DATABASE_URL"];

  if (!connectionString) {
    throw new Error("DATABASE_URL is required to create a PostgreSQL connection.");
  }

  return connectionString;
}

export function createPostgresClient(options: DatabaseConnectionOptions): PostgresClient {
  if (!options.connectionString) {
    throw new Error("A PostgreSQL connection string is required.");
  }

  return postgres(options.connectionString);
}
