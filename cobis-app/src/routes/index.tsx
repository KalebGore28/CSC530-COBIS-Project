import { createFileRoute, redirect } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/')({
  beforeLoad: async (ctx) => {
    const session = await authClient.getSession()
    if (!session?.data?.user) {
      throw redirect({
        to: '/login',
        search: { redirectTo: ctx.location.pathname },
      })
    }
  },
  component: App,
})

function App() {
  return (
    <div>
      hello

    </div>
  )
}
