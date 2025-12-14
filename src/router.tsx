import { createRouter } from '@tanstack/react-router'
import { broadcastQueryClient } from '@tanstack/query-broadcast-client-experimental'
import pkg from '../package.json'
import { NotFound } from './not-found'
import { ErrorComponent } from './error'

// Import the generated route tree
import { routeTree } from './routeTree.gen'
import { getQueryClient } from '@/integrations/tanstack-query/provider'

// Create a new router instance
export const getRouter = () => {
    const queryClient = getQueryClient()

    const router = createRouter({
        routeTree,
        context: { queryClient },
        scrollRestoration: true,
        defaultPreload: 'intent',
        defaultPreloadStaleTime: 0,
        defaultNotFoundComponent: () => <NotFound />,
        defaultErrorComponent: ({ error, reset, info }) => (
            <ErrorComponent error={error} reset={reset} info={info} />
        ),
    })

    // Setup broadcasting for queryClient updates across tabs/windows
    if (typeof window !== 'undefined') {
        broadcastQueryClient({
            queryClient,
            broadcastChannel: `${pkg.name}-${pkg.version}-queries`,
        })
    }

    return router
}
