import { AuthConfig } from './auth.config'
import { DatabaseConfig } from './database.config'

export interface AppConfig {
    auth: AuthConfig
    db: DatabaseConfig
}
