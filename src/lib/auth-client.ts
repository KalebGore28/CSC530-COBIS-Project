import { createAuthClient } from "better-auth/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { authQuery } from "./queries";
import type { Capability, DataCategory } from "@/types/access-checks";

export const authClient = createAuthClient({
  fetchOptions: {
    credentials: "include",
  },
});

export const signinGoogle = async () => {
  return await authClient.signIn.social({
    provider: "google",
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    // errorCallbackURL: '/error-login',
    // newUserCallbackURL: '/welcome',
  });
};

export const signOut = async () => {
  await authClient.signOut();
  window.location.assign("/login");
};

export const useAuthentication = () => {
  const { data: userSession } = useSuspenseQuery(authQuery.user());

  return {
    userSession,
    isAuthenticated: !!userSession,
    can: (capability: Capability) => userSession?.capabilities.has(capability) ?? false,
    // Whether the user could ever see this category, for hiding whole columns and cards
    hasCategory: (category: DataCategory) => (userSession?.dataGrants.get(category)?.size ?? 0) > 0,
  };
};
