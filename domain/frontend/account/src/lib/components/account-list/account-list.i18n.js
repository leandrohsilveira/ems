import { i18n } from '@ems/domain-shared-schema'
import { accountCardI18n } from '../account-card/account-card.i18n.js'

const defaultLiterals = {
    pageTitle: 'Accounts',
    pageSubtitle: 'Manage your bank accounts',
    emptyTitle: 'No accounts yet',
    emptyDescription: 'Create your first account to start tracking your finances.',
    newAccountButton: 'New Account',
    accountList: 'Account list'
}

export const accountListI18n = i18n(
    defaultLiterals,
    {
        pt_BR: {
            pageTitle: 'Contas',
            pageSubtitle: 'Gerencie suas contas bancárias',
            emptyTitle: 'Nenhuma conta ainda',
            emptyDescription: 'Crie sua primeira conta para começar a acompanhar suas finanças.',
            newAccountButton: 'Nova Conta',
            accountList: 'Lista de contas'
        }
    },
    {
        accountCard: accountCardI18n
    }
)

/** @exports @typedef {import('@ems/i18n').InferLiterals<typeof accountListI18n>} AccountListLiterals */
