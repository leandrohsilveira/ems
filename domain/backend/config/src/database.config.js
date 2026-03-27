/** @import { DatabaseConfig, EnvObject } from '@ems/types-backend-config' */

/**
 * Creates auth configuration from env object (dependency inversion)
 * @param {EnvObject} env - Environment variables object (like process.env)
 * @returns {DatabaseConfig}
 */
export default function createDatabaseConfig(env) {
    return {
        url: env.DATABASE_URL || ':memory:'
    }
}
