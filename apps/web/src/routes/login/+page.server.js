import { fail, redirect } from '@sveltejs/kit'
import { submitLoginAction } from '@ems/domain-frontend-auth/server/actions/login'

/** @satisfies {import('./$types.js').Actions} */
export const actions = {
    default: async ({ request, locals, cookies }) => {
        const formData = await request.formData()

        // Call domain action with raw FormData
        const result = await submitLoginAction({ client: locals.http, form: formData })

        if (result.isSuccess && result.tokens) {
            // Set HTTP-only cookies (BFF responsibility)
            cookies.set('accessToken', result.tokens.accessToken, {
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: result.tokens.expiresIn
            })

            cookies.set('refreshToken', result.tokens.refreshToken, {
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 604800 // 7 days
            })

            // Redirect to dashboard on success
            redirect(303, '/')
        } else {
            // Return errors for form display
            return fail(result.status, {
                errors: result.errors,
                errorMessage: result.errorMessage
            })
        }
    }
}

/** @type {import('./$types.js').PageServerLoad} */
export const load = async ({ cookies }) => {
    const accessToken = cookies.get('accessToken')

    if (accessToken) {
        return {
            isAuthenticated: true
        }
    }

    return {
        isAuthenticated: false
    }
}
