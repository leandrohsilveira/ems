/**
 * @import { Role } from '../user/index.js'
 */

/**
 * Permission definitions for the Expense Management System
 *
 * Permissions follow the format: `resource:action`
 * - `auth:me` - View own user information
 * - `auth:revoke-all` - Revoke all user sessions
 * - `user:read` - Read user information
 * - `user:write` - Create/update users
 * - `user:delete` - Delete users
 */

/**
 * All available permissions in the system
 * @type {Readonly<Record<string, string>>}
 */
export const PERMISSIONS = Object.freeze({
    // Authentication permissions
    AUTH_ME: 'auth:me',
    AUTH_REVOKE_ALL: 'auth:revoke-all',

    // User management permissions
    USER_READ: 'user:read',
    USER_WRITE: 'user:write',
    USER_DELETE: 'user:delete'
})

/**
 * Role definitions
 * @type {Readonly<Record<Role, Role>>}
 */
export const ROLES = Object.freeze({
    USER: 'USER',
    MANAGER: 'MANAGER',
    ADMIN: 'ADMIN'
})

/**
 * Role to permissions mapping
 * @type {Readonly<Record<string, readonly string[]>>}
 */
export const ROLE_PERMISSIONS = Object.freeze({
    [ROLES.USER]: Object.freeze([PERMISSIONS.AUTH_ME]),
    [ROLES.MANAGER]: Object.freeze([
        PERMISSIONS.AUTH_ME,
        PERMISSIONS.USER_READ,
        PERMISSIONS.USER_WRITE
    ]),
    [ROLES.ADMIN]: Object.freeze([
        PERMISSIONS.AUTH_ME,
        PERMISSIONS.AUTH_REVOKE_ALL,
        PERMISSIONS.USER_READ,
        PERMISSIONS.USER_WRITE,
        PERMISSIONS.USER_DELETE
    ])
})

/**
 * Get permissions for a specific role
 * @param {string} role - The role to get permissions for
 * @returns {readonly string[]} Array of permissions for the role
 * @throws {Error} If role is not recognized
 */
export function getPermissionsForRole(role) {
    const permissions = ROLE_PERMISSIONS[role]
    if (!permissions) {
        throw new Error(`Unknown role: ${role}`)
    }
    return permissions
}

/**
 * Check if a role has a specific permission
 * @param {string} role - The role to check
 * @param {string} permission - The permission to check for
 * @returns {boolean} True if the role has the permission
 */
export function roleHasPermission(role, permission) {
    try {
        const permissions = getPermissionsForRole(role)
        return permissions.includes(permission)
    } catch {
        return false
    }
}

/**
 * Get all available permissions in the system
 * @returns {readonly string[]} Array of all permissions
 */
export function getAllPermissions() {
    return Object.freeze(Object.values(PERMISSIONS))
}

/**
 * Get all available roles in the system
 * @returns {readonly string[]} Array of all roles
 */
export function getAllRoles() {
    return Object.freeze(Object.values(ROLES))
}
