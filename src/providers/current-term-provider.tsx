import { createContext, useContext } from 'react'
import { eq, useLiveQuery } from '@tanstack/react-db'
import type { JSX } from 'react'
import { currentTermCollection } from '@/integrations/tanstack-db/current-term'
import { termsCollection } from '@/integrations/tanstack-db/terms'

type CurrentTermContextValue = {
    currentTerm: {
        year: number
        term_code: string
        description: string
    }
    isLoading: boolean
}

const CurrentTermContext = createContext<CurrentTermContextValue>({
    currentTerm: {
        year: 0,
        term_code: '',
        description: '',
    },
    isLoading: true,
})

export function useCurrentTerm() {
    return useContext(CurrentTermContext)
}

export function CurrentTermProvider({ children }: { children: JSX.Element }) {
    const { data, isLoading } = useLiveQuery((q) =>
        q
            .from({ current_term: currentTermCollection })
            .leftJoin({ terms: termsCollection }, ({ current_term, terms }) =>
                eq(current_term.term_code, terms.code),
            )
            .select(({ current_term, terms }) => ({
                year: current_term.year,
                term_code: current_term.term_code,
                description: terms?.description,
            }))
            .findOne(),
    )

    const normalizedData = {
        year: data?.year || 0,
        term_code: data?.term_code || '',
        description: data?.description || '',
    }

    return (
        <CurrentTermContext.Provider
            value={{
                currentTerm: normalizedData,
                isLoading,
            }}
        >
            {children}
        </CurrentTermContext.Provider>
    )
}
