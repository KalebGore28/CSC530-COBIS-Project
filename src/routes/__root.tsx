import { HeadContent, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { useQueryClient } from "@tanstack/react-query";
import { DbClient } from "@tanstack/react-db";

import appCss from "../styles.css?url";
import spacingCss from "../spacing.css?url";
import { authQuery } from "@/lib/queries";

// Providers
import { ThemeProvider } from "@/providers/theme";

interface RootRouteContext {
  queryClient: ReturnType<typeof useQueryClient>;
  dbClient: DbClient;
  getTitle?: () => string;
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
      {
        rel: "stylesheet",
        href: spacingCss,
      },
    ],
  }),
  shellComponent: RootDocument,
  beforeLoad: async ({ context }) => {
    const userSession = await context.queryClient.query(authQuery.user());
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
        <ThemeProvider>{children}</ThemeProvider>

        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
