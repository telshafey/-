import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminDashboardPage from '../../pages/admin/AdminDashboardPage';
import AdminOrdersPage from '../../pages/admin/AdminOrdersPage';
import AdminSettingsPage from '../../pages/admin/AdminSettingsPage';
import AdminUsersPage from '../../pages/admin/AdminUsersPage';
import AdminPersonalizedProductsPage from '../../pages/admin/AdminPersonalizedProductsPage';
import AdminCreativeWritingPage from '../../pages/admin/AdminCreativeWritingPage';
import AdminInstructorsPage from '../../pages/admin/AdminInstructorsPage';
import AdminContentManagementPage from '../../pages/admin/AdminContentManagementPage';
import AdminSupportPage from '../../pages/admin/AdminSupportPage';
import AdminJoinRequestsPage from '../../pages/admin/AdminJoinRequestsPage';

const AdminLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-grow p-6 sm:p-8 lg:p-10">
        <Routes>
          <Route index element={<AdminDashboardPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="personalized-products" element={<AdminPersonalizedProductsPage />} />
          <Route path="content-management" element={<AdminContentManagementPage />} />
          <Route path="creative-writing" element={<AdminCreativeWritingPage />} />
          <Route path="instructors" element={<AdminInstructorsPage />} />
          <Route path="support" element={<AdminSupportPage />} />
          <Route path="join-requests" element={<AdminJoinRequestsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminLayout;