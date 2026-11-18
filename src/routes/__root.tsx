import { HeadContent, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { useQueryClient } from "@tanstack/react-query";
import { DbClient } from "@tanstack/react-db";

import appCss from "../styles.css?url";
// Linked on its own rather than imported by styles.css, so replacing styles.css with a new shadcn theme keeps it
import spacingCss from "../spacing.css?url";
import { authQuery } from "@/lib/queries";

// Providers
import { ThemeProvider, themeInitScript } from "@/providers/theme";

interface RootRouteContext {
  queryClient: ReturnType<typeof useQueryClient>;
  dbClient: DbClient;
  getTitle?: () => string;
}

/**
 * Names each page after the deepest route's getTitle (the same one its breadcrumb shows), so tabs,
 * history, and screen readers can tell pages apart, like "Student Lookup | COBIS".
 */
function pageTitle(matches: ReadonlyArray<{ context?: unknown }>) {
  const titleOf = (match: { context?: unknown }) =>
    (match.context as Partial<RootRouteContext> | undefined)?.getTitle;
  const getTitle = titleOf(matches.findLast((match) => titleOf(match)) ?? {});
  return getTitle ? `${getTitle()} | COBIS` : "COBIS";
}

export const Route = createRootRouteWithContext<RootRouteContext>()({
  // Typed by hand, as inferring it from this route's own context is circular
  head: ({ matches }: { matches: ReadonlyArray<{ context?: unknown }> }) => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        // Lets phones scale 1rem with the OS text size setting. Needs the root font size left unset.
        name: "text-scale",
        content: "scale",
      },
      {
        // The page supports both themes, so the browser can pick matching defaults before CSS loads
        name: "color-scheme",
        content: "light dark",
      },
      {
        title: pageTitle(matches),
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
    // The theme script below adds a class to <html> before React hydrates
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
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
