import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_layout/tools/")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/tools/users", params });
  },
});
