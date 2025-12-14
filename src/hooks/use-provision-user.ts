// src/hooks/use-provision-user.ts
import { useMutation } from '@tanstack/react-query'
import type { colleges, departments, faculty, roles, user } from '@/db/schema'

type Role = typeof roles.$inferSelect
type Department = typeof departments.$inferSelect
type College = typeof colleges.$inferSelect
type Faculty = typeof faculty.$inferSelect
type User = typeof user.$inferSelect

export type ProvisionParams = {
    roles: Array<Role>
    isEnabled: boolean
    college: College
    department: Department
    faculty: Faculty
    user: User
}

export function useProvisionUser() {
    return useMutation({
        mutationFn: async (params: ProvisionParams) => {
            const { faculty, isEnabled, college, department, roles, user } =
                params

            const url = new URL('/api/user/provision', window.location.origin)
            url.searchParams.set('mnumber', faculty.mnumber)
            url.searchParams.set('isEnabled', String(isEnabled))
            url.searchParams.set('college', college.code)
            url.searchParams.set('department', department.code)
            url.searchParams.set('userId', user.id)
            for (const role of roles) {
                url.searchParams.append('role_id', String(role.id))
            }

            const res = await fetch(url.toString(), { method: 'POST' })
            if (!res.ok) {
                const error = await res.json().catch(() => ({}))
                throw new Error(error.error || 'Provisioning failed')
            }
            return res.json()
        },
        onSuccess: (data) => {
            console.log('✅ Provision succeeded:', data)
        },
        onError: (err) => {
            console.error('❌ Provision failed:', err)
        },
    })
}
