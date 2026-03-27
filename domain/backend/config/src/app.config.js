/** @import { AppConfig, EnvObject } from '@ems/types-backend-config' */

import createAuthConfig from './auth.config'
import createDatabaseConfig from './database.config'

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
