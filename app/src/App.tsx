import { useState, useEffect } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import Layout from './layout.tsx'
import LoginPage from "./login/page.tsx"

function App() {
	const [user, setUser] = useState(null) // Store full user data (null if not authenticated)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const checkAuth = async () => {
			try {
				const response = await fetch('/api/auth/me', {
					method: 'GET',
					credentials: 'include',
				})

				if (response.ok) {
					const data = await response.json()

					setUser(data || null) // Store user data if present, null if empty
				} else {
					setUser(null) // Not authenticated
				}
			} catch (error) {
				console.error("Error checking auth:", error)
				setUser(null) // Default to unauthenticated on error
			} finally {
				setIsLoading(false)
			}
		}

		checkAuth()
	}, [])

	if (isLoading) {
		return (
			<ThemeProvider>
				<div>Loading...</div>
			</ThemeProvider>
		)
	}

	return (
		<ThemeProvider>
			{user ? (
				<Layout user={user}>
					<h1></h1>
				</Layout>
			) : (
				<LoginPage />
			)}
		</ThemeProvider>
	)
}

export default App