import type { User } from '@ems/database'

/**
 * User repository interface
 * Defines the contract for user data access
 */
export interface UserRepository {
    findByUsername(username: string): Promise<User | null>
    findById(id: string): Promise<User | null>
}
