
import React, { Suspense } from 'react';
// FIX: Replaced the 'react-router-dom' namespace import with named imports to resolve component and hook resolution errors, and updated the code to use them directly.
import { Routes, Route, Navigate } from 'react-router-dom';
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
    return <Navigate to="/admin" replace />; 
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
            <Routes>
              <Route path="/*" element={<InstructorDashboardPage />} />
            </Routes>
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
          <Routes>
            <Route index element={<AdminDashboardPage />} />
            
            <Route path="users" element={<RoleBasedRoute allowedRoles={['super_admin']}><AdminUsersPage /></RoleBasedRoute>} />
            <Route path="settings" element={<RoleBasedRoute allowedRoles={['super_admin']}><AdminSettingsPage /></RoleBasedRoute>} />

            <Route path="orders" element={<RoleBasedRoute allowedRoles={['super_admin', 'enha_lak_supervisor']}><AdminOrdersPage /></RoleBasedRoute>} />
            <Route path="subscriptions" element={<RoleBasedRoute allowedRoles={['super_admin', 'enha_lak_supervisor']}><AdminSubscriptionsPage /></RoleBasedRoute>} />
            <Route path="personalized-products" element={<RoleBasedRoute allowedRoles={['super_admin', 'enha_lak_supervisor']}><AdminPersonalizedProductsPage /></RoleBasedRoute>} />
            <Route path="prices" element={<RoleBasedRoute allowedRoles={['super_admin', 'enha_lak_supervisor']}><AdminProductsPage /></RoleBasedRoute>} />
            <Route path="shipping" element={<RoleBasedRoute allowedRoles={['super_admin', 'enha_lak_supervisor']}><AdminShippingPage /></RoleBasedRoute>} />
            <Route path="content-management" element={<RoleBasedRoute allowedRoles={['super_admin', 'enha_lak_supervisor']}><AdminContentManagementPage /></RoleBasedRoute>} />
            <Route path="blog" element={<RoleBasedRoute allowedRoles={['super_admin', 'enha_lak_supervisor']}><AdminBlogPage /></RoleBasedRoute>} />
            
            <Route path="creative-writing" element={<RoleBasedRoute allowedRoles={['super_admin', 'creative_writing_supervisor']}><AdminCreativeWritingPage /></RoleBasedRoute>} />
            <Route path="instructors" element={<RoleBasedRoute allowedRoles={['super_admin', 'creative_writing_supervisor']}><AdminInstructorsPage /></RoleBasedRoute>} />
            
            <Route path="support" element={<RoleBasedRoute allowedRoles={['super_admin', 'enha_lak_supervisor', 'creative_writing_supervisor']}><AdminSupportPage /></RoleBasedRoute>} />
            <Route path="join-requests" element={<RoleBasedRoute allowedRoles={['super_admin', 'enha_lak_supervisor', 'creative_writing_supervisor']}><AdminJoinRequestsPage /></RoleBasedRoute>} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
};

export default AdminLayout;
