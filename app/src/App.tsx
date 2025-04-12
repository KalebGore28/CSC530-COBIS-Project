import React, { useEffect, useState, useRef } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
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

// Importing the instructor pages
import InstructorsPage from './pages/instructors';
import InstructorPage from './pages/instructors/[instructorId]';
import InstructorTermDetails from './pages/instructors/[instructorId]/term-details';
import InstructorRoster from './pages/instructors/[instructorId]/roster';

import { useSession } from '@/context/session';
import { useLoading } from '@/providers/loading-provider';

// Create a utility function to save and restore the initial URL
const URL_STORAGE_KEY = 'initial_app_url';

function saveInitialUrl(url: string) {
  try {
    sessionStorage.setItem(URL_STORAGE_KEY, url);
    console.log('URL saved to sessionStorage:', url);
  } catch (e) {
    console.error('Failed to save URL to sessionStorage:', e);
  }
}

function getInitialUrl(): string | null {
  try {
    const url = sessionStorage.getItem(URL_STORAGE_KEY);
    console.log('Retrieved URL from sessionStorage:', url);
    return url;
  } catch (e) {
    console.error('Failed to get URL from sessionStorage:', e);
    return null;
  }
}

function clearInitialUrl() {
  try {
    console.log('Clearing saved URL from sessionStorage');
    sessionStorage.removeItem(URL_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear URL from sessionStorage:', e);
  }
}

export const App: React.FC = () => {
  const { session, isLoading, refetchSession } = useSession();
  const { showLoading, hideLoading } = useLoading();
  const location = useLocation();
  const navigate = useNavigate();
  const [initialUrlSaved, setInitialUrlSaved] = useState(false);
  const redirectAttempted = useRef(false);

  // Capture and save the initial URL on first load
  useEffect(() => {
    if (!initialUrlSaved) {
      // Don't save login or default routes
      if (location.pathname !== '/login' &&
        location.pathname !== '/dashboard' &&
        location.pathname !== '/') {
        console.log('Saving initial URL for later:', location.pathname);
        saveInitialUrl(location.pathname);
      }
      setInitialUrlSaved(true);
    }
  }, [location.pathname, initialUrlSaved]);

  // Check if we should restore an initial deep-linked URL (after auth)
  useEffect(() => {
    if (session && !isLoading && location.pathname === '/dashboard' && !redirectAttempted.current) {
      const savedUrl = getInitialUrl();
      if (savedUrl && savedUrl !== '/dashboard' && savedUrl !== '/') {
        console.log('Attempting direct navigation to saved URL:', savedUrl);
        redirectAttempted.current = true;
        clearInitialUrl();

        // Use setTimeout to ensure this happens after current render cycle
        setTimeout(() => {
          navigate(savedUrl, { replace: true });
        }, 0);
      }
    }
  }, [session, isLoading, location.pathname, navigate]);

  // Use useEffect to handle loading state changes
  useEffect(() => {
    if (isLoading) {
      showLoading('Loading session...');
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);

  // The loading screen is shown via the LoadingProvider
  if (isLoading) {
    console.log('Loading session...');
    return <></>;
  }

  // Now we know loading is complete, we can safely check session
  if (!session) {
    console.log('Session not found, redirecting to login...');
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // If account is not enabled, show waiting page
  if (!session.info.isEnabled) {
    return <WaitingPage />;
  }

  // If account doesn't have a mnumber, show onboarding page
  if (!session.info.mnumber) {
    return <OnboardingPage refetchSession={refetchSession} />;
  }

  console.log('Session found, rendering app...');

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="class-roster" element={<ClassRosterPage />} />

        {/* Instructor Pages - use relative paths (no leading slash) */}
        <Route path="instructors" element={<InstructorsPage />} />
        <Route path="instructors/:mnumber" element={<InstructorPage />} />
        <Route path="instructors/:mnumber/:yearTerm" element={<InstructorTermDetails />} />
        <Route path="instructors/:mnumber/:yearTerm/:courseId" element={<InstructorRoster />} />

        {/* Student Pages - use relative paths (no leading slash) */}
        <Route path="students/lookup" element={<StudentLookup />} />
        {/* <Route path="students/:mnumber" element={<StudentPage />} /> */}

        {/* COBIS Tools */}
        <Route path="cobis-tools" element={<CobisTools />}>
          <Route path="query-builder" element={<QueryBuilderPage />} />
          <Route path="imports" element={<CsvImport />} />
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>

      <Route path="/login" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};