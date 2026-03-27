/**
 * User entity
 * @typedef {Object} User
 * @property {string} userId
 * @property {string} username
 * @property {string | null} firstName
 * @property {string | null} lastName
 * @property {string} email
 * @property {string} role
 */
export type User = {
    userId: string
    username: string
    firstName: string | null
    lastName: string | null
    email: string
    role: string
}

/**
 * User response containing the user object
 * @typedef {Object} UserResponse
 * @property {User} user
 */
export type UserResponse = {
    user: User
}
