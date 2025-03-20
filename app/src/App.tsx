import { useState, useEffect } from 'react';
import { authClient } from "@/lib/auth-client";
import { ThemeProvider } from "@/components/theme-provider"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

// Import Pages
import Dashboard from "./pages/Dashboard.tsx"
import LoginPage from "./pages/Login.tsx"
import Layout from "./Layout.tsx"

// Define TypeScript interfaces for the session and user
export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  image?: string | undefined;
}

export interface Session {
  user: User;
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
      const { data: sessionData, error } = await authClient.getSession();
      if (error) {
        console.error(error);
      } else {
        // @ts-ignore
        setSession(sessionData);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Callback to update session after login
  const handleLoginSuccess = (newSession: Session) => {
    setSession(newSession);
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
            element={session ? <Layout session={session} /> : <Navigate to="/login" replace />}
          >
            <Route path="dashboard" element={<Dashboard session={session} />} />



          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;