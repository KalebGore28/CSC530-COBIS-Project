import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotFound() {
  const navigate = useNavigate();

  return (
    // Theme colors only: the brand guide rules out custom gradients and off-palette grays
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md space-y-8 text-center">
        {/* Decorative, so screen readers start at the heading that says what happened */}
        <p aria-hidden="true" className="text-muted-foreground text-9xl font-bold select-none">
          404
        </p>

        {/* Message */}
        <div className="space-y-3">
          <h1 className="text-foreground text-3xl font-semibold">Page Not Found</h1>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={() => navigate({ to: "/dashboard" })} size="lg" className="gap-2">
            <Home className="h-4 w-4" />
            Go to Dashboard
          </Button>
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
