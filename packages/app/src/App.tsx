import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Page Imports
import { Dashboard } from './pages/Dashboard';
import LoginPage from './pages/auth/login';
import Layout from './Layout';
import CobisTools from './pages/CobisTools';
import CsvImport from './pages/CsvImport';
import WaitingPage from './pages/auth/waiting';
import OnboardingPage from './pages/auth/onboarding';
import { StudentLookup } from './pages/StudentLookup';
import ClassRosterPage from './pages/ClassRoster';
import { InstructorsPage } from './pages/instructors';
import InstructorPage from './pages/instructors/[instructorId]';
import InstructorTermDetails from './pages/instructors/[instructorId]/term-details';
import InstructorRoster from './pages/instructors/[instructorId]/roster';
import AdvisorPage from './pages/AdvisorPage';
import { UserList } from '@/pages/UserPage'; // Adjust path if needed

// Context/Provider Imports
import { useSession } from '@/context/session';
import { useRoleContext } from '@/context/role'; // Import useRoleContext
import ProtectedRoute from '@/components/auth/protected-route'; // Adjust path if needed

export const App: React.FC = () => {
  const { session, refetchSession } = useSession();
  const { routePermissions } = useRoleContext();

  if (!session) return <LoginPage />;
  if (!session.info.isEnabled) return <WaitingPage />;
  if (!session.info.mnumber) return <OnboardingPage refetchSession={refetchSession} />;

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
        <Route path="student-lookup" element={
          <ProtectedRoute allowedRoles={routePermissions['/student-lookup'] || []}>
            <StudentLookup />
          </ProtectedRoute>
        } />

        {/* COBIS Tools: Use permissions from context */}
        <Route element={<ProtectedRoute allowedRoles={routePermissions['/cobis-tools'] || []} />}>
          <Route path="cobis-tools" element={<CobisTools />}>
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

        {/* Catch-all inside Layout */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};