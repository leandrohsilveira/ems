import { i18n } from '@ems/domain-shared-schema'

const defaultCreateLiterals = {
    title: 'Create Account',
    subtitle: 'Add a new bank account to your ledger',
    nameLabel: 'Account Name',
    namePlaceholder: 'e.g. Nubank Checking',
    balanceLabel: 'Initial Balance',
    balancePlaceholder: '0,00',
    submitButton: 'Create Account',
    cancelButton: 'Cancel'
}

export const createAccountFormModalI18n = i18n(defaultCreateLiterals, {
    pt_BR: {
        title: 'Criar Conta',
        subtitle: 'Adicione uma nova conta bancária ao seu cadastro',
        nameLabel: 'Nome da Conta',
        namePlaceholder: 'ex: Nubank Checking',
        balanceLabel: 'Saldo Inicial',
        balancePlaceholder: '0,00',
        submitButton: 'Criar Conta',
        cancelButton: 'Cancelar'
    }
})

const defaultEditLiterals = {
    title: 'Edit Account',
    subtitle: 'Update your bank account details',
    nameLabel: 'Account Name',
    namePlaceholder: 'e.g. Nubank Checking',
    balanceLabel: 'Initial Balance',
    balancePlaceholder: '0,00',
    submitButton: 'Save Changes',
    cancelButton: 'Cancel'
}

export const editAccountFormModalI18n = i18n(defaultEditLiterals, {
    pt_BR: {
        title: 'Editar Conta',
        subtitle: 'Atualize os dados da sua conta bancária',
        nameLabel: 'Nome da Conta',
        namePlaceholder: 'ex: Nubank Checking',
        balanceLabel: 'Saldo Inicial',
        balancePlaceholder: '0,00',
        submitButton: 'Salvar Alterações',
        cancelButton: 'Cancelar'
    }
})

/** @exports @typedef {import('@ems/i18n').InferLiterals<typeof createAccountFormModalI18n>} AccountFormModalLiterals */
