import { AuthConfig } from './auth.config.js'
import { DatabaseConfig } from './database.config.js'

export interface AppConfig {
    auth: AuthConfig
    db: DatabaseConfig
}
