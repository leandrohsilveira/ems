/** @import { AuthConfig, EnvObject } from '@ems/types-backend-config' */

import { requireEnv } from './utils.js'

/**
 * Creates auth configuration from env object (dependency inversion)
 * @param {EnvObject} env - Environment variables object (like process.env)
 * @returns {AuthConfig}
 * @throws {Error} JWT_SECRET environment variable is required
 */
export default function createAuthConfig(env) {
    return {
        jwtSecret: requireEnv(env, 'AUTH_JWT_SECRET'),
        accessTokenTTL: Number(env.AUTH_ACCESS_TOKEN_TTL || '300'),
        refreshTokenTTL: Number(env.AUTH_REFRESH_TOKEN_TTL || '1800'),
        refreshTokenMobileTTL: Number(env.AUTH_REFRESH_TOKEN_MOBILE_TTL || '604800')
    }
}
