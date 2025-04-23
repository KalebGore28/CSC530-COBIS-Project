// context/session.ts
import {
  createContext,
  ReactNode,
  useState,
  useEffect,
  useContext,           // ← import useContext, not `use`
} from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { getSession as rawGetSession, signout } from '@/lib/auth-client'

export interface Session {
  session: Awaited<ReturnType<typeof rawGetSession>>
  info: UserInfo
}
export type UserInfo = {
  roles: { role_id: number; role_name: string }[] | []
  department: string | null
  college: string | null
  mnumber: string | null
  isEnabled: boolean
}

interface SessionContextType {
  session: Session | null
  isLoading: boolean
  logout: () => void
  refetchSession: () => Promise<void>
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

// ———————————————————————————————————————————————————————————————
// 1) wrap getSession to catch 401
async function fetchSession(): Promise<
  Awaited<ReturnType<typeof rawGetSession>> | null
> {
  try {
    return await rawGetSession()
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      return null
    }
    throw err
  }
}

// 2) wrap your existing fetchUserInfo the same way
async function fetchUserInfo(): Promise<UserInfo | null> {
  try {
    const res = await axios.get<UserInfo>('/api/user/me', {
      withCredentials: true,
    })
    return res.data
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      return null
    }
    throw err
  }
}
// ———————————————————————————————————————————————————————————————

export const SessionProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const {
    data: sessionResult,
    isLoading: isLoadingSession,
    refetch: refetchSessionData,
  } = useQuery({
    queryKey: ['session'],
    queryFn: fetchSession,
    staleTime: 5 * 60_000,
    retry: false,              // don’t retry on 401
  })

  const {
    data: userInfo,
    isLoading: isLoadingUserInfo,
    refetch: refetchUserInfo,
  } = useQuery({
    queryKey: ['userInfo'],
    queryFn: fetchUserInfo,
    enabled: !!sessionResult,  // only run if sessionResult !== null
    staleTime: 5 * 60_000,
    retry: false,
  })

  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    // once both queries are done, build your combined session or null
    if (
      sessionResult !== undefined && // ran
      !isLoadingSession &&
      !isLoadingUserInfo
    ) {
      if (sessionResult && userInfo) {
        setSession({ session: sessionResult, info: userInfo })
      } else {
        setSession(null)
      }
    }
  }, [
    sessionResult,
    userInfo,
    isLoadingSession,
    isLoadingUserInfo,
  ])

  const logout = async () => {
    await signout()
    setSession(null)
  }

  const refetchSession = async () => {
    await refetchSessionData()
    await refetchUserInfo()
  }

  const combinedIsLoading = isLoadingSession || isLoadingUserInfo

  return (
    <SessionContext.Provider
      value={{
        session,
        isLoading: combinedIsLoading,
        logout,
        refetchSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}

export const useSession = () => {
  const ctx = useContext(SessionContext)  // ← use useContext
  if (!ctx) throw new Error('useSession must be used within SessionProvider')
  return ctx
}
