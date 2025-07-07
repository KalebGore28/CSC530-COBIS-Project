import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import { Environment, Network, FetchFunction } from "relay-runtime";

// Importing Providers
import { ErrorBoundary } from '@/providers/error-boundary';
import { ThemeProvider } from '@/providers/theme-provider';
import { RelayEnvironmentProvider } from "react-relay";

// Importing Context Providers
import { RoleProvider } from '@/context/role';
import { SessionProvider } from '@/context/session';
import { BreadcrumbProvider } from './context/breadcrumb';

// We use relative api path as we are hosting the app on the same server as the API
const GRAPHQL_ENDPOINT = "/api/graphql";

const fetchGraphQL: FetchFunction = async (operation, variables) => {
    const resp = await fetch(GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            doc_id: operation.id,
            variables
        }),
    });
    if (!resp.ok) {
        throw new Error("Response failed.");
    }
    return await resp.json();
};

export const environment = new Environment({
    network: Network.create(fetchGraphQL),
});

// Importing App Component
import { App } from './App';

import './index.css'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ErrorBoundary
            fallback={
                <div className="flex items-center justify-center w-full h-full">
                    <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
                    {/* Ask to redirect to main */}
                    <a href="/" className="text-blue-500 hover:underline">
                        Go to main page
                    </a>
                </div>
            }
        >
            <RelayEnvironmentProvider environment={environment}>
                <Suspense fallback="Loading..."> {/* TODO: Replace this with a custom loading component */}
                        <ThemeProvider>
                            <BrowserRouter>
                                <SessionProvider>
                                    <RoleProvider>
                                        <BreadcrumbProvider>
                                            <App />
                                        </BreadcrumbProvider>
                                    </RoleProvider>
                                </SessionProvider>
                            </BrowserRouter>
                        </ThemeProvider>
                </Suspense>
            </RelayEnvironmentProvider>
        </ErrorBoundary>
    </StrictMode>,
)
