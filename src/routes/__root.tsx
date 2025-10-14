import { HeadContent, Scripts, createRootRouteWithContext } from '@tanstack/react-router'
import { Suspense } from 'react';

// Providers
import { ThemeProvider } from '@/components/provider/theme'
import { SessionProvider } from '@/components/provider/session';



import appCss from '../styles.css?url'
import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
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
        title: 'TanStack Start Starter',
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
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {/* <Header /> */}
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
