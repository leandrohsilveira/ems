import { describe, it, expect, beforeEach } from 'vitest'
import { userStore, seedUsers } from './user.store.js'

describe('userStore', () => {
    beforeEach(() => {
        seedUsers()
    })

    it('seeds users on init', () => {
        const user = userStore.findByUsername('admin')
        expect(user).toBeTruthy()
        expect(user?.username).toBe('admin')
    })

    it('finds user by username', () => {
        const user = userStore.findByUsername('user')
        expect(user).toBeTruthy()
        expect(user?.username).toBe('user')
    })

    it('finds user by id', () => {
        const adminUser = userStore.findByUsername('admin')
        expect(adminUser).not.toBeNull()
        const found = adminUser ? userStore.findById(adminUser.id) : null
        expect(found).toBeTruthy()
        expect(found?.id).toBe(adminUser?.id)
    })

    it('returns null for non-existent username', () => {
        const user = userStore.findByUsername('nonexistent')
        expect(user).toBeNull()
    })

    it('returns null for non-existent id', () => {
        const user = userStore.findById('non-existent-id')
        expect(user).toBeNull()
    })

    it('validates correct password', async () => {
        const user = userStore.findByUsername('admin')
        expect(user).not.toBeNull()
        const isValid = await userStore.validatePassword(
            /** @type {import('@ems/types-backend-auth').User} */ (user),
            'admin123'
        )
        expect(isValid).toBe(true)
    })

    it('rejects incorrect password', async () => {
        const user = userStore.findByUsername('admin')
        expect(user).not.toBeNull()
        const isValid = await userStore.validatePassword(
            /** @type {import('@ems/types-backend-auth').User} */ (user),
            'wrongpassword'
        )
        expect(isValid).toBe(false)
    })
})
