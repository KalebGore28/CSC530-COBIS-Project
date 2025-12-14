import handler, { createServerEntry } from '@tanstack/react-start/server-entry'
import { getDbConnection } from './db'
import { auth } from './lib/auth'

type RequestContext = {
    auth: typeof auth
    db: ReturnType<typeof getDbConnection>
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
        const db = getDbConnection()
        return handler.fetch(request, {
            context: {
                auth,
                db,
            },
        })
    },
})
