import { HeadContent, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import appCss from "../styles.css?url";
import type { getQueryClient } from "@/integrations/tanstack-query/provider";
import { authQuery } from "@/lib/queries";
import { TanstackQueryProvider } from "@/integrations/tanstack-query/provider";

// Providers
import { ThemeProvider } from "@/providers/theme";

interface RootRouteContext {
  queryClient: ReturnType<typeof getQueryClient>;
}

export const Route = createRootRouteWithContext<RootRouteContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "COBIS App",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
  beforeLoad: async ({ context }) => {
    const userSession = await context.queryClient.fetchQuery(authQuery.user());
    return { userSession };
  },
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="antialiased">
        <TanstackQueryProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </TanstackQueryProvider>
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  );
}
