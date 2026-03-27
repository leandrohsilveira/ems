/**
 * Response containing authentication tokens
 * @typedef {Object} TokenResponse
 * @property {string} accessToken
 * @property {string} refreshToken
 * @property {number} expiresIn
 * @property {string} issuedAt
 * @property {"Bearer"} tokenType
 */
export type TokenResponse = {
    accessToken: string
    refreshToken: string
    expiresIn: number
    issuedAt: string
    tokenType: 'Bearer'
}
