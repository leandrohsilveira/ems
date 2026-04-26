import { describe, it, expect } from 'vitest'
import {
    PERMISSIONS,
    ROLES,
    ROLE_PERMISSIONS,
    getPermissionsForRole,
    roleHasPermission,
    getAllPermissions,
    getAllRoles
} from './permissions.js'

describe('Permissions Module', () => {
    describe('PERMISSIONS constant', () => {
        it('should export all permissions as frozen object', () => {
            expect(PERMISSIONS).toBeDefined()
            expect(Object.isFrozen(PERMISSIONS)).toBe(true)

            // Check specific permissions
            expect(PERMISSIONS.AUTH_ME).toBe('auth:me')
            expect(PERMISSIONS.AUTH_REVOKE_ALL).toBe('auth:revoke-all')
            expect(PERMISSIONS.USER_READ).toBe('user:read')
            expect(PERMISSIONS.USER_WRITE).toBe('user:write')
            expect(PERMISSIONS.USER_DELETE).toBe('user:delete')
            expect(PERMISSIONS.ACCOUNT_READ).toBe('account:read')
            expect(PERMISSIONS.ACCOUNT_WRITE).toBe('account:write')
        })

        it('should have all permission values as strings', () => {
            Object.values(PERMISSIONS).forEach((permission) => {
                expect(typeof permission).toBe('string')
                expect(permission).toMatch(/^[a-z]+:[a-z-]+$/)
            })
        })
    })

    describe('ROLES constant', () => {
        it('should export all roles as frozen object', () => {
            expect(ROLES).toBeDefined()
            expect(Object.isFrozen(ROLES)).toBe(true)

            // Check specific roles
            expect(ROLES.USER).toBe('USER')
            expect(ROLES.MANAGER).toBe('MANAGER')
            expect(ROLES.ADMIN).toBe('ADMIN')
        })
    })

    describe('ROLE_PERMISSIONS mapping', () => {
        it('should export role permissions mapping as frozen object', () => {
            expect(ROLE_PERMISSIONS).toBeDefined()
            expect(Object.isFrozen(ROLE_PERMISSIONS)).toBe(true)

            // Check that each role's permissions array is frozen
            Object.values(ROLE_PERMISSIONS).forEach((permissions) => {
                expect(Object.isFrozen(permissions)).toBe(true)
            })
        })

        it('should have correct permissions for USER role', () => {
            const userPermissions = ROLE_PERMISSIONS[ROLES.USER]
            expect(userPermissions).toEqual([
                PERMISSIONS.AUTH_ME,
                PERMISSIONS.ACCOUNT_READ,
                PERMISSIONS.ACCOUNT_WRITE
            ])
        })

        it('should have correct permissions for MANAGER role', () => {
            const managerPermissions = ROLE_PERMISSIONS[ROLES.MANAGER]
            expect(managerPermissions).toEqual([
                PERMISSIONS.AUTH_ME,
                PERMISSIONS.USER_READ,
                PERMISSIONS.USER_WRITE,
                PERMISSIONS.ACCOUNT_READ,
                PERMISSIONS.ACCOUNT_WRITE
            ])
        })

        it('should have correct permissions for ADMIN role', () => {
            const adminPermissions = ROLE_PERMISSIONS[ROLES.ADMIN]
            expect(adminPermissions).toEqual([
                PERMISSIONS.AUTH_ME,
                PERMISSIONS.AUTH_REVOKE_ALL,
                PERMISSIONS.USER_READ,
                PERMISSIONS.USER_WRITE,
                PERMISSIONS.USER_DELETE,
                PERMISSIONS.ACCOUNT_READ,
                PERMISSIONS.ACCOUNT_WRITE
            ])
        })
    })

    describe('getPermissionsForRole', () => {
        it('should return permissions for USER role', () => {
            const permissions = getPermissionsForRole(ROLES.USER)
            expect(permissions).toEqual([
                PERMISSIONS.AUTH_ME,
                PERMISSIONS.ACCOUNT_READ,
                PERMISSIONS.ACCOUNT_WRITE
            ])
        })

        it('should return permissions for MANAGER role', () => {
            const permissions = getPermissionsForRole(ROLES.MANAGER)
            expect(permissions).toEqual([
                PERMISSIONS.AUTH_ME,
                PERMISSIONS.USER_READ,
                PERMISSIONS.USER_WRITE,
                PERMISSIONS.ACCOUNT_READ,
                PERMISSIONS.ACCOUNT_WRITE
            ])
        })

        it('should return permissions for ADMIN role', () => {
            const permissions = getPermissionsForRole(ROLES.ADMIN)
            expect(permissions).toEqual([
                PERMISSIONS.AUTH_ME,
                PERMISSIONS.AUTH_REVOKE_ALL,
                PERMISSIONS.USER_READ,
                PERMISSIONS.USER_WRITE,
                PERMISSIONS.USER_DELETE,
                PERMISSIONS.ACCOUNT_READ,
                PERMISSIONS.ACCOUNT_WRITE
            ])
        })

        it('should throw error for unknown role', () => {
            expect(() => getPermissionsForRole('UNKNOWN_ROLE')).toThrow(
                'Unknown role: UNKNOWN_ROLE'
            )
        })

        it('should return frozen array', () => {
            const permissions = getPermissionsForRole(ROLES.USER)
            expect(Object.isFrozen(permissions)).toBe(true)
        })
    })

    describe('roleHasPermission', () => {
        it('should return true when role has permission', () => {
            expect(roleHasPermission(ROLES.USER, PERMISSIONS.AUTH_ME)).toBe(true)
            expect(roleHasPermission(ROLES.MANAGER, PERMISSIONS.USER_READ)).toBe(true)
            expect(roleHasPermission(ROLES.ADMIN, PERMISSIONS.AUTH_REVOKE_ALL)).toBe(true)
        })

        it('should return false when role does not have permission', () => {
            expect(roleHasPermission(ROLES.USER, PERMISSIONS.USER_READ)).toBe(false)
            expect(roleHasPermission(ROLES.MANAGER, PERMISSIONS.AUTH_REVOKE_ALL)).toBe(false)
            expect(roleHasPermission(ROLES.ADMIN, 'unknown:permission')).toBe(false)
        })

        it('should return false for unknown role', () => {
            expect(roleHasPermission('UNKNOWN_ROLE', PERMISSIONS.AUTH_ME)).toBe(false)
        })
    })

    describe('getAllPermissions', () => {
        it('should return all permissions in the system', () => {
            const allPermissions = getAllPermissions()
            expect(allPermissions).toHaveLength(7)
            expect(allPermissions).toContain(PERMISSIONS.AUTH_ME)
            expect(allPermissions).toContain(PERMISSIONS.AUTH_REVOKE_ALL)
            expect(allPermissions).toContain(PERMISSIONS.USER_READ)
            expect(allPermissions).toContain(PERMISSIONS.USER_WRITE)
            expect(allPermissions).toContain(PERMISSIONS.USER_DELETE)
            expect(allPermissions).toContain(PERMISSIONS.ACCOUNT_READ)
            expect(allPermissions).toContain(PERMISSIONS.ACCOUNT_WRITE)
        })

        it('should return frozen array', () => {
            const allPermissions = getAllPermissions()
            expect(Object.isFrozen(allPermissions)).toBe(true)
        })
    })

    describe('getAllRoles', () => {
        it('should return all roles in the system', () => {
            const allRoles = getAllRoles()
            expect(allRoles).toHaveLength(3)
            expect(allRoles).toContain(ROLES.USER)
            expect(allRoles).toContain(ROLES.MANAGER)
            expect(allRoles).toContain(ROLES.ADMIN)
        })

        it('should return frozen array', () => {
            const allRoles = getAllRoles()
            expect(Object.isFrozen(allRoles)).toBe(true)
        })
    })
})
