/** @typedef {Record<string, string | null | undefined>} EnvObject */
/** @import { AppConfig } from '@ems/types-backend-config' */

/**
 * Creates app configuration from env object (dependency inversion)
 * @param {EnvObject} env - Environment variables object (like process.env)
 * @returns {AppConfig}
 * @throws {Error} JWT_SECRET environment variable is required
 */
export default function createAppConfig(env) {
    return {
        jwtSecret: requireEnv('JWT_SECRET')
    }

    /**
     * @param {string} name the name of the env variable to require
     * @returns {string} the env value
     * @throws {Error} ${name} environment variable is required
     */
    function requireEnv(name) {
        if (env[name] === null || env[name] === undefined)
            throw new Error(`${name} environment variable is required`)
        return env[name]
    }
}
