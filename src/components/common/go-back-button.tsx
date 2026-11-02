import { useCanGoBack, useRouter } from "@tanstack/react-router";
import type { NavigateOptions } from "@tanstack/react-router";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";

type GoBackButtonProps = Omit<ComponentProps<typeof Button>, "onClick"> & {
  // Where to go when there is no previous page in the app, such as after opening a shared link
  fallback: NavigateOptions;
};

export function GoBackButton({ fallback, ...props }: GoBackButtonProps) {
  const router = useRouter();
  const canGoBack = useCanGoBack();

  return (
    <Button
      {...props}
      onClick={() => {
        if (canGoBack) {
          router.history.back();
        } else {
          void router.navigate(fallback);
        }
      }}
    />
  );
}
