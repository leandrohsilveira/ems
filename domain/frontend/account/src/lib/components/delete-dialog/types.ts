import type { FormEnhancerAction } from '@ems/ui'
import type { DeleteDialogLiterals } from './delete-dialog.i18n.js'

export interface DeleteDialogProps {
    open: boolean
    accountName: string
    literals: DeleteDialogLiterals
    enhance: FormEnhancerAction
    cancelHref: string
    class?: string
    errorMessage?: string | null
    loading?: boolean
    action?: string
}
