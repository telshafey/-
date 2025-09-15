
import React from 'react';
// FIX: Replaced the 'react-router-dom' namespace import with named imports to resolve component and hook resolution errors, and updated the code to use them directly.
import { NavLink } from 'react-router-dom';
import { LayoutGrid, ShoppingBag, Settings, Home, Users, Gift, Feather, CheckSquare, FileText, MessageSquare, UserPlus, DollarSign, BookOpen, Star, Truck } from 'lucide-react';
import { useCommunication } from '../../contexts/admin/CommunicationContext';
// FIX: Added .tsx extension to resolve module error.
import { useAuth } from '../../contexts/AuthContext.tsx';

const NavItem: React.FC<{ to: string, icon: React.ReactNode, label: string, badgeCount?: number, end?: boolean }> = ({ to, icon, label, badgeCount, end }) => {
  const activeLinkClass = "bg-blue-600 text-white";
  const inactiveLinkClass = "text-gray-300 hover:bg-gray-700 hover:text-white";
  return (
     <NavLink
        to={to}
        end={end}
        className={({ isActive }) => `flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors w-full text-right mb-1 ${isActive ? activeLinkClass : inactiveLinkClass}`}
      >
        <div className="flex items-center gap-3">
          {icon}
          <span>{label}</span>
        </div>
        {badgeCount && badgeCount > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {badgeCount}
          </span>
        )}
      </NavLink>
  );
};

const SectionTitle: React.FC<{title: string}> = ({ title }) => (
    <div className="px-4 pt-4 pb-2 text-xs font-bold uppercase text-gray-500">{title}</div>
);

const AdminSidebar: React.FC = () => {
  const { supportTickets, joinRequests } = useCommunication();
  const { currentUser } = useAuth();
  const role = currentUser?.role;

  const newTicketsCount = supportTickets.filter(t => t.status === 'جديدة').length;
  const newRequestsCount = joinRequests.filter(r => r.status === 'جديد').length;
  
  const renderInstructorSidebar = () => (
    <>
       <NavItem to="/admin" end label="لوحة التحكم" icon={<LayoutGrid size={20} />} />
    </>
  );

  const renderAdminSidebar = () => (
    <>
      <NavItem to="/admin" end label="لوحة التحكم" icon={<LayoutGrid size={20} />} />

      {role === 'super_admin' && (
        <>
          <SectionTitle title="عام" />
          <NavItem to="/admin/users" label="المستخدمون" icon={<Users size={20} />} />
        </>
      )}

      {(role === 'super_admin' || role === 'enha_lak_supervisor') && (
          <>
              <SectionTitle title="مشروع إنها لك" />
              <NavItem to="/admin/orders" label="الطلبات" icon={<ShoppingBag size={20} />} />
              <NavItem to="/admin/subscriptions" label="الاشتراكات" icon={<Star size={20} />} />
              <NavItem to="/admin/personalized-products" label="إدارة المنتجات" icon={<Gift size={20} />} />
              <NavItem to="/admin/prices" label="إدارة الأسعار" icon={<DollarSign size={20} />} />
              <NavItem to="/admin/shipping" label="إدارة الشحن" icon={<Truck size={20} />} />
              <NavItem to="/admin/content-management" label="إدارة المحتوى" icon={<FileText size={20} />} />
              <NavItem to="/admin/blog" label="إدارة المدونة" icon={<BookOpen size={20} />} />
          </>
      )}
      
      {(role === 'super_admin' || role === 'creative_writing_supervisor') && (
         <>
              <SectionTitle title="برنامج بداية الرحلة" />
              <NavItem to="/admin/creative-writing" label="إدارة الحجوزات" icon={<CheckSquare size={20} />} />
              <NavItem to="/admin/instructors" label="إدارة المدربين" icon={<Feather size={20} />} />
         </>
      )}
      
       {(role === 'super_admin' || role === 'enha_lak_supervisor' || role === 'creative_writing_supervisor') && (
         <>
            <SectionTitle title="التواصل" />
            <NavItem to="/admin/support" icon={<MessageSquare size={20}/>} label="رسائل الدعم" badgeCount={newTicketsCount}/>
            <NavItem to="/admin/join-requests" icon={<UserPlus size={20}/>} label="طلبات الانضمام" badgeCount={newRequestsCount}/>
         </>
       )}


      {role === 'super_admin' && (
        <>
          <hr className="my-4 border-gray-700" />
          <NavItem to="/admin/settings" icon={<Settings size={20}/>} label="إعدادات الموقع"/>
        </>
      )}
    </>
  );

  return (
    <aside className="w-64 bg-gray-800 text-white flex flex-col flex-shrink-0">
      <div className="h-20 flex items-center justify-center px-4 bg-gray-900">
        <h1 className="text-xl font-bold">لوحة التحكم</h1>
      </div>
      <nav className="flex-grow px-2 py-4 overflow-y-auto">
        {role === 'instructor' ? renderInstructorSidebar() : renderAdminSidebar()}
      </nav>
       <div className="px-4 py-4 border-t border-gray-700">
         <NavLink to="/" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white">
            <Home size={20} />
            <span>العودة للموقع</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default AdminSidebar;
