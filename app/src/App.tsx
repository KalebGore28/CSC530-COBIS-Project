import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/Login';
import Layout from './Layout';
import Reports from './pages/Reports';
import StudentsReport from './pages/StudentsReport';
import QueryBuilderPage from './pages/QueryBuilder';
import CobisTools from './pages/CobisTools';
import CsvImport from './pages/CsvImport';
import TestPage from './pages/TestPage';
import WaitingPage from './pages/Waiting';
import OnboardingPage from './pages/Onboarding';
import StudentLookup from './pages/StudentLookup';

import ProfessorPage from './pages/ProfessorPage';
import ClassRosterPage from './pages/ClassRoster';

import InstructorsPage from './pages/instructor/instructors-page';
import InstructorPage from './pages/instructor/instructor-page';
import InstructorTermDetails from './pages/instructor/instructor-term-details';
import InstructorRoster from './pages/instructor/instructor-roster';

import { useSession } from '@/hooks/session-context';
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

  // Don't render anything substantive while loading
  if (isLoading) {
    // Return an empty div or fragment
    // The loading screen is shown via the LoadingProvider
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
        <Route path="student-lookup" element={<StudentLookup />} />
        <Route path="class-roster" element={<ClassRosterPage />} />
        {/* <Route path="student-info" element={<StudentPage mNumber={"M10000000"} />} /> */}
        <Route path="reports" element={<Reports />}>
          <Route path="students" element={<StudentsReport />} />
        </Route>
        <Route path="cobis-tools" element={<CobisTools />}>
          <Route path="query-builder" element={<QueryBuilderPage />} />
          <Route path="imports" element={<CsvImport />} />
        </Route>
        <Route path="test-page" element={<TestPage />} />
        <Route path="/professor-stats" element={<ProfessorPage />} />

        {/* Instructor Pages */}
        <Route path="/instructors" element={<InstructorsPage />} />
        <Route path="/instructors/:mnumber" element={<InstructorPage />} />
        <Route path="/instructors/:mnumber/:yearTerm" element={<InstructorTermDetails />} />
        <Route path="/instructors/:mnumber/:yearTerm/:courseId" element={<InstructorRoster />} />
      </Route>
      <Route path="/login" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
