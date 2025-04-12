import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Importing Providers
import { ErrorBoundary } from '@/components/providers/error-boundary';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { LoadingProvider } from '@/components/providers/loading-provider';

// Importing Context Providers
import { RoleProvider } from '@/hooks/role-context';
import { SessionProvider } from '@/hooks/session-context';


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
                </div>
            }
        >
            <QueryClientProvider client={queryClient}>
                <ThemeProvider>
                    <LoadingProvider>
                        <BrowserRouter>
                            <SessionProvider>
                                <RoleProvider>
                                    <App />
                                </RoleProvider>
                            </SessionProvider>
                        </BrowserRouter>
                    </LoadingProvider>
                </ThemeProvider>
            </QueryClientProvider>
        </ErrorBoundary>
    </StrictMode>,
)
