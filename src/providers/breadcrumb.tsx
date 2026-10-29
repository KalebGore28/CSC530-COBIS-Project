import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import type { ReactNode } from "react";

// Define the context type
type BreadcrumbContextType = {
  segmentOverrides: Record<string, string | undefined>;
  setSegmentTitle: (segment: string, title: string | undefined) => void;
  getBreadcrumbTitle: (segment: string) => string | undefined;
};

// Create a context for breadcrumb segment overrides with default values
const BreadcrumbContext = createContext<BreadcrumbContextType>({
  segmentOverrides: {},
  setSegmentTitle: () => {},
  getBreadcrumbTitle: () => undefined,
});

interface BreadcrumbProviderProps {
  children: ReactNode;
}

export function BreadcrumbProvider({ children }: BreadcrumbProviderProps) {
  // Use localStorage to persist breadcrumb overrides between page navigations
  const [segmentOverrides, setSegmentOverrides] = useState<Record<string, string | undefined>>(
    () => {
      // Try to load initial state from localStorage
      try {
        const saved = localStorage.getItem("breadcrumb-overrides");
        return saved ? JSON.parse(saved) : {};
      } catch {
        return {};
      }
    },
  );

  // Store overrides in localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("breadcrumb-overrides", JSON.stringify(segmentOverrides));
  }, [segmentOverrides]);

  // Memoize the setSegmentTitle function to prevent infinite renders
  const setSegmentTitle = useCallback((segment: string, title: string | undefined) => {
    setSegmentOverrides((prev) => {
      // Only update if the value is actually different
      if (prev[segment] === title) {
        return prev;
      }
      return {
        ...prev,
        [segment]: title,
      };
    });
  }, []);

  // Helper function to get a breadcrumb title
  const getBreadcrumbTitle = useCallback(
    (segment: string) => {
      return segmentOverrides[segment];
    },
    [segmentOverrides],
  );

  return (
    <BreadcrumbContext.Provider value={{ segmentOverrides, setSegmentTitle, getBreadcrumbTitle }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumb(): BreadcrumbContextType {
  return useContext(BreadcrumbContext);
}

// A hook to easily set the breadcrumb title for the current segment
export function useSetBreadcrumb(segment: string, title: string | null | undefined): void {
  const { setSegmentTitle } = useBreadcrumb();

  useEffect(() => {
    if (title) {
      setSegmentTitle(segment, title);
    }

    if (title === null) {
      setSegmentTitle(segment, undefined);
    }
  }, [segment, title, setSegmentTitle]);
}

// Add this hook to be used in the SiteHeader component
export function useBreadcrumbPath(): Array<{ path: string; title: string }> {
  const location = useLocation();
  const { segmentOverrides } = useBreadcrumb();

  return React.useMemo(() => {
    const pathSegments = location.pathname.split("/").filter(Boolean);

    return pathSegments.map((segment, index) => {
      const path = `/${pathSegments.slice(0, index + 1).join("/")}`;

      // Check if we have an override for this segment
      if (segmentOverrides[segment]) {
        return { path, title: segmentOverrides[segment] };
      }

      // Otherwise, use the default formatting
      const title = segment
        .replace(/-/g, " ")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      return { path, title };
    });
  }, [location.pathname, segmentOverrides]);
}
