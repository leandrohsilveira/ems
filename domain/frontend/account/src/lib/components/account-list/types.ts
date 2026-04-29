import type { AccountDTO } from '@ems/domain-shared-account'
import type { AccountListLiterals } from './account-list.i18n.js'

export interface AccountListProps {
    accounts: AccountDTO[]
    literals: AccountListLiterals
    createHref: string
    editHref: string
    deleteHref: string
    class?: string
    loading?: boolean
}
