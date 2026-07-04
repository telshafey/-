import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PageLoader from './components/ui/PageLoader';

const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const SessionReportPage = lazy(() => import('./pages/admin/instructor/SessionReportPage'));

const AppRoutes: React.FC = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path="/login" element={<AdminLoginPage />} />
      <Route path="/session-report/:sessionId" element={<ProtectedRoute adminOnly><SessionReportPage /></ProtectedRoute>} />
      <Route path="/*" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;
