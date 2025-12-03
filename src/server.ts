import handler, { createServerEntry } from '@tanstack/react-start/server-entry'
import { getDbConnection } from './db'
import { auth } from './lib/server/auth'

type RequestContext = {
    auth: typeof auth
    db: Awaited<ReturnType<typeof getDbConnection>>
}

declare module '@tanstack/react-start' {
    interface Register {
        server: {
            requestContext: RequestContext
        }
    }
}

export default createServerEntry({
    async fetch(request) {
        const db = await getDbConnection()
        return handler.fetch(request, {
            context: {
                auth,
                db,
            }
        })
    },
})
