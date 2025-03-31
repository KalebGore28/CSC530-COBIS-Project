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

import { useSession } from '@/hooks/session-context';

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

  if (!session.is_enabled) {
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
        <Route path="reports" element={<Reports />}>
          <Route path="students" element={<StudentsReport />} />
        </Route>
        <Route path="cobis-tools" element={<CobisTools />}>
          <Route path="query-builder" element={<QueryBuilderPage />} />
          <Route path="imports" element={<CsvImport />} />
        </Route>
        <Route path="test-page" element={<TestPage />} />
      </Route>
      <Route path="/login" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
