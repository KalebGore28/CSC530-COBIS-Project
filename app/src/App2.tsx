import { useState, useEffect } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom"
import Layout from "./layout.tsx"
import Dashboard from "./pages/DashboardOld.tsx"
import LoginPage from "./pages/Login.tsx"
import Reports from "./pages/Reports.tsx"
import StudentsReport from "./pages/StudentsReport.tsx"
import QueryBuilderPage from "./pages/QueryBuilder.tsx"
import CobisTools from "./pages/CobisTools.tsx"
import CsvImport from "./pages/CsvImport.tsx"

import { authClient } from "@/lib/auth-client";
import { signinGoogle } from './lib/auth-client';

// Define TypeScript interfaces for the session and user
interface User {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	createdAt: Date;
	updatedAt: Date;
	image?: string | null | undefined | undefined;
}

interface Session {
	user: User;
}

function App() {
	const [user, setUser] = useState<any>(null)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const checkAuth = async () => {
			try {
				const response = await fetch("/api/me", {
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
						element={!user ? <LoginPage /> : <Navigate to="/dashboard" replace />}
					/>

					{/* Protected Routes */}
					<Route
						path="/"
						element={user ? <Layout user={user} /> : <Navigate to="/login" replace />}
					>
						<Route index element={<RedirectToDashboard />} />
						<Route path="dashboard" element={<Dashboard user={user} />} />
						<Route path="reports" element={<Reports user={user} />}>
							<Route path="students" element={<StudentsReport user={user} />} />
						</Route>
						<Route path="cobis-tools" element={<CobisTools user={user} />}>
							<Route path="query-builder" element={<QueryBuilderPage />} />
							<Route path="imports" element={<CsvImport user={user} />} />
						</Route>
					</Route>

					{/* Catch-all redirect */}
					<Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
				</Routes>
			</BrowserRouter>
		</ThemeProvider>
	)
}

function RedirectToDashboard() {
	const navigate = useNavigate()
	useEffect(() => {
		console.log("Redirecting from / to /dashboard")
		navigate("/dashboard", { replace: true })
	}, [navigate])
	return null
}

export default App