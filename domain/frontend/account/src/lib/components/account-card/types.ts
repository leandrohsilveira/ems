import type { AccountDTO } from '@ems/domain-shared-account'
import type { AccountCardLiterals } from './account-card.i18n.js'

export interface AccountCardProps {
    account: AccountDTO
    literals: AccountCardLiterals
    editHref: string
    deleteHref: string
    class?: string
    locale?: string
    tabindex?: number
}
