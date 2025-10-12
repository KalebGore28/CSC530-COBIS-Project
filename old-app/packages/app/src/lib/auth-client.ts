// src/utils/authClient.ts
import { createAuthClient } from "better-auth/client";

const API_URL = import.meta.env.VITE_API_URL;            // e.g. http://localhost:4000
const CALLBACK_URL = import.meta.env.VITE_CALLBACK_URL;       // e.g. http://localhost:5173 in dev, your prod URL in prod

export const authClient: ReturnType<typeof createAuthClient> = createAuthClient({ baseURL: API_URL });

export const signinGoogle = () => {
  return authClient.signIn.social({
    provider: "google",
    callbackURL: CALLBACK_URL,
  });
};

export const getSession = async () => {
  return await authClient.getSession();
}

export const signout = async () => {
  await authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        window.location.href = CALLBACK_URL; // Redirect to the callback URL after sign out
      },
    },
  })
};