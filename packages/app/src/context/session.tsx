import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'
import axios from 'axios'
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
  refetchSession: () => Promise<void>
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const fetchSession = useCallback(async () => {
    setIsLoading(true)
    try {
      const base = await rawGetSession()
      if (!base) {
        setSession(null)
        return
      }

      const { data: info } = await axios.get<UserInfo>('/api/user/me', {
        withCredentials: true,
      })

      setSession({ session: base, info })
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setSession(null)
      } else {
        console.error('Error fetching session:', err)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSession()
  }, [fetchSession])

  const logout = async () => {
    await signout()
    setSession(null)
  }

  return (
    <SessionContext.Provider
      value={{
        session,
        isLoading,
        logout,
        refetchSession: fetchSession,
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
