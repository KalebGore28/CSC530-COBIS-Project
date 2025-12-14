import { createFileRoute } from '@tanstack/react-router'
import { loadUser } from '@/middleware/load-user'

// API is going to be deprecated
export const Route = createFileRoute('/api/user/me')({
    server: {
        middleware: [loadUser],
        handlers: {
            GET: ({ context }) => {
                const { user, roles, faculty } = context

                return new Response(
                    JSON.stringify({
                        user: user,
                        mnumber: user.mnumber,
                        isEnabled: user.isEnabled,
                        roles,
                        faculty,
                    }),
                    {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' },
                    },
                )
            },
        },
    },
})

export type UserInfoResponse = {
    user: {
        id: string
        name: string | null
        email: string
        image?: string | null
        createdAt?: string | Date
        updatedAt?: string | Date
    }
    mnumber: string | null
    isEnabled: boolean
    roles: Array<string>
    faculty: {
        firstName: string
        lastName: string
        department: string
        college: string
    }
}
