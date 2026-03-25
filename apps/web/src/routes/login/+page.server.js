/** @type {import('./$types').Actions} */
export const actions = {
    default: async ({ request, cookies }) => {
        const formData = await request.formData()
        const username = formData.get('username')
        const password = formData.get('password')

        if (!username || !password) {
            return { success: false, error: 'Username and password are required' }
        }

        try {
            const response = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            })

            if (!response.ok) {
                const error = await response.json()
                return { success: false, error: error.message || 'Login failed' }
            }

            const tokens = await response.json()

            // Set HTTP-only cookies
            cookies.set('accessToken', tokens.accessToken, {
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: tokens.expiresIn
            })

            cookies.set('refreshToken', tokens.refreshToken, {
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 604800 // 7 days
            })

            return { success: true }
        } catch {
            return { success: false, error: 'Unable to connect to authentication service' }
        }
    }
}

/** @type {import('./$types').PageServerLoad} */
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
