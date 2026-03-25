import crypto from 'crypto'

/**
 * @typedef {Object} RefreshToken
 * @property {string} jti
 * @property {string} userId
 * @property {string} hashedToken
 * @property {Date} expiresAt
 * @property {Date} createdAt
 */

/**
 * In-memory refresh token store
 * @type {Map<string, RefreshToken>}
 */
const tokens = new Map()

/**
 * Hash token using SHA-256
 * @param {string} token
 * @returns {string}
 */
function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex')
}

/**
 * Clear all tokens (for testing)
 */
export function clearTokens() {
    tokens.clear()
}

/**
 * Token store interface
 */
export const tokenStore = {
    /**
     * Store a refresh token
     * @param {Omit<RefreshToken, 'hashedToken'>} token
     * @param {string} rawToken
     */
    store(token, rawToken) {
        const hashedToken = hashToken(rawToken)
        tokens.set(token.jti, {
            ...token,
            hashedToken
        })
    },

    /**
     * Find token by jti
     * @param {string} jti
     * @returns {RefreshToken|null}
     */
    findByJti(jti) {
        return tokens.get(jti) || null
    },

    /**
     * Verify a raw token against stored hash
     * @param {string} jti
     * @param {string} rawToken
     * @returns {boolean}
     */
    verifyToken(jti, rawToken) {
        const token = tokens.get(jti)
        if (!token) return false
        const hashedInput = hashToken(rawToken)
        return token.hashedToken === hashedInput
    },

    /**
     * Remove token by jti
     * @param {string} jti
     */
    removeByJti(jti) {
        tokens.delete(jti)
    },

    /**
     * Remove all tokens for a user
     * @param {string} userId
     */
    removeAllForUser(userId) {
        for (const [jti, token] of tokens.entries()) {
            if (token.userId === userId) {
                tokens.delete(jti)
            }
        }
    },

    /**
     * Clean up expired tokens
     * @returns {number} Number of tokens removed
     */
    cleanupExpired() {
        const now = new Date()
        let removed = 0
        for (const [jti, token] of tokens.entries()) {
            if (token.expiresAt < now) {
                tokens.delete(jti)
                removed++
            }
        }
        return removed
    },

    /**
     * Get all tokens
     * @returns {RefreshToken[]}
     */
    getAll() {
        return Array.from(tokens.values())
    }
}
