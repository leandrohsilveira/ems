import { requireEnv } from '@ems/domain-shared-schema'

/** @import { EnvObject } from '@ems/domain-shared-schema' */

/**
 * @exports @typedef AuthConfig
 * @property {string} jwtSecret
 * @property {number} accessTokenTTL
 * @property {number} refreshTokenTTL
 * @property {number} refreshTokenMobileTTL
 */

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
