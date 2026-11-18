import { Moon, Sun } from "lucide-react";
import { createContext, useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export const THEME_STORAGE_KEY = "vite-ui-theme";

/**
 * Runs inline in <head> before the first paint, so dark mode doesn't flash light first.
 * Keep it in step with how ThemeProvider resolves the theme below.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});var d=t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.add(d?"dark":"light")}catch(e){}})()`;

function readStoredTheme(storageKey: string, fallback: Theme): Theme {
  try {
    const stored = localStorage.getItem(storageKey);
    return stored === "dark" || stored === "light" || stored === "system" ? stored : fallback;
  } catch {
    return fallback;
  }
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = THEME_STORAGE_KEY,
}: ThemeProviderProps) {
  // SSR-safe: only read storage on the client. Nothing is saved until the user picks a theme,
  // so "system" keeps following the OS setting.
  const [theme, setTheme] = useState<Theme>(() =>
    typeof window === "undefined" ? defaultTheme : readStoredTheme(storageKey, defaultTheme),
  );

  useEffect(() => {
    // Sync with localStorage changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey) {
        setTheme(readStoredTheme(storageKey, defaultTheme));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [storageKey, defaultTheme]);

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = () => {
      const applied = theme === "system" ? (media.matches ? "dark" : "light") : theme;
      root.classList.remove("light", "dark");
      root.classList.add(applied);
    };

    apply();
    // Only "system" follows the OS switching between light and dark
    if (theme !== "system") return;
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);

  const value = {
    theme,
    setTheme: (t: Theme) => {
      try {
        localStorage.setItem(storageKey, t);
      } catch {
        // Storage can be blocked; the choice still applies for this visit
      }
      setTheme(t);
    },
  };

  return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>;
}

export const useTheme = () => {
  return useContext(ThemeProviderContext);
};

export function ModeToggle({ className }: { className?: string }) {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" className={cn(className)}>
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
