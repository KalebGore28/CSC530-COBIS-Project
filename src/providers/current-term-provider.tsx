import { createContext, useContext } from 'react'
import { eq, useLiveQuery } from '@tanstack/react-db'
import type { JSX } from 'react'
import { currentTermCollection } from '@/integrations/tanstack-db/current-term'
import { termsCollection } from '@/integrations/tanstack-db/terms'

type CurrentTermContextValue = {
    currentTerm: {
        year: number
        term_id: string
        description: string
    }
    isLoading: boolean
}

const CurrentTermContext = createContext<CurrentTermContextValue>({
    currentTerm: {
        year: 0,
        term_id: '',
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
                eq(current_term.term_id, terms.id),
            )
            .select(({ current_term, terms }) => ({
                year: current_term.year,
                term_id: current_term.term_id,
                description: terms?.description,
            }))
            .findOne(),
    )

    const normalizedData = {
        year: data?.year || 0,
        term_id: data?.term_id || '',
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
