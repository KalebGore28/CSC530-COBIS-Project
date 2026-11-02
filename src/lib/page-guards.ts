import { redirect } from "@tanstack/react-router";
import type { Capability } from "@/types/access-checks";

// For a route's beforeLoad. The API enforces the same capability, this just keeps users off pages they can't use.
export function requirePageCapability(
  userSession: { capabilities: Set<Capability> } | null | undefined,
  capability: Capability,
) {
  if (!userSession?.capabilities.has(capability)) {
    throw redirect({ to: "/dashboard" });
  }
}
