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
import { ClassRosterPage } from './pages/ClassRoster';

// Instructor Imports
import { InstructorsPage } from './pages/instructors';
import { InstructorPage } from './pages/instructors/[instructorId]';
import { TermDetails } from './pages/instructors/[instructorId]/term-details';
import { CourseRosterPage } from './pages/instructors/[instructorId]/roster';

// Enrollment Imports
import { EnrollmentPage } from './pages/enrollment';
import { ProgramsPage } from './pages/enrollment/programs';
import { CoursesPage } from './pages/enrollment/courses';
import { FacultyPage } from './pages/enrollment/faculty';

import { AdvisedStudentsPage } from './pages/AdvisorPage';
import { UserList } from './pages/UserPage';

// Context/Provider Imports
import { useSession } from '@/context/session';
import { useRoleContext } from '@/context/role';
import ProtectedRoute from '@/components/auth/protected-route';

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
          <Route path="instructors/:mnumber/:yearTerm" element={<TermDetails />} />
          <Route path="instructors/:mnumber/:yearTerm/:courseId" element={<CourseRosterPage />} />
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
            <AdvisedStudentsPage />
          </ProtectedRoute>
        } />

        {/* Enrollment Page: Use permissions from context */}
        <Route element={<ProtectedRoute allowedRoles={routePermissions['/enrollment'] || []} />}>
          <Route path="enrollment" element={<EnrollmentPage />}>
            <Route index element={<Navigate to="programs" replace />} />
            <Route path="programs" element={<ProgramsPage />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="faculty" element={<FacultyPage />} />
          </Route>
        </Route>

        {/* Catch-all inside Layout */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};