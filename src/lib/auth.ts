import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import * as schema from '@/db/schema'
import { getDb } from '@/db'

export const auth = betterAuth({
    session: {
        // For more info: https://www.better-auth.com/docs/guides/optimizing-for-performance
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60, // Cache duration in seconds
        },
        // For more info: https://www.better-auth.com/docs/concepts/session-management
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day (every 1 day the session expiration is updated)
    },
    database: drizzleAdapter(getDb(), {
        provider: 'mysql',
        schema: schema,
    }),
    baseURL: process.env.BETTER_AUTH_URL as string,
    trustedOrigins: [process.env.TRUSTED_ORIGIN as string],
    socialProviders: {
        // This app was only designed to work with Google OAuth even though better-auth supports more.
        // It is not recommended to use another provider, otherwise domain restrictions will not work.
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
    user: {
        additionalFields: {
            mnumber: {
                type: 'string',
                nullAllowed: true,
            },
            isEnabled: {
                type: 'boolean',
                nullAllowed: false,
                defaultValue: false,
            },
            lastLogin: {
                type: 'date',
                nullAllowed: true,
            },
        },
    },
})
