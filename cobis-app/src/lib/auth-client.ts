import { createAuthClient } from "better-auth/react"
export const authClient = createAuthClient()

export const signinGoogle = () => {
  return authClient.signIn.social({
    provider: "google",
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  });
};