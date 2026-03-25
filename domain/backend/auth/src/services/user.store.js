import bcrypt from 'bcrypt'
/** @import { User, UserRole } from '@ems/types-backend-auth' */

/**
 * In-memory user store
 * @type {Map<string, User>}
 */
const users = new Map()

/**
 * Seed default test users
 */
export function seedUsers() {
    users.clear()

    /** @type {User[]} */
    const defaultUsers = [
        {
            id: 'usr_001',
            username: 'admin',
            passwordHash: bcrypt.hashSync('admin123', 10),
            roles: /** @type {UserRole[]} */ (['admin'])
        },
        {
            id: 'usr_002',
            username: 'user',
            passwordHash: bcrypt.hashSync('user123', 10),
            roles: /** @type {UserRole[]} */ (['user'])
        },
        {
            id: 'usr_003',
            username: 'manager',
            passwordHash: bcrypt.hashSync('manager123', 10),
            roles: /** @type {UserRole[]} */ (['user', 'manager'])
        }
    ]

    for (const user of defaultUsers) {
        users.set(user.id, user)
    }
}

/**
 * User store interface
 */
export const userStore = {
    /**
     * Find user by username
     * @param {string} username
     * @returns {User|null}
     */
    findByUsername(username) {
        for (const user of users.values()) {
            if (user.username === username) {
                return user
            }
        }
        return null
    },

    /**
     * Find user by ID
     * @param {string} id
     * @returns {User|null}
     */
    findById(id) {
        return users.get(id) || null
    },

    /**
     * Validate user password
     * @param {User} user
     * @param {string} password
     * @returns {Promise<boolean>}
     */
    async validatePassword(user, password) {
        return bcrypt.compare(password, user.passwordHash)
    },

    /**
     * Get all users (for admin purposes)
     * @returns {User[]}
     */
    getAll() {
        return Array.from(users.values())
    }
}

// Seed on module load
seedUsers()
