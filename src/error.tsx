import { useNavigate } from "@tanstack/react-router";
import { Check, CircleAlert, Copy, House, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ErrorComponentProps {
  error: Error;
  reset?: () => void;
  info?: { componentStack: string };
}

export function ErrorComponent(props: ErrorComponentProps) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const isDevelopment = import.meta.env.DEV;

  const copyErrorDetails = async () => {
    const errorDetails =
      `Error: ${props.error.message}\n\n` +
      `Stack Trace:\n${props.error.stack || "N/A"}\n\n` +
      `Component Stack:\n${props.info?.componentStack || "N/A"}`;

    try {
      await navigator.clipboard.writeText(errorDetails);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-2xl space-y-8 text-center">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="bg-muted rounded-full p-6">
            <CircleAlert className="text-destructive h-16 w-16" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-3">
          {/* The page's main heading, as the error replaces the page's own <h1> */}
          <h1 className="text-foreground text-3xl font-semibold">Something went wrong</h1>
          <p className="text-muted-foreground">
            We encountered an unexpected error. Please try again or return home.
          </p>
        </div>

        {/* Error Details (Development Only) */}
        {isDevelopment && (
          <div className="border-destructive bg-muted rounded-lg border p-4 text-left">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-destructive text-sm font-semibold">Error Details:</p>
              <Button
                onClick={copyErrorDetails}
                variant="outline"
                size="sm"
                className="text-destructive h-8 gap-2"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {/* Icon-only, so the name comes from hidden text */}
                <span className="sr-only">Copy error details</span>
              </Button>
              {/* Announces the copy, which the icon swap only shows visually */}
              <span role="status" className="sr-only">
                {copied ? "Copied" : ""}
              </span>
            </div>
            <p className="text-destructive font-mono text-sm wrap-break-word">
              {props.error.message}
            </p>
            {props.error.stack && (
              <details className="mt-3">
                <summary className="text-destructive cursor-pointer text-sm hover:underline">
                  Stack Trace
                </summary>
                <pre className="text-foreground mt-2 overflow-x-auto text-xs whitespace-pre-wrap">
                  {props.error.stack}
                </pre>
              </details>
            )}
            {props.info?.componentStack && (
              <details className="mt-3">
                <summary className="text-destructive cursor-pointer text-sm hover:underline">
                  Component Stack
                </summary>
                <pre className="text-foreground mt-2 overflow-x-auto text-xs whitespace-pre-wrap">
                  {props.info.componentStack}
                </pre>
              </details>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          {props.reset && (
            <Button onClick={() => props.reset?.()} size="lg" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Try Again
            </Button>
          )}
          <Button
            onClick={() => navigate({ to: "/" })}
            variant={props.reset ? "outline" : "default"}
            size="lg"
            className="gap-2"
          >
            <House className="h-4 w-4" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
