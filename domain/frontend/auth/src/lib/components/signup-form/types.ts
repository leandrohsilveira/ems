import type { ValidationResultDTO } from '@ems/domain-shared-schema'
import type { FormEnhancerAction } from '@ems/ui'
import type { SignupFormLiterals } from './signup-form.i18n.js'

export interface SignupFormProps {
    literals: SignupFormLiterals
    enhance: FormEnhancerAction
    loginHref: string
    errors?: ValidationResultDTO
    errorMessage?: string
    action?: string
}
