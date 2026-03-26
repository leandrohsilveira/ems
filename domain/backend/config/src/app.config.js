/** @import { AppConfig, EnvObject } from '@ems/types-backend-config' */

import createAuthConfig from './auth.config'

/**
 * Creates app configuration from env object (dependency inversion)
 * @param {EnvObject} env - Environment variables object (like process.env)
 * @returns {AppConfig}
 */
export default function createAppConfig(env) {
    return {
        auth: createAuthConfig(env)
    }
}
