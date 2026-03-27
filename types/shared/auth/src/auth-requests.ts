/**
 * Login request payload
 * @typedef {Object} LoginRequest
 * @property {string} username
 * @property {string} password
 */
export type LoginRequest = {
    username: string
    password: string
}

/**
 * Token refresh request payload
 * @typedef {Object} RefreshRequest
 * @property {string} refreshToken
 */
export type RefreshRequest = {
    refreshToken: string
}

/**
 * Logout request payload
 * @typedef {Object} LogoutRequest
 * @property {string} refreshToken
 */
export type LogoutRequest = {
    refreshToken: string
}

/**
 * Revoke all sessions request payload
 * @typedef {Object} RevokeAllRequest
 * @property {string} userId
 */
export type RevokeAllRequest = {
    userId: string
}
