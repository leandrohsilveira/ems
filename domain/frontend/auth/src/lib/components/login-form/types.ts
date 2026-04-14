import type { ValidationErrorDTO } from '@ems/domain-shared-schema'
import type { FormEnhancerAction } from '@ems/ui'

export interface LoginFormProps {
    enhance: FormEnhancerAction
    signupHref: string
    errors?: ValidationErrorDTO
    errorMessage?: string
    action?: string
}
