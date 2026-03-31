import type { User, UserCreateInput } from '@ems/database'

/**
 * User repository interface
 * Defines the contract for user data access
 */
export interface UserRepository {
    findByUsername(username: string): Promise<User | null>
    findById(id: string): Promise<User | null>

    // NEW METHODS:
    create(data: UserCreateInput): Promise<User>
    findByEmail(email: string): Promise<User | null>
    findByUsernameOrEmail(username: string, email: string): Promise<User | null>
}
