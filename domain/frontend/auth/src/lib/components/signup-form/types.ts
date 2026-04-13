import type { ValidationErrorDTO } from '@ems/domain-shared-schema'
import type { FormEnhancerAction } from '@ems/ui'

export interface SignupFormProps {
    enhance: FormEnhancerAction
    loginHref: string
    errors?: ValidationErrorDTO
    errorMessage?: string
    action?: string
}
