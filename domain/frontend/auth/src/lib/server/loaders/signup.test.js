import { describe, it, expect } from 'vitest'
import { signupLoader, signupSuccessLoader } from './signup.js'
import { defaultLiterals as signupFormLiterals } from '$lib/components/signup-form/signup-form.i18n.js'
import { defaultLiterals as signupSuccessLiterals } from '$lib/components/signup-success/signup-success.i18n.js'

describe('signupLoader', () => {
    it('returns resolved literals for the default locale', async () => {
        const result = await signupLoader()
        expect(result.literals).toMatchObject(signupFormLiterals)
    })

    it('returns resolved literals for a specified locale', async () => {
        const result = await signupLoader({ locale: 'pt_BR' })
        expect(result.literals.title).toBe('Criar Conta - EMS')
        expect(result.literals.usernameLabel).toBe('Usuário')
    })
})

describe('signupSuccessLoader', () => {
    it('returns resolved literals for the default locale', async () => {
        const result = await signupSuccessLoader()
        expect(result.literals).toMatchObject(signupSuccessLiterals)
    })

    it('returns resolved literals for a specified locale', async () => {
        const result = await signupSuccessLoader({ locale: 'pt_BR' })
        expect(result.literals.title).toBe('Cadastro Realizado com Sucesso - EMS')
        expect(result.literals.successMessage).toBe('Sua conta foi criada com sucesso.')
    })
})
