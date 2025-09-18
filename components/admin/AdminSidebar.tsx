import React from 'react';
// FIX: Replaced namespace import with a named import for 'react-router-dom' to resolve module resolution errors.
import { NavLink } from 'react-router-dom';
import { LayoutGrid, ShoppingBag, Settings, Home, Users, Gift, Feather, CheckSquare, FileText, MessageSquare, UserPlus, DollarSign, BookOpen, Star, Truck, X } from 'lucide-react';
import { useCommunication } from '../../contexts/admin/CommunicationContext.tsx';
// FIX: Added .tsx extension to resolve module error.
import { useAuth } from '../../contexts/AuthContext.tsx';

interface NavItemProps {
  to: string, 
  icon: React.ReactNode, 
  label: string, 
  badgeCount?: number, 
  end?: boolean 
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, badgeCount, end, onClick }) => {
  const activeLinkClass = "bg-blue-600 text-white";
  const inactiveLinkClass = "text-gray-300 hover:bg-gray-700 hover:text-white";
  return (
     <NavLink
        to={to}
        end={end}
        onClick={onClick}
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

interface AdminSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, setIsOpen }) => {
  const { supportTickets, joinRequests } = useCommunication();
  const { currentUser } = useAuth();
  const role = currentUser?.role;

  const newTicketsCount = supportTickets.filter(t => t.status === 'جديدة').length;
  const newRequestsCount = joinRequests.filter(r => r.status === 'جديد').length;

  const handleLinkClick = () => {
    if (window.innerWidth < 768) { // md breakpoint
        setIsOpen(false);
    }
  };
  
  const renderInstructorSidebar = () => (
    <>
       <NavItem to="/admin" end label="لوحة التحكم" icon={<LayoutGrid size={20} />} onClick={handleLinkClick} />
    </>
  );

  const renderAdminSidebar = () => (
    <>
      <NavItem to="/admin" end label="لوحة التحكم" icon={<LayoutGrid size={20} />} onClick={handleLinkClick}/>

      {role === 'super_admin' && (
        <>
          <SectionTitle title="الإدارة العامة" />
          <NavItem to="/admin/users" label="المستخدمون" icon={<Users size={20} />} onClick={handleLinkClick}/>
          <NavItem to="/admin/settings" icon={<Settings size={20}/>} label="إعدادات الموقع" onClick={handleLinkClick}/>
        </>
      )}

      {(role === 'super_admin' || role === 'enha_lak_supervisor') && (
          <>
              <SectionTitle title="مشروع إنها لك" />
              <NavItem to="/admin/orders" label="الطلبات" icon={<ShoppingBag size={20} />} onClick={handleLinkClick}/>
              <NavItem to="/admin/subscriptions" label="الاشتراكات" icon={<Star size={20} />} onClick={handleLinkClick}/>
              <NavItem to="/admin/personalized-products" label="إدارة المنتجات" icon={<Gift size={20} />} onClick={handleLinkClick}/>
              <NavItem to="/admin/prices" label="إدارة الأسعار" icon={<DollarSign size={20} />} onClick={handleLinkClick}/>
              <NavItem to="/admin/shipping" label="إدارة الشحن" icon={<Truck size={20} />} onClick={handleLinkClick}/>
          </>
      )}
      
      {(role === 'super_admin' || role === 'creative_writing_supervisor') && (
         <>
              <SectionTitle title="برنامج بداية الرحلة" />
              <NavItem to="/admin/creative-writing" label="إدارة الحجوزات" icon={<CheckSquare size={20} />} onClick={handleLinkClick}/>
              <NavItem to="/admin/instructors" label="إدارة المدربين" icon={<Feather size={20} />} onClick={handleLinkClick}/>
         </>
      )}

      {(role === 'super_admin' || role === 'content_editor') && (
         <>
              <SectionTitle title="إدارة المحتوى" />
              <NavItem to="/admin/content-management" label="محتوى الصفحات" icon={<FileText size={20} />} onClick={handleLinkClick}/>
              <NavItem to="/admin/blog" label="المدونة" icon={<BookOpen size={20} />} onClick={handleLinkClick}/>
         </>
      )}
      
       {(role === 'super_admin' || role === 'support_agent') && (
         <>
            <SectionTitle title="التواصل" />
            <NavItem to="/admin/support" icon={<MessageSquare size={20}/>} label="رسائل الدعم" badgeCount={newTicketsCount} onClick={handleLinkClick}/>
            <NavItem to="/admin/join-requests" icon={<UserPlus size={20}/>} label="طلبات الانضمام" badgeCount={newRequestsCount} onClick={handleLinkClick}/>
         </>
       )}
    </>
  );

  return (
     <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      ></div>

      {/* Sidebar */}
      <aside 
        className={`bg-gray-800 text-white flex flex-col w-64 flex-shrink-0 transition-transform duration-300 ease-in-out z-40
        md:relative md:translate-x-0
        fixed inset-y-0 rtl:right-0 ltr:left-0 
        ${isOpen ? 'translate-x-0' : 'rtl:translate-x-full ltr:-translate-x-full'}`}
      >
        <div className="h-20 flex items-center justify-between px-4 bg-gray-900 flex-shrink-0">
          <h1 className="text-xl font-bold">لوحة التحكم</h1>
          <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setIsOpen(false)}>
            <span className="sr-only">إغلاق القائمة</span>
            <X size={24} />
          </button>
        </div>
        <nav className="flex-grow px-2 py-4 overflow-y-auto">
          {role === 'instructor' ? renderInstructorSidebar() : renderAdminSidebar()}
        </nav>
        <div className="px-4 py-4 border-t border-gray-700 flex-shrink-0">
          <NavLink to="/" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white">
              <Home size={20} />
              <span>العودة للموقع</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;