import { useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { signinGoogle } from "../lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import primaryLogo from "/logos/primary-white.avif";

export const Route = createFileRoute("/login")({
  beforeLoad: ({ context }) => {
    if (context.userSession?.session) {
      throw redirect({ to: "/" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-blue-950 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col items-center justify-center gap-6">
        {/* The largest thing on screen, so it's fetched first. Its size is set so nothing shifts as it loads. */}
        <img
          src={primaryLogo}
          width={800}
          height={148}
          fetchPriority="high"
          alt="Murray State University"
          className="h-auto w-auto"
        />
        <span className="font-bold text-white dark:text-white">
          COBIS Tool (v{import.meta.env.VITE_APP_VERSION})
        </span>
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Welcome to COBIS</CardTitle>
            <CardDescription>Login with your Murray State Account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <Button variant="outline" className="w-full" onClick={signinGoogle}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="mr-2 h-5 w-5"
                  >
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Login with Google
                </Button>
                {import.meta.env.DEV && <DevLoginButton />}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/** Signs in as the seeded dev user. Only rendered in development. */
function DevLoginButton() {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async () => {
    setIsSigningIn(true);
    setError(null);
    try {
      const response = await fetch("/api/dev-login", { method: "POST" });
      if (!response.ok) throw new Error(`The server answered ${response.status}`);
      window.location.assign("/");
    } catch (cause) {
      // Without this the button looked like it did nothing, for example when the database is down
      setError(cause instanceof Error ? cause.message : "Something went wrong");
      setIsSigningIn(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        className="w-full"
        disabled={isSigningIn}
        onClick={() => void signIn()}
      >
        {isSigningIn && <Spinner />}
        Dev Login (local only)
      </Button>
      {error && (
        <p role="alert" className="text-destructive text-center text-sm">
          Dev login failed: {error}
        </p>
      )}
    </>
  );
}
