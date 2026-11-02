import { createAuthClient } from "better-auth/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { authQuery } from "./queries";

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

  return { userSession, isAuthenticated: !!userSession };
};
