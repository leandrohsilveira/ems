import type { User } from '@ems/database'

/**
 * User repository interface
 * Defines the contract for user data access
 */
export interface UserRepository {
    /**
     * Find user by username
     * @param {string} username
     * @returns {Promise<User | null>}
     */
    findByUsername(username: string): Promise<User | null>

    /**
     * Find user by ID
     * @param {string} id
     * @returns {Promise<User | null>}
     */
    findById(id: string): Promise<User | null>
}
