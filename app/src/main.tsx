import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Importing Providers
import { ErrorBoundary } from '@/providers/error-boundary';
import { ThemeProvider } from '@/providers/theme-provider';
import { LoadingProvider } from '@/providers/loading-provider';

// Importing Context Providers
import { RoleProvider } from '@/context/role';
import { SessionProvider } from '@/context/session';
import { BreadcrumbProvider } from './context/breadcrumb';

// Importing App Component
import { App } from './App';

import './index.css'

// Create a client
const queryClient = new QueryClient()

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
            <QueryClientProvider client={queryClient}>
                <ThemeProvider>
                    <LoadingProvider>
                        <BrowserRouter>
                            <SessionProvider>
                                <RoleProvider>
                                    <BreadcrumbProvider>
                                        <App />
                                    </BreadcrumbProvider>
                                </RoleProvider>
                            </SessionProvider>
                        </BrowserRouter>
                    </LoadingProvider>
                </ThemeProvider>
            </QueryClientProvider>
        </ErrorBoundary>
    </StrictMode>,
)
