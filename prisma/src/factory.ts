import { DatabaseConfig } from "@ems/types-backend-config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "./gen/client.js";

export function createDatabaseClient({ url }: DatabaseConfig): PrismaClient {
  const adapter = new PrismaBetterSqlite3({ url });

  return new PrismaClient({ adapter });
}
