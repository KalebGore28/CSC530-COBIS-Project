import { createAuthClient } from "better-auth/client"

export const authClient = createAuthClient({
  baseURL: "http://localhost:4000",
})

export const signinGoogle = async () => {
  const data = await authClient.signIn.social({
    provider: "google",
    callbackURL: "http://localhost:5173",
  });

  return data;
};

export const signout = async () => {
  await authClient.signOut()
};