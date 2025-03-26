import { useState, useEffect } from 'react';
import { ThemeProvider } from "@/components/theme-provider";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Import Pages
import Dashboard from "./pages/Dashboard.tsx";
import LoginPage from "./pages/Login.tsx";
import Layout from "./Layout.tsx";
import Reports from "./pages/Reports.tsx";
import StudentsReport from "./pages/StudentsReport.tsx";
import QueryBuilderPage from "./pages/QueryBuilder.tsx";
import CobisTools from "./pages/CobisTools.tsx";
import CsvImport from "./pages/CsvImport.tsx";
import TestPage from './pages/TestPage.tsx';
import WaitingPage from './pages/Waiting.tsx';
import OnboardingPage from './pages/Onboarding.tsx';

// Import UnsavedChangesProvider
import { UnsavedChangesProvider } from "./components/UnsavedChangesContext";

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
  };
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    image?: string | undefined;
  };
  roles?: { role_id: number; role_name: string }[];
  permissions?: { table_name: string; column_name: string }[];
  mnumber: string | null;
  is_enabled: boolean;
}

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    handleSession();
  }, []);

  const handleSession = async () => {
    try {
      const response = await fetch("/api/user/me", {
        method: "GET",
        credentials: "include",
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
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setSession(null);
  };

  // Function to refetch session, passed to OnboardingPage
  const refetchSession = async () => {
    console.log("Refetching session...");
    await handleSession();
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
        {!session ? (
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        ) : !session.is_enabled ? (
          <WaitingPage />

        ) : !session.mnumber ? (
          <OnboardingPage refetchSession={refetchSession} />
        ) : (
          <Routes>
            <Route
              path="/"
              element={
                <UnsavedChangesProvider>
                  <Layout session={session} onLogout={handleLogout} />
                </UnsavedChangesProvider>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard session={session} />} />
              <Route path="reports" element={<Reports session={session} />}>
                <Route path="students" element={<StudentsReport session={session} />} />
              </Route>
              <Route path="cobis-tools" element={<CobisTools session={session} />}>
                <Route path="query-builder" element={<QueryBuilderPage />} />
                <Route path="imports" element={<CsvImport session={session} />} />
              </Route>
              <Route path="test-page" element={<TestPage />} />
            </Route>
            <Route path="/login" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        )}
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;