import { createContext, useCallback, useContext } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
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

    const fetchSession =
        useCallback(async (): Promise<UserInfoResponse | null> => {
            const response = await fetch('/api/user/me', {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (response.status === 401) return null
            if (!response.ok) {
                console.error(
                    'Error fetching /api/user/me:',
                    await response.text(),
                )
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

type Route = {
    name: string
    allowedRoles: Array<string>
}
const ROUTE_PERMISSIONS: { [key: string]: Route } = {
    '/dashboard': {
        name: 'Dashboard',
        allowedRoles: [
            'faculty',
            'advisor',
            'program_coordinator',
            'department_chair',
            'administrator',
            'cobis_administrator',
        ],
    },
    '/cobis-tools': {
        name: 'COBIS Tools',
        allowedRoles: ['cobis_administrator'],
    },
    '/cobis-tools/import': {
        name: 'Imports',
        allowedRoles: ['cobis_administrator'],
    },
    '/cobis-tools/users': {
        name: 'Users',
        allowedRoles: ['cobis_administrator'],
    },
    '/student-lookup': {
        name: 'Student Lookup',
        allowedRoles: [
            'program_coordinator',
            'department_chair',
            'administrator',
            'cobis_administrator',
        ],
    },
    '/instructors': {
        name: 'Instructors',
        allowedRoles: [
            'department_chair',
            'administrator',
            'cobis_administrator',
        ],
    },
    '/class-roster': {
        name: 'Class Roster',
        allowedRoles: [
            'faculty',
            'advisor',
            'department_chair',
            'cobis_administrator',
        ],
    },
    '/advisor-page': {
        name: 'Advisor Page',
        allowedRoles: [
            'faculty',
            'advisor',
            'department_chair',
            'cobis_administrator',
        ],
    },
    '/enrollment': {
        name: 'Enrollment',
        allowedRoles: [
            'department_chair',
            'administrator',
            'cobis_administrator',
        ],
    },
    '/enrollment/programs': {
        name: 'Enrollment Programs',
        allowedRoles: [
            'department_chair',
            'administrator',
            'cobis_administrator',
        ],
    },
    '/enrollment/courses': {
        name: 'Enrollment Courses',
        allowedRoles: [
            'department_chair',
            'administrator',
            'cobis_administrator',
        ],
    },
    '/enrollment/faculty': {
        name: 'Enrollment Faculty',
        allowedRoles: [
            'department_chair',
            'administrator',
            'cobis_administrator',
        ],
    },
}
// Mapping from database role_name to display name
export const ROLE_MAP: { [key: string]: string } = {
    faculty: 'Faculty',
    advisor: 'Advisor',
    program_coordinator: 'Program Coordinator',
    department_chair: 'Department Chair',
    administrator: 'Administrator',
    cobis_administrator: 'COBIS Admin',
}

export const hasRouteAccess = (
    route: string,
    userRoles: Array<string>,
): boolean => {
    const routeInfo = ROUTE_PERMISSIONS[route]
    if (!routeInfo) return false
    return routeInfo.allowedRoles.some((role) => userRoles.includes(role))
}
