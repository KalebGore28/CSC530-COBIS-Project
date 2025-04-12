import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@/components/theme-provider';
import { BrowserRouter } from 'react-router-dom';
import { SessionProvider } from '@/hooks/session-context';
import { RoleProvider } from '@/hooks/role-context';
import { ErrorBoundary } from '@/components/error-boundary';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
                    <BrowserRouter>
                        <SessionProvider>
                            <RoleProvider>
                                <App />
                            </RoleProvider>
                        </SessionProvider>
                    </BrowserRouter>
                </ThemeProvider>
            </QueryClientProvider>
        </ErrorBoundary>
    </StrictMode>,
)
