import { createFileRoute } from '@tanstack/react-router'
import { loadUser } from '@/middleware/load-user'

export const Route = createFileRoute('/api/user/provision')({
    server: {
        middleware: [loadUser],
        handlers: {
            POST: async ({ request }) => {
                const url = new URL(request.url)
                const mnumber = url.searchParams.get('mnumber')
                const isEnabled = url.searchParams.get('isEnabled')
                const college = url.searchParams.get('college')
                const department = url.searchParams.get('department')
                const role_ids = url.searchParams.getAll('role_id')


                if (!mnumber || !isEnabled || !college || !department || role_ids.length === 0) {
                    return new Response(
                        JSON.stringify({ error: 'Missing required parameters' }),
                        {
                            status: 400,
                            headers: { 'Content-Type': 'application/json' },
                        }
                    )
                }

                


            },
        },
    },
})