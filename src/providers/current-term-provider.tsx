import { createContext, useContext } from "react";
import { useLiveQuery } from "@tanstack/react-db";
import type { JSX } from "react";
import { currentTermQuery } from "@/queries/lookups";

type CurrentTermContextValue = {
  currentTerm: {
    year: number;
    term_id: string;
    description: string;
  };
  isLoading: boolean;
};

const CurrentTermContext = createContext<CurrentTermContextValue>({
  currentTerm: {
    year: 0,
    term_id: "",
    description: "",
  },
  isLoading: true,
});

export function useCurrentTerm() {
  return useContext(CurrentTermContext);
}

export function CurrentTermProvider({ children }: { children: JSX.Element }) {
  const { data: currentTerm, isLoading } = useLiveQuery({ query: currentTermQuery() });

  const normalizedData = {
    year: currentTerm?.year || 1970,
    term_id: currentTerm?.term_id || "10",
    description: currentTerm?.description || "Spring",
  };

  return (
    <CurrentTermContext.Provider
      value={{
        currentTerm: normalizedData,
        isLoading,
      }}
    >
      {children}
    </CurrentTermContext.Provider>
  );
}
