import type { ValidationResultDTO } from '@ems/domain-shared-schema'
import type { FormEnhancerAction } from '@ems/ui'
import type { LoginFormLiterals } from './login-form.i18n.js'

export interface LoginFormProps {
    literals: LoginFormLiterals
    enhance: FormEnhancerAction
    signupHref: string
    errors?: ValidationResultDTO
    errorMessage?: string
    action?: string
}
