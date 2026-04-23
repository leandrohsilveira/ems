import { env } from '$env/dynamic/private'
import { createHttpClient } from '@ems/http'
import { sequence } from '@sveltejs/kit/hooks'

export const handle = sequence(async function httpClient({ event, resolve }) {
    event.locals.http = createHttpClient(event.fetch, {
        baseUrl: env.API_URL,
        request: () => {
            const accessToken = event.cookies.get('accessToken')
            if (!accessToken) return {}
            return {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        }
    })
    return await resolve(event)
})
