import { createAuthClient } from 'better-auth/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { authQuery } from './queries'
import { getRouter } from '@/router'
import { getQueryClient } from '@/integrations/tanstack-query/provider'

export const authClient = createAuthClient({
    fetchOptions: {
        credentials: 'include',
    },
})

export const signinGoogle = async () => {
    return await authClient.signIn.social({
        provider: 'google',
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        // errorCallbackURL: '/error-login',
        // newUserCallbackURL: '/welcome',
    })
}

export const signOut = async () => {
    const queryClient = getQueryClient()
    const router = getRouter()

    await authClient.signOut()
    await queryClient.invalidateQueries()
    router.invalidate()
}

export const useAuthentication = () => {
    const { data: userSession } = useSuspenseQuery(authQuery.user())

    return { userSession, isAuthenticated: !!userSession }
}
