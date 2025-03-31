import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@/components/theme-provider';
import { BrowserRouter } from 'react-router-dom';
import { SessionProvider } from './hooks/session-context';
import { App } from './App';
import './index.css'


createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<ThemeProvider>
            <BrowserRouter>
                <SessionProvider>
                    <App />
                </SessionProvider>
            </BrowserRouter>
        </ThemeProvider>
	</StrictMode>,
)
