import { createMiddleware } from "@tanstack/react-start";
import { loadUser } from "./load-user";
import type { Capability } from "@/types/access-checks";

export const requireCapability = (capability: Capability) =>
  createMiddleware()
    .middleware([loadUser])
    .server(async ({ next, request, context }) => {
      if (!context.capabilities.has(capability)) {
        return {
          response: new Response("Forbidden", { status: 403 }),
          request,
          pathname: new URL(request.url).pathname,
          context,
        };
      }

      return next();
    });
