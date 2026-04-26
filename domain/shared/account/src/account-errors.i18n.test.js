import { describe, it, expect } from 'vitest'
import { accountErrorsI18n } from './account-errors.i18n.js'
import { resolve } from '@ems/i18n'

describe('account-errors.i18n', () => {
    it('should resolve english literals by default', () => {
        const literals = resolve('en_US', accountErrorsI18n)
        expect(literals.accountNotFound).toBe('Account not found')
        expect(literals.accountHasTransactions).toBe(
            'Cannot delete account with existing transactions. Remove all transactions first.'
        )
    })

    it('should resolve portuguese literals', () => {
        const literals = resolve('pt_BR', accountErrorsI18n)
        expect(literals.accountNotFound).toBe('Conta não encontrada')
        expect(literals.accountHasTransactions).toBe(
            'Não é possível excluir uma conta com transações existentes. Remova todas as transações primeiro.'
        )
    })

    it('should fall back to english for unsupported locale', () => {
        const literals = resolve('fr_FR', accountErrorsI18n)
        expect(literals.accountNotFound).toBe('Account not found')
    })
})
