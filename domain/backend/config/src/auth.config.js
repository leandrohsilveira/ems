/** @import { AuthConfig, EnvObject } from '@ems/types-backend-config' */

import { requireEnv } from './utils'

/**
 * Creates auth configuration from env object (dependency inversion)
 * @param {EnvObject} env - Environment variables object (like process.env)
 * @returns {AuthConfig}
 * @throws {Error} JWT_SECRET environment variable is required
 */
export default function createAuthConfig(env) {
    return {
        jwtSecret: requireEnv(env, 'AUTH_JWT_SECRET')
    }
}
