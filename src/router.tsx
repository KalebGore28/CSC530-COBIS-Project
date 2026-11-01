import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { routeTree } from "./routeTree.gen";
import { routerWithDbClient } from "@tanstack/react-router-with-db";
import { DbClient } from "@tanstack/react-db";

import { NotFound } from "./not-found";
import { ErrorComponent } from "./error";

// Create a new router instance
export const getRouter = () => {
  const queryClient = new QueryClient();
  const dbClient = new DbClient({ queryClient });

  const router = createRouter({
    routeTree,
    context: { queryClient, dbClient },
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    defaultNotFoundComponent: () => <NotFound />,
    defaultErrorComponent: ({ error, reset, info }) => (
      <ErrorComponent error={error as any} reset={reset} info={info} />
    ),
  });

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  });

  return routerWithDbClient(router, dbClient);
};
