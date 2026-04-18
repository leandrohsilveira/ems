import type { ValidationErrorDTO } from '@ems/domain-shared-schema'
import type { FormEnhancerAction } from '@ems/ui'
import type { SignupFormLiterals } from './signup-form.i18n.js'

export interface SignupFormProps {
    literals: SignupFormLiterals
    enhance: FormEnhancerAction
    loginHref: string
    errors?: ValidationErrorDTO
    errorMessage?: string
    action?: string
}
