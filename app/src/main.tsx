import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import Dashboard from './pages/Dashboard'
import './index.css'


createRoot(document.getElementById('root')!).render(
	<StrictMode>
		{/* <App /> */}
		<Dashboard />
	</StrictMode>,
)
