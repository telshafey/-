import React, { Suspense, useState } from 'react';
// FIX: Replaced namespace import with named imports for 'react-router-dom' to resolve module resolution errors.
import { Navigate, Route, Routes } from 'react-router-dom';
import AdminSidebar from './AdminSidebar.tsx';
import PageLoader from '../ui/PageLoader.tsx';
// FIX: Added .tsx extension to resolve module error.
import { useAuth, UserProfile } from '../../contexts/AuthContext.tsx';
import { Menu } from 'lucide-react';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile overlay
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // For desktop collapse

  let routesContent;

  if (currentUser?.role === 'instructor') {
      routesContent = (
          <Routes>
              <Route path="/*" element={<InstructorDashboardPage />} />
          </Routes>
      );
  } else {
      routesContent = (
          <Routes>
              <Route index element={<AdminDashboardPage />} />
              <Route path="users" element={<RoleBasedRoute allowedRoles={['super_admin']}><AdminUsersPage /></RoleBasedRoute>} />
              <Route path="settings" element={<RoleBasedRoute allowedRoles={['super_admin']}><AdminSettingsPage /></RoleBasedRoute>} />
              <Route path="orders" element={<RoleBasedRoute allowedRoles={['super_admin', 'enha_lak_supervisor']}><AdminOrdersPage /></RoleBasedRoute>} />
              <Route path="subscriptions" element={<RoleBasedRoute allowedRoles={['super_admin', 'enha_lak_supervisor']}><AdminSubscriptionsPage /></RoleBasedRoute>} />
              <Route path="personalized-products" element={<RoleBasedRoute allowedRoles={['super_admin', 'enha_lak_supervisor']}><AdminPersonalizedProductsPage /></RoleBasedRoute>} />
              <Route path="prices" element={<RoleBasedRoute allowedRoles={['super_admin', 'enha_lak_supervisor']}><AdminProductsPage /></RoleBasedRoute>} />
              <Route path="shipping" element={<RoleBasedRoute allowedRoles={['super_admin', 'enha_lak_supervisor']}><AdminShippingPage /></RoleBasedRoute>} />
              <Route path="creative-writing" element={<RoleBasedRoute allowedRoles={['super_admin', 'creative_writing_supervisor']}><AdminCreativeWritingPage /></RoleBasedRoute>} />
              <Route path="instructors" element={<RoleBasedRoute allowedRoles={['super_admin', 'creative_writing_supervisor']}><AdminInstructorsPage /></RoleBasedRoute>} />
              
              {/* New granular routes */}
              <Route path="content-management" element={<RoleBasedRoute allowedRoles={['super_admin', 'content_editor']}><AdminContentManagementPage /></RoleBasedRoute>} />
              <Route path="blog" element={<RoleBasedRoute allowedRoles={['super_admin', 'content_editor']}><AdminBlogPage /></RoleBasedRoute>} />
              <Route path="support" element={<RoleBasedRoute allowedRoles={['super_admin', 'support_agent']}><AdminSupportPage /></RoleBasedRoute>} />
              <Route path="join-requests" element={<RoleBasedRoute allowedRoles={['super_admin', 'support_agent']}><AdminJoinRequestsPage /></RoleBasedRoute>} />
          </Routes>
      );
  }

  return (
    <div className="flex h-screen bg-gray-100">
        <AdminSidebar 
          isOpen={isSidebarOpen} 
          setIsOpen={setIsSidebarOpen} 
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'md:mr-20' : 'md:mr-64'}`}>
             <header className="md:hidden sticky top-0 bg-white shadow-sm z-20 flex items-center justify-between p-4 border-b">
                <h1 className="text-lg font-bold">لوحة التحكم</h1>
                <button onClick={() => setIsSidebarOpen(true)} className="text-gray-700">
                    <Menu size={24} />
                </button>
            </header>
            <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10">
                <Suspense fallback={<PageLoader text="جاري تحميل الصفحة..." />}>
                    {routesContent}
                </Suspense>
            </main>
        </div>
    </div>
  );
};

export default AdminLayout;