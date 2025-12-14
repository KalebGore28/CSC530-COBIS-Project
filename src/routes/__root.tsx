import {
    HeadContent,
    Scripts,
    createRootRouteWithContext,
} from '@tanstack/react-router'
import { Suspense } from 'react'
import appCss from '../styles.css?url'
import type { getQueryClient } from '@/providers/queryClient'
import { authQuery } from '@/lib/queries'

// Providers
import { ThemeProvider } from '@/components/provider/theme'
import { SessionProvider } from '@/components/provider/session'

interface RootRouteContext {
    queryClient: ReturnType<typeof getQueryClient>
}

export const Route = createRootRouteWithContext<RootRouteContext>()({
    head: () => ({
        meta: [
            {
                charSet: 'utf-8',
            },
            {
                name: 'viewport',
                content: 'width=device-width, initial-scale=1',
            },
            {
                title: 'COBIS App',
            },
        ],
        links: [
            {
                rel: 'stylesheet',
                href: appCss,
            },
        ],
    }),
    shellComponent: RootDocument,
    beforeLoad: async ({ context }) => {
        const userSession = await context.queryClient.fetchQuery(
            authQuery.user(),
        )
        return { userSession }
    },
})

function RootDocument({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <HeadContent />
            </head>
            <body>
                <SessionProvider>
                    <ThemeProvider>
                        <Suspense fallback={<div>Loading...</div>}>
                            {children}
                        </Suspense>
                    </ThemeProvider>
                </SessionProvider>
                <Scripts />
            </body>
        </html>
    )
}
