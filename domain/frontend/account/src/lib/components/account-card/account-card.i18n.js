import { i18n } from '@ems/domain-shared-schema'

const defaultLiterals = {
    balanceLabel: 'Balance',
    createdLabel: 'Created',
    bankAccountLabel: 'Bank Account',
    editAriaLabel: 'Edit account',
    deleteAriaLabel: 'Delete account'
}

export const accountCardI18n = i18n(defaultLiterals, {
    pt_BR: {
        balanceLabel: 'Saldo',
        createdLabel: 'Criada em',
        bankAccountLabel: 'Conta Bancária',
        editAriaLabel: 'Editar conta',
        deleteAriaLabel: 'Excluir conta'
    }
})

/** @exports @typedef {import('@ems/i18n').InferLiterals<typeof accountCardI18n>} AccountCardLiterals */
