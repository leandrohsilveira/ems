import { i18n } from '@ems/domain-shared-schema'

const defaultLiterals = {
    accountNotFound: 'Account not found',
    accountNotOwned: 'Account does not belong to the user',
    accountAlreadyDeleted: 'Account has already been deleted',
    accountHasTransactions: 'Cannot delete account with existing transactions. Remove all transactions first.'
}

export const accountErrorsI18n = i18n(defaultLiterals, {
    pt_BR: {
        accountNotFound: 'Conta não encontrada',
        accountNotOwned: 'A conta não pertence ao usuário',
        accountAlreadyDeleted: 'A conta já foi excluída',
        accountHasTransactions:
            'Não é possível excluir uma conta com transações existentes. Remova todas as transações primeiro.'
    }
})

/** @exports @typedef {import('@ems/domain-shared-schema').DefaultErrorLiterals & import('@ems/i18n').InferLiterals<typeof accountErrorsI18n>} AccountErrorsLiterals */
