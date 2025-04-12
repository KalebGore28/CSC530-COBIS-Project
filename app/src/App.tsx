import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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

export const App: React.FC = () => {
  const { session, isLoading, refetchSession } = useSession();
  const { showLoading, hideLoading } = useLoading();

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
    return <></>;
  }

  // Now we know loading is complete, we can safely check session
  if (!session) {
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

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="class-roster" element={<ClassRosterPage />} />


        {/* Instructor Pages */}
        <Route path="/instructors" element={<InstructorsPage />} />
        <Route path="/instructors/:mnumber" element={<InstructorPage />} />
        <Route path="/instructors/:mnumber/:yearTerm" element={<InstructorTermDetails />} />
        <Route path="/instructors/:mnumber/:yearTerm/:courseId" element={<InstructorRoster />} />

        {/* Student Pages */}
        <Route path="/students/lookup" element={<StudentLookup />} />
        {/* <Route path="/student/:mnumber" element={<StudentPage />} /> */}


        {/* COBIS Tools */}
        <Route path="cobis-tools" element={<CobisTools />}>
          <Route path="query-builder" element={<QueryBuilderPage />} />
          <Route path="imports" element={<CsvImport />} />
        </Route>

      </Route>
      <Route path="/login" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
