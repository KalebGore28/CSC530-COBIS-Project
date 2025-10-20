// src/hooks/use-provision-user.ts
import { useMutation } from '@tanstack/react-query'
import { roles } from '@/db/schema';

type Role = typeof roles.$inferSelect;

export type ProvisionParams = {
    roles: Role[];
    isEnabled: boolean;
    collegeCode: string;
    departmentCode: string;
    mnumber: string;
    userId: string;
}

export function useProvisionUser() {
    return useMutation({
        mutationFn: async (params: ProvisionParams) => {
            const { mnumber, isEnabled, collegeCode, departmentCode, roles, userId } = params

            const url = new URL('/api/user/provision', window.location.origin)
            url.searchParams.set('mnumber', mnumber)
            url.searchParams.set('isEnabled', String(isEnabled))
            url.searchParams.set('college', collegeCode)
            url.searchParams.set('department', departmentCode)
            url.searchParams.set('userId', userId)
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
