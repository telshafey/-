

import React, { Suspense } from 'react';
// FIX: Replaced named imports with a namespace import for 'react-router-dom' to resolve module resolution errors.
import * as ReactRouterDOM from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import PageLoader from '../ui/PageLoader';
// FIX: Added .tsx extension to resolve module error.
import { useAuth, UserProfile } from '../../contexts/AuthContext.tsx';

// Lazy load all admin pages
// FIX: Add .tsx extension to all lazy-loaded admin page components to resolve module loading errors.
const AdminDashboardPage = React.lazy(() => import('../../pages/admin/AdminDashboardPage.tsx'));
const AdminOrdersPage = React.lazy(() => import('../../pages/admin/AdminOrdersPage.tsx'));
const AdminProductsPage = React.lazy(() => import('../../pages/admin/AdminProductsPage.tsx'));
const AdminSettingsPage = React.lazy(() => import('../../pages/admin/AdminSettingsPage.tsx'));
const AdminUsersPage = React.lazy(() => import('../../pages/admin/AdminUsersPage.tsx'));
const AdminPersonalizedProductsPage = React.lazy(() => import('../../pages/admin/AdminPersonalizedProductsPage.tsx'));
const AdminCreativeWritingPage = React.lazy(() => import('../../pages/admin/AdminCreativeWritingPage.tsx'));
const AdminInstructorsPage = React.lazy(() => import('../../pages/admin/AdminInstructorsPage.tsx'));
const AdminContentManagementPage = React.lazy(() => import('../../pages/admin/AdminContentManagementPage.tsx'));
const AdminSupportPage = React.lazy(() => import('../../pages/admin/AdminSupportPage.tsx'));
const AdminJoinRequestsPage = React.lazy(() => import('../../pages/admin/AdminJoinRequestsPage.tsx'));
const AdminBlogPage = React.lazy(() => import('../../pages/admin/AdminBlogPage.tsx'));
const AdminSubscriptionsPage = React.lazy(() => import('../../pages/admin/AdminSubscriptionsPage.tsx'));
const InstructorDashboardPage = React.lazy(() => import('../../pages/admin/InstructorDashboardPage.tsx'));
const AdminShippingPage = React.lazy(() => import('../../pages/admin/AdminShippingPage.tsx'));


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
            <ReactRouterDOM.Route path="subscriptions" element={<RoleBasedRoute allowedRoles={['super_admin', 'enha_lak_supervisor']}><AdminSubscriptionsPage /></RoleBasedRoute>} />
            <ReactRouterDOM.Route path="personalized-products" element={<RoleBasedRoute allowedRoles={['super_admin', 'enha_lak_supervisor']}><AdminPersonalizedProductsPage /></RoleBasedRoute>} />
            <ReactRouterDOM.Route path="prices" element={<RoleBasedRoute allowedRoles={['super_admin', 'enha_lak_supervisor']}><AdminProductsPage /></RoleBasedRoute>} />
            <ReactRouterDOM.Route path="shipping" element={<RoleBasedRoute allowedRoles={['super_admin', 'enha_lak_supervisor']}><AdminShippingPage /></RoleBasedRoute>} />
            <ReactRouterDOM.Route path="content-management" element={<RoleBasedRoute allowedRoles={['super_admin', 'enha_lak_supervisor']}><AdminContentManagementPage /></RoleBasedRoute>} />
            <ReactRouterDOM.Route path="blog" element={<RoleBasedRoute allowedRoles={['super_admin', 'enha_lak_supervisor']}><AdminBlogPage /></RoleBasedRoute>} />
            
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