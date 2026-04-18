import { signupSuccessLoader } from '@ems/domain-frontend-auth/server/loaders/signup'

/** @type {import('./$types.js').PageServerLoad} */
export const load = async () => {
    return await signupSuccessLoader()
}
