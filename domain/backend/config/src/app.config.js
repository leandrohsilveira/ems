import createAuthConfig from './auth.config.js'
import createDatabaseConfig from './database.config.js'

/**
 * @import { EnvObject } from '@ems/domain-shared-schema'
 * @import { AuthConfig } from './auth.config.js'
 * @import { DatabaseConfig } from './database.config.js'
 */

/**
 * @exports @typedef AppConfig
 * @property {AuthConfig} auth
 * @property {DatabaseConfig} db
 */

/**
 * Creates app configuration from env object (dependency inversion)
 * @param {EnvObject} env - Environment variables object (like process.env)
 * @returns {AppConfig}
 */
export default function createAppConfig(env) {
    return {
        auth: createAuthConfig(env),
        db: createDatabaseConfig(env)
    }
}
