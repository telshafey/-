
import React, { Suspense } from 'react';
// FIX: Switched to namespace import for react-router-dom to fix module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import PageLoader from '../ui/PageLoader';
// FIX: Added .tsx extension to resolve module error.
import { useAuth, UserProfile } from '../../contexts/AuthContext.tsx';

// Lazy load all admin pages
const AdminDashboardPage = React.lazy(() => import('../../pages/admin/AdminDashboardPage'));
const AdminOrdersPage = React.lazy(() => import('../../pages/admin/AdminOrdersPage'));
const AdminProductsPage = React.lazy(() => import('../../pages/admin/AdminProductsPage'));
const AdminSettingsPage = React.lazy(() => import('../../pages/admin/AdminSettingsPage'));
const AdminUsersPage = React.lazy(() => import('../../pages/admin/AdminUsersPage'));
const AdminPersonalizedProductsPage = React.lazy(() => import('../../pages/admin/AdminPersonalizedProductsPage'));
const AdminCreativeWritingPage = React.lazy(() => import('../../pages/admin/AdminCreativeWritingPage'));
const AdminInstructorsPage = React.lazy(() => import('../../pages/admin/AdminInstructorsPage'));
const AdminContentManagementPage = React.lazy(() => import('../../pages/admin/AdminContentManagementPage'));
const AdminSupportPage = React.lazy(() => import('../../pages/admin/AdminSupportPage'));
const AdminJoinRequestsPage = React.lazy(() => import('../../pages/admin/AdminJoinRequestsPage'));
const InstructorDashboardPage = React.lazy(() => import('../../pages/admin/InstructorDashboardPage'));


const RoleBasedRoute: React.FC<{ children: React.ReactElement, allowedRoles: UserProfile['role'][] }> = ({ children, allowedRoles }) => {
    const { currentUser } = useAuth();
    if (currentUser && allowedRoles.includes(currentUser.role)) {
        return children;
    }
    return <ReactRouterDOM.Navigate to="/admin" replace />; 
};

const AdminLayout: React.FC = () => {
  const { currentUser } = useAuth();
  const allAdminRoles: UserProfile['role'][] = ['super_admin', 'enha_lak_supervisor', 'creative_writing_supervisor', 'instructor'];

  // Instructor has a completely separate dashboard and view
  if (currentUser?.role === 'instructor') {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <AdminSidebar />
        <main className="flex-grow p-6 sm:p-8 lg:p-10">
          <Suspense fallback={<PageLoader text="جاري تحميل لوحة التحكم..." />}>
            <ReactRouterDOM.Routes>
              <ReactRouterDOM.Route path="/*" element={<InstructorDashboardPage />} />
            </ReactRouterDOM.Routes>
          </Suspense>
        </main>
      </div>
    );
  }

  // Layout for super_admin and supervisors
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-grow p-6 sm:p-8 lg:p-10">
        <Suspense fallback={<PageLoader text="جاري تحميل الصفحة..." />}>
          <ReactRouterDOM.Routes>
            <ReactRouterDOM.Route index element={<AdminDashboardPage />} />
            
            <ReactRouterDOM.Route path="users" element={<RoleBasedRoute allowedRoles={['super_admin']}><AdminUsersPage /></RoleBasedRoute>} />
            <ReactRouterDOM.Route path="settings" element={<RoleBasedRoute allowedRoles={['super_admin']}><AdminSettingsPage /></RoleBasedRoute>} />

            <ReactRouterDOM.Route path="orders" element={<RoleBasedRoute allowedRoles={['super_admin', 'enha_lak_supervisor']}><AdminOrdersPage /></RoleBasedRoute>} />
            <ReactRouterDOM.Route path="personalized-products" element={<RoleBasedRoute allowedRoles={['super_admin', 'enha_lak_supervisor']}><AdminPersonalizedProductsPage /></RoleBasedRoute>} />
            <ReactRouterDOM.Route path="prices" element={<RoleBasedRoute allowedRoles={['super_admin', 'enha_lak_supervisor']}><AdminProductsPage /></RoleBasedRoute>} />
            <ReactRouterDOM.Route path="content-management" element={<RoleBasedRoute allowedRoles={['super_admin', 'enha_lak_supervisor']}><AdminContentManagementPage /></RoleBasedRoute>} />
            
            <ReactRouterDOM.Route path="creative-writing" element={<RoleBasedRoute allowedRoles={['super_admin', 'creative_writing_supervisor']}><AdminCreativeWritingPage /></RoleBasedRoute>} />
            <ReactRouterDOM.Route path="instructors" element={<RoleBasedRoute allowedRoles={['super_admin', 'creative_writing_supervisor']}><AdminInstructorsPage /></RoleBasedRoute>} />
            
            <ReactRouterDOM.Route path="support" element={<RoleBasedRoute allowedRoles={['super_admin', 'enha_lak_supervisor', 'creative_writing_supervisor']}><AdminSupportPage /></RoleBasedRoute>} />
            <ReactRouterDOM.Route path="join-requests" element={<RoleBasedRoute allowedRoles={['super_admin', 'enha_lak_supervisor', 'creative_writing_supervisor']}><AdminJoinRequestsPage /></RoleBasedRoute>} />
          </ReactRouterDOM.Routes>
        </Suspense>
      </main>
    </div>
  );
};

export default AdminLayout;