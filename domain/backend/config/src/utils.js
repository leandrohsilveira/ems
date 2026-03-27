/** @import {EnvObject} from "@ems/types-backend-config" */

/**
 * Requires an environment variable to be present
 * @param {EnvObject} env
 * @param {string} name the name of the env variable to require
 * @returns {string} the env value
 * @throws {Error} ${name} environment variable is required
 */
export function requireEnv(env, name) {
    if (env[name] === null || env[name] === undefined)
        throw new Error(`${name} environment variable is required`)
    return env[name]
}
