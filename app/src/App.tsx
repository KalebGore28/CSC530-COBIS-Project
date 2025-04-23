import React, { useEffect, useState, useRef } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';

// Page Imports
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/auth/login';
import Layout from './Layout';
import QueryBuilderPage from './pages/QueryBuilder';
import CobisTools from './pages/CobisTools';
import CsvImport from './pages/CsvImport';
import WaitingPage from './pages/auth/waiting';
import OnboardingPage from './pages/auth/onboarding';
import StudentLookup from './pages/StudentLookup';
import ClassRosterPage from './pages/ClassRoster';
import InstructorsPage from './pages/instructors';
import InstructorPage from './pages/instructors/[instructorId]';
import InstructorTermDetails from './pages/instructors/[instructorId]/term-details';
import InstructorRoster from './pages/instructors/[instructorId]/roster';
import AdvisorPage from './pages/AdvisorPage';
import { UserList } from '@/pages/UserPage'; // Adjust path if needed

// Context/Provider Imports
import { useSession } from '@/context/session';
import { useLoading } from '@/providers/loading-provider';
import { useRoleContext } from '@/context/role'; // Import useRoleContext

// Import your new ProtectedRoute component
import ProtectedRoute from '@/components/auth/ProtectedRoute'; // Adjust path if needed

// Keep URL restoration logic (utility functions and initial hooks)
const URL_STORAGE_KEY = 'initial_app_url';

export const App: React.FC = () => {
  const { session, isLoading, refetchSession } = useSession();
  const { showLoading, hideLoading } = useLoading();
  const location = useLocation();
  const navigate = useNavigate();
  const [initialUrlSaved, setInitialUrlSaved] = useState(false);
  const redirectAttempted = useRef(false);
  const { routePermissions } = useRoleContext();
  const [sessionChecked, setSessionChecked] = useState(false);


  // --- Keep Existing Hooks for loading, URL restoration ---
  useEffect(() => {
    if (!initialUrlSaved) {
      if (location.pathname !== '/login' && location.pathname !== '/dashboard' && location.pathname !== '/') {
        saveInitialUrl(location.pathname);
      }
      setInitialUrlSaved(true);
    }
  }, [location.pathname, initialUrlSaved]);

  useEffect(() => {
    if (session && !isLoading && location.pathname === '/dashboard' && !redirectAttempted.current) {
      const savedUrl = getInitialUrl();
      if (savedUrl && savedUrl !== '/dashboard' && savedUrl !== '/') {
        redirectAttempted.current = true;
        clearInitialUrl();
        setTimeout(() => { navigate(savedUrl, { replace: true }); }, 0);
      }
    }
  }, [session, isLoading, location.pathname, navigate]);


  // Effect to manage LoadingProvider visibility and track check completion
  useEffect(() => {
    if (isLoading) {
      setSessionChecked(false); // Reset flag when loading starts
      showLoading('Loading session...');
    } else {
      // isLoading is now false. Mark session as checked.
      setSessionChecked(true);
      hideLoading();
    }
    // Ensure show/hide are stable references or included if they aren't
  }, [isLoading, showLoading, hideLoading]);

  // --- Auth Flow ---
  if (!sessionChecked) return <></>; // Or loading component

  if (!session) return <LoginPage />;
  if (!session.info.isEnabled) return <WaitingPage />;
  if (!session.info.mnumber) return <OnboardingPage refetchSession={refetchSession} />;

  // --- Application Routes with Protection ---
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="dashboard" replace />} />

        <Route path="dashboard" element={<Dashboard />} />

        {/* Class Roster: Use permissions from context */}
        <Route path="class-roster" element={
          <ProtectedRoute allowedRoles={routePermissions['/class-roster'] || []}>
            <ClassRosterPage />
          </ProtectedRoute>
        } />

        {/* Instructor Pages: Use permissions from context */}
        <Route element={<ProtectedRoute allowedRoles={routePermissions['/instructors'] || []} />}>
          <Route path="instructors" element={<InstructorsPage />} />
          <Route path="instructors/:mnumber" element={<InstructorPage />} />
          <Route path="instructors/:mnumber/:yearTerm" element={<InstructorTermDetails />} />
          <Route path="instructors/:mnumber/:yearTerm/:courseId" element={<InstructorRoster />} />
        </Route>

        {/* Student Lookup: Use permissions from context */}
        <Route path="students/lookup" element={
          <ProtectedRoute allowedRoles={routePermissions['/students/lookup'] || []}>
            <StudentLookup />
          </ProtectedRoute>
        } />

        {/* COBIS Tools: Use permissions from context */}
        <Route element={<ProtectedRoute allowedRoles={routePermissions['/cobis-tools'] || []} />}>
          <Route path="cobis-tools" element={<CobisTools />}>
            <Route path="query-builder" element={<QueryBuilderPage />} />
            <Route path="imports" element={<CsvImport />} />
            <Route path="users" element={<UserList />} />
          </Route>
        </Route>

        {/* Advisor Page: Use permissions from context */}
        <Route path="advisor-page" element={
          <ProtectedRoute allowedRoles={routePermissions['/advisor-page'] || []}>
            <AdvisorPage />
          </ProtectedRoute>
        } />

        {/* Login Redirect */}

        {/* Catch-all inside Layout */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>

      {/* Standalone Routes */}
      <Route path="/login" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function saveInitialUrl(url: string) {
  try {
    sessionStorage.setItem(URL_STORAGE_KEY, url);
  } catch (e) {
    console.error('Failed to save URL to sessionStorage:', e);
  }
}

function getInitialUrl(): string | null {
  try {
    const url = sessionStorage.getItem(URL_STORAGE_KEY);
    return url;
  } catch (e) {
    console.error('Failed to get URL from sessionStorage:', e);
    return null;
  }
}

function clearInitialUrl() {
  try {
    sessionStorage.removeItem(URL_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear URL from sessionStorage:', e);
  }
}