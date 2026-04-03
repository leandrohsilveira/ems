import { fail, redirect } from '@sveltejs/kit'
import { submitSignupAction } from '@ems/domain-frontend-auth/server/actions/signup'

/** @satisfies {import('./$types.js').Actions} */
export const actions = {
    default: async ({ request, locals }) => {
        const formData = await request.formData()

        // Call domain action with raw FormData
        const result = await submitSignupAction({ client: locals.http, form: formData })

        if (result.isSuccess) {
            // Redirect directly on success
            redirect(303, '/signup/success')
        } else {
            // Return errors for form display
            return fail(result.status, {
                errors: result.errors,
                errorMessage: result.errorMessage
            })
        }
    }
}
