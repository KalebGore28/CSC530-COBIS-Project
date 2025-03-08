import { useState, useEffect } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Layout from "./layout.tsx"
import Dashboard from "./Dashboard.tsx"
import LoginPage from "./login/page.tsx"

function App() {
	const [user, setUser] = useState<any>(null) // Store full user data (null if not authenticated)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const checkAuth = async () => {
			try {
				const response = await fetch("/api/auth/me", {
					method: "GET",
					credentials: "include",
				})

				if (response.ok) {
					const data = await response.json()
					setUser(data || null)
				} else {
					setUser(null)
				}
			} catch (error) {
				console.error("Error checking auth:", error)
				setUser(null)
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
			<BrowserRouter>
				<Routes>
					{/* Public Route */}
					<Route
						path="/login"
						element={!user ? <LoginPage /> : <Navigate to="/dashboard" />}
					/>

					{/* Protected Routes */}
					<Route
						path="/"
						element={
							user ? <Layout user={user} /> : <Navigate to="/login" />
						}
					>
						<Route index element={<Dashboard user={user} />} />
						<Route path="dashboard" element={<Dashboard user={user} />} />
					</Route>

					{/* Catch-all redirect */}
					<Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
				</Routes>
			</BrowserRouter>
		</ThemeProvider>
	)
}

export default App