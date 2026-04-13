/**
 * @import { EnvObject } from '@ems/domain-shared-schema'
 */

/**
 * @exports @typedef DatabaseConfig
 * @property {string} url
 */

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
