import { useState, useEffect } from 'react';
import { ThemeProvider } from "@/components/theme-provider"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

// Import Pages
import Dashboard from "./pages/Dashboard.tsx"
import LoginPage from "./pages/Login.tsx"
import Layout from "./Layout.tsx"
import Reports from "./pages/Reports.tsx"
import StudentsReport from "./pages/StudentsReport.tsx"
import QueryBuilderPage from "./pages/QueryBuilder.tsx"
import CobisTools from "./pages/CobisTools.tsx"
import CsvImport from "./pages/CsvImport.tsx"

// Define TypeScript interfaces for the session and user

export interface Session {
  session: {
    id: string;
    expiresAt: string;
    token: string;
    createdAt: string;
    updatedAt: string;
    ipAddress: string;
    userAgent: string;
    userId: string;
  }
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    image?: string | undefined;
  }
  roles?: { role_id: number; role_name: string }[];
  permissions?: { table_name: string; column_name: string }[];
}

function App() {
  // Type the session state as Session | null
  const [session, setSession] = useState<Session | null>(null);

  // Check session on mount
  useEffect(() => {
    handleSession();
  }, []);

  const handleSession = async () => {
    try {
      const response = await fetch("/api/me", {
        method: "GET",
        credentials: "include", // Include cookies/credentials in the request
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const sessionData: Session = await response.json();
      setSession(sessionData);
    } catch (err) {
      console.error("Failed to fetch session:", err);
      setSession(null); // Clear session on error
    }
  };

  // Callback to update session after login
  const handleLoginSuccess = (newSession: Session) => {
    setSession(newSession);
  };

  // Callback to clear session after logout
  const handleLogout = async () => {
    setSession(null);
  };

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route
            path="/login"
            element={!session ? <LoginPage onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/dashboard" replace />}
          />

          {/* Protected Routes */}
          <Route
            path="/"
            element={session ? <Layout session={session} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
          >
            <Route path="dashboard" element={<Dashboard session={session} />} />
            <Route path="reports" element={<Reports session={session} />}>
              <Route path="students" element={<StudentsReport session={session} />} />
            </Route>
            <Route path="cobis-tools" element={<CobisTools session={session} />}>
              <Route path="query-builder" element={<QueryBuilderPage />} />
              <Route path="imports" element={<CsvImport session={session} />} />
            </Route>


          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;