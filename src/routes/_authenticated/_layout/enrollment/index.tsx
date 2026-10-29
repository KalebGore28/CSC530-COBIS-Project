import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_layout/enrollment/")({
  beforeLoad: (context) => {
    throw redirect({ to: "/enrollment/programs", params: context.params });
  },
});
