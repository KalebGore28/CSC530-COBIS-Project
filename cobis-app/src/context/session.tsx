import {
  createContext,
  ReactNode,
  useContext,
  useCallback,
} from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { UserInfoResponse } from '@/routes/api/user/me'
import { authClient } from '@/lib/auth-client'

type SessionContextType = {
  session: UserInfoResponse | null
  isLoading: boolean
  logout: () => Promise<void>
  refetchSession: () => Promise<void>
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export function SessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()

  const fetchSession = useCallback(async (): Promise<UserInfoResponse | null> => {
    const response = await fetch('/api/user/me', {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.status === 401) return null
    if (!response.ok) {
      console.error('Error fetching /api/user/me:', await response.text())
      return null
    }

    const data = (await response.json()) as UserInfoResponse
    return data
  }, [])

  // Query handles caching, revalidation, and refetching
  const {
    data: session,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['session'],
    queryFn: fetchSession,
    retry: false,
    staleTime: 1000 * 60 * 5, // cache for 5 minutes
  })

  // Logout and clear session cache
  const logout = useCallback(async () => {
    await authClient.signOut()
    queryClient.setQueryData(['session'], null)
  }, [queryClient])

  const refetchSession = useCallback(async () => {
    await refetch()
  }, [refetch])

  return (
    <SessionContext.Provider
      value={{
        session: session ?? null,
        isLoading,
        logout,
        refetchSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}

// --- Hook ---
export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used within SessionProvider')
  return ctx
}