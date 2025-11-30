import { createRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { broadcastQueryClient } from '@tanstack/query-broadcast-client-experimental'
import { NotFound } from './not-found'
import pkg from '../package.json'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

import { getQueryClient } from '@/providers/queryClient'

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
  })

  // By default, the integration wraps your router with a QueryClientProvider.
  setupRouterSsrQueryIntegration({
    router,
    queryClient,
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
