/**
 * User roles in the system
 */
export type UserRole = 'user' | 'manager' | 'admin'

/**
 * User in the system (mocked)
 */
export interface User {
    /** Unique user identifier */
    id: string
    /** Username for login */
    username: string
    /** Bcrypt hashed password */
    passwordHash: string
    /** User roles */
    roles: UserRole[]
}

/**
 * Refresh token stored in memory
 */
export interface RefreshToken {
    /** Unique token ID (jti) */
    jti: string
    /** User ID this token belongs to */
    userId: string
    /** SHA-256 hash of the token */
    hashedToken: string
    /** Token expiration date */
    expiresAt: Date
    /** Token creation date */
    createdAt: Date
}

/**
 * Access token payload
 */
export interface AccessTokenPayload {
    /** Subject (user ID) */
    sub: string
    /** Username */
    username: string
    /** User roles */
    roles: UserRole[]
    /** Issued at timestamp */
    iat: number
    /** Expiration timestamp */
    exp: number
    /** Token type */
    type: 'access'
}

/**
 * Refresh token payload
 */
export interface RefreshTokenPayload {
    /** Subject (user ID) */
    sub: string
    /** Unique token ID */
    jti: string
    /** Issued at timestamp */
    iat: number
    /** Expiration timestamp */
    exp: number
    /** Token type */
    type: 'refresh'
}

/**
 * Login request body
 */
export interface LoginRequest {
    /** Username */
    username: string
    /** Password */
    password: string
}

/**
 * Login response body
 */
export interface LoginResponse {
    /** JWT access token */
    accessToken: string
    /** JWT refresh token */
    refreshToken: string
    /** Access token lifetime in seconds */
    expiresIn: number
    /** Token type */
    tokenType: 'Bearer'
}

/**
 * Refresh token request body
 */
export interface RefreshRequest {
    /** Refresh token */
    refreshToken: string
}

/**
 * Logout request body
 */
export interface LogoutRequest {
    /** Refresh token to revoke */
    refreshToken: string
}

/**
 * Revoke all tokens request body
 */
export interface RevokeAllRequest {
    /** User ID whose tokens to revoke */
    userId: string
}

/**
 * Current user info response
 */
export interface UserInfoResponse {
    /** User ID */
    userId: string
    /** Username */
    username: string
    /** User roles */
    roles: UserRole[]
}

/**
 * Auth configuration
 */
export interface AuthConfig {
    /** JWT secret key */
    jwtSecret: string
    /** Access token TTL in seconds (default: 900 = 15 min) */
    accessTokenTtl?: number
    /** Refresh token TTL in seconds (default: 604800 = 7 days) */
    refreshTokenTtl?: number
}
