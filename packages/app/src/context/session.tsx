import {
  createContext,
  ReactNode,
  useContext,
} from 'react'
import { useQuery } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import { getSession as rawGetSession, signout } from '@/lib/auth-client'
import type { Role } from '@cobis/types'

export interface Session {
  session: Awaited<ReturnType<typeof rawGetSession>>
  info: UserInfo
}
export type UserInfo = {
  roles: Role[]
  department: string | null
  college: string | null
  mnumber: string | null
  isEnabled: boolean
}

interface SessionContextType {
  session: Session | null
  isLoading: boolean
  logout: () => Promise<void>
  refetchSession: () => Promise<unknown>
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { data, isLoading, refetch } = useQuery<Session | null, AxiosError>({
    queryKey: ['fullSession'],
    queryFn: async () => {
      let base: Awaited<ReturnType<typeof rawGetSession>> | null
      try {
        base = await rawGetSession()
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          base = null
        } else {
          throw err
        }
      }
      if (!base) return null

      // 2) user info
      try {
        const { data: info } = await axios.get<UserInfo>('/api/user/me', {
          withCredentials: true,
        })
        return { session: base, info }
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          return null
        }
        throw err
      }
    },
    staleTime: 5 * 60_000,
    retry: false,
  })

  const logout = async () => {
    await signout()    
  }

  return (
    <SessionContext.Provider
      value={{
        session: data ?? null,
        isLoading,
        logout,
        refetchSession: refetch,
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}

export const useSession = () => {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used within SessionProvider')
  return ctx
}
