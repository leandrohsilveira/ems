import { describe, it, expect } from 'vitest'
import { loginLoader } from './login.js'
import { defaultLiterals } from '$lib/components/login-form/login-form.i18n.js'

describe('loginLoader', () => {
    it('returns resolved literals for the default locale', async () => {
        const result = await loginLoader()
        expect(result.literals).toMatchObject(defaultLiterals)
    })

    it('returns resolved literals for a specified locale', async () => {
        const result = await loginLoader({ locale: 'pt_BR' })
        expect(result.literals.title).toBe('Entrar - EMS')
        expect(result.literals.usernameLabel).toBe('Usuário')
    })
})
