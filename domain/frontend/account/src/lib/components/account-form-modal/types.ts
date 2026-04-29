import type { AccountDTO } from '@ems/domain-shared-account'
import type { AccountFormModalLiterals } from './account-form-modal.i18n.js'
import type { FormEnhancerAction } from '@ems/ui'
import type { ValidationResultDTO } from '@ems/domain-shared-schema'

export type AccountFormMode = 'create' | 'edit'

export interface AccountFormModalProps {
    open: boolean
    mode: AccountFormMode
    literals: AccountFormModalLiterals
    enhance: FormEnhancerAction
    cancelHref: string
    class?: string
    account?: AccountDTO
    loading?: boolean
    action?: string
    errors?: ValidationResultDTO
    errorMessage?: string | null
    onclose?: () => void
}
