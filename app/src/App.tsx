import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/Login';
import Layout from './Layout';
import Reports from './pages/Reports';
import StudentsReport from './pages/StudentsReport';
import QueryBuilderPage from './pages/QueryBuilder';
import CobisTools from './pages/CobisTools';
import { CsvImport } from './pages/CsvImport';
import TestPage from './pages/TestPage';
import WaitingPage from './pages/Waiting';
import OnboardingPage from './pages/Onboarding';
import StudentLookup from './pages/StudentLookup';

import ProfessorPage from './pages/ProfessorPage';
import { useSession } from '@/hooks/session-context';
import ClassRosterPage from './pages/ClassRoster';

import InstructorsPage from './pages/instructor/instructors-page';
import InstructorPage from './pages/instructor/instructor-page';
import InstructorTermDetails from './pages/instructor/instructor-term-details';
import InstructorRoster from './pages/instructor/instructor-roster';

export const App: React.FC = () => {
  const { session, isLoading, refetchSession } = useSession();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  if (!session.isEnabled) {
    return <WaitingPage />;
  }

  if (!session.mnumber) {
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
