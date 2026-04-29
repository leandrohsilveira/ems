import { describe, it, expect } from 'vitest'
import { defaultLanguage } from '@ems/domain-shared-schema'
import { createAccountLoader } from './account-create.js'

describe('createAccountLoader', () => {
    it('returns literals with default locale', async () => {
        const result = await createAccountLoader()

        expect(result.literals).toBeDefined()
        expect(result.literals.title).toBe('Create Account')
        expect(result.literals.subtitle).toBe('Add a new bank account to your ledger')
        expect(result.literals.submitButton).toBe('Create Account')
        expect(result.literals.cancelButton).toBe('Cancel')
    })

    it('returns literals with defaultLanguage', async () => {
        const result = await createAccountLoader({ locale: defaultLanguage })

        expect(result.literals.title).toBe('Create Account')
        expect(result.literals.subtitle).toBe('Add a new bank account to your ledger')
    })

    it('returns literals with pt_BR locale', async () => {
        const result = await createAccountLoader({ locale: 'pt_BR' })

        expect(result.literals.title).toBe('Criar Conta')
        expect(result.literals.subtitle).toBe('Adicione uma nova conta bancária ao seu cadastro')
        expect(result.literals.submitButton).toBe('Criar Conta')
        expect(result.literals.cancelButton).toBe('Cancelar')
    })
})
