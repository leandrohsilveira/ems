import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from './gen/client.js'

type DatabaseConfig = { url: string }

/**
 * Creates a new PrismaClient instance connected to a SQLite database using the Better SQLite3 driver.
 *
 * @param options - The database configuration object
 * @param options.url - The file path or connection URL for the SQLite database
 * @returns A configured {@link PrismaClient} instance
 */
export function createDatabaseClient({ url }: DatabaseConfig): PrismaClient {
    const adapter = new PrismaBetterSqlite3({ url })

    return new PrismaClient({ adapter })
}
