import { createAuthClient } from "better-auth/react"
export const authClient = createAuthClient()

export const signinGoogle = async () => {
  return await authClient.signIn.social({
    provider: "google",
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    errorCallbackURL: '/error-login',
    newUserCallbackURL: '/welcome',
  });
};