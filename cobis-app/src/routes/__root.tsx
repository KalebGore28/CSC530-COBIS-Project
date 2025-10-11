import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { Suspense } from 'react';
import { ThemeProvider } from '@/components/provider/theme'
import { SessionProvider } from '@/components/provider/session';
import { RelayEnvironmentProvider } from "react-relay";
import { Environment, Network, FetchFunction } from "relay-runtime";
import appCss from '../styles.css?url'
import type { QueryClient } from '@tanstack/react-query'

const fetchGraphQL: FetchFunction = async (request, variables) => {
  const resp = await fetch(import.meta.env.VITE_GRAPHQL_HTTP_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: request.text, variables }),
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
