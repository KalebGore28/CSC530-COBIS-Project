import { HeadContent, Scripts, createRootRouteWithContext } from '@tanstack/react-router'
import { Suspense } from 'react';
import { Environment, Network, FetchFunction } from "relay-runtime";

// Providers
import { ThemeProvider } from '@/components/provider/theme'
import { SessionProvider } from '@/components/provider/session';
// Workaround for lack of ESM support in react-relay
import pkg from 'react-relay';
const { RelayEnvironmentProvider } = pkg;


import appCss from '../styles.css?url'
import type { QueryClient } from '@tanstack/react-query'

export const fetchGraphQL: FetchFunction = async (operation, variables) => {
  const resp = await fetch(import.meta.env.VITE_GRAPHQL_HTTP_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      doc_id: operation.id, // NOTE: pass md5 hash to the server
      // query: operation.text, // this is now obsolete because text is null
      variables,
    }),
  });
  if (!resp.ok) {
    throw new Error("Response failed.");
  }
  return await resp.json();
};

const environment = new Environment({
  network: Network.create(fetchGraphQL),
});

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
            <RelayEnvironmentProvider environment={environment}>
              <Suspense fallback={<div>Loading...</div>}>
                {children}
              </Suspense>
            </RelayEnvironmentProvider>
          </ThemeProvider>
        </SessionProvider>
        <Scripts />
      </body>
    </html>
  )
}
