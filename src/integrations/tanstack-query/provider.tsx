import {
    QueryClient,
    QueryClientProvider,
    isServer,
} from '@tanstack/react-query'

let browserQueryClient: QueryClient | undefined = undefined

function makeQueryClient() {
    return new QueryClient()
}

export function getQueryClient() {
    if (isServer) {
        return makeQueryClient()
    } else {
        if (!browserQueryClient) browserQueryClient = makeQueryClient()
        return browserQueryClient
    }
}

export function TanstackQueryProvider({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <QueryClientProvider client={getQueryClient()}>
            {children}
        </QueryClientProvider>
    )
}
