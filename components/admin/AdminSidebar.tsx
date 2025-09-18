import React from 'react';
// FIX: Replaced namespace import with a named import for 'react-router-dom' to resolve module resolution errors.
import { NavLink } from 'react-router-dom';
import { LayoutGrid, ShoppingBag, Settings, Home, Users, Gift, Feather, CheckSquare, FileText, MessageSquare, UserPlus, DollarSign, BookOpen, Star, Truck, X, ChevronsLeft, ChevronsRight } from 'lucide-react';
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
  isCollapsed: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, badgeCount, end, onClick, isCollapsed }) => {
  const activeLinkClass = "bg-blue-600 text-white";
  const inactiveLinkClass = "text-gray-300 hover:bg-gray-700 hover:text-white";
  return (
     <NavLink
        to={to}
        end={end}
        onClick={onClick}
        title={isCollapsed ? label : undefined}
        className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full text-right mb-1 ${isActive ? activeLinkClass : inactiveLinkClass} ${isCollapsed ? 'justify-center' : ''}`}
      >
        {icon}
        {!isCollapsed && <span className="flex-1">{label}</span>}
        {!isCollapsed && badgeCount && badgeCount > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {badgeCount}
          </span>
        )}
      </NavLink>
  );
};

const SectionTitle: React.FC<{title: string; isCollapsed: boolean}> = ({ title, isCollapsed }) => {
    if (isCollapsed) {
        return <hr className="my-4 border-gray-700 mx-auto w-1/2" />;
    }
    return <div className="px-4 pt-4 pb-2 text-xs font-bold uppercase text-gray-500">{title}</div>;
};

interface AdminSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }) => {
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
       <NavItem to="/admin" end label="لوحة التحكم" icon={<LayoutGrid size={20} />} onClick={handleLinkClick} isCollapsed={isCollapsed} />
    </>
  );

  const renderAdminSidebar = () => (
    <>
      <NavItem to="/admin" end label="لوحة التحكم" icon={<LayoutGrid size={20} />} onClick={handleLinkClick} isCollapsed={isCollapsed}/>

      {role === 'super_admin' && (
        <>
          <SectionTitle title="الإدارة العامة" isCollapsed={isCollapsed} />
          <NavItem to="/admin/users" label="المستخدمون" icon={<Users size={20} />} onClick={handleLinkClick} isCollapsed={isCollapsed}/>
          <NavItem to="/admin/settings" icon={<Settings size={20}/>} label="إعدادات الموقع" onClick={handleLinkClick} isCollapsed={isCollapsed}/>
        </>
      )}

      {(role === 'super_admin' || role === 'enha_lak_supervisor') && (
          <>
              <SectionTitle title="مشروع إنها لك" isCollapsed={isCollapsed} />
              <NavItem to="/admin/orders" label="الطلبات" icon={<ShoppingBag size={20} />} onClick={handleLinkClick} isCollapsed={isCollapsed}/>
              <NavItem to="/admin/subscriptions" label="الاشتراكات" icon={<Star size={20} />} onClick={handleLinkClick} isCollapsed={isCollapsed}/>
              <NavItem to="/admin/personalized-products" label="إدارة المنتجات" icon={<Gift size={20} />} onClick={handleLinkClick} isCollapsed={isCollapsed}/>
              <NavItem to="/admin/prices" label="إدارة الأسعار" icon={<DollarSign size={20} />} onClick={handleLinkClick} isCollapsed={isCollapsed}/>
              <NavItem to="/admin/shipping" label="إدارة الشحن" icon={<Truck size={20} />} onClick={handleLinkClick} isCollapsed={isCollapsed}/>
          </>
      )}
      
      {(role === 'super_admin' || role === 'creative_writing_supervisor') && (
         <>
              <SectionTitle title="برنامج بداية الرحلة" isCollapsed={isCollapsed} />
              <NavItem to="/admin/creative-writing" label="إدارة الحجوزات" icon={<CheckSquare size={20} />} onClick={handleLinkClick} isCollapsed={isCollapsed}/>
              <NavItem to="/admin/instructors" label="إدارة المدربين" icon={<Feather size={20} />} onClick={handleLinkClick} isCollapsed={isCollapsed}/>
         </>
      )}

      {(role === 'super_admin' || role === 'content_editor') && (
         <>
              <SectionTitle title="إدارة المحتوى" isCollapsed={isCollapsed} />
              <NavItem to="/admin/content-management" label="محتوى الصفحات" icon={<FileText size={20} />} onClick={handleLinkClick} isCollapsed={isCollapsed}/>
              <NavItem to="/admin/blog" label="المدونة" icon={<BookOpen size={20} />} onClick={handleLinkClick} isCollapsed={isCollapsed}/>
         </>
      )}
      
       {(role === 'super_admin' || role === 'support_agent') && (
         <>
            <SectionTitle title="التواصل" isCollapsed={isCollapsed} />
            <NavItem to="/admin/support" icon={<MessageSquare size={20}/>} label="رسائل الدعم" badgeCount={newTicketsCount} onClick={handleLinkClick} isCollapsed={isCollapsed}/>
            <NavItem to="/admin/join-requests" icon={<UserPlus size={20}/>} label="طلبات الانضمام" badgeCount={newRequestsCount} onClick={handleLinkClick} isCollapsed={isCollapsed}/>
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
        className={`bg-gray-800 text-white flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out z-40
        md:translate-x-0
        fixed inset-y-0 rtl:right-0 ltr:left-0 
        ${isOpen ? 'translate-x-0' : 'rtl:translate-x-full ltr:-translate-x-full'}
        ${isCollapsed ? 'md:w-20' : 'md:w-64'}`}
      >
        <div className={`h-20 flex items-center bg-gray-900 flex-shrink-0 transition-all duration-300 ${isCollapsed ? 'justify-center' : 'justify-between px-4'}`}>
          {!isCollapsed && <h1 className="text-xl font-bold">لوحة التحكم</h1>}
          <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setIsOpen(false)}>
            <span className="sr-only">إغلاق القائمة</span>
            <X size={24} />
          </button>
        </div>
        <nav className="flex-grow px-2 py-4 overflow-y-auto">
          {role === 'instructor' ? renderInstructorSidebar() : renderAdminSidebar()}
        </nav>
        <div className="px-2 py-4 border-t border-gray-700 flex-shrink-0">
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className="hidden md:flex items-center gap-3 w-full px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white mb-1"
            title={isCollapsed ? 'توسيع القائمة' : 'تقليص القائمة'}
          >
            {isCollapsed ? <ChevronsRight size={20} className="mx-auto" /> : <ChevronsLeft size={20} />}
            {!isCollapsed && <span>تقليص القائمة</span>}
          </button>
          <NavItem to="/" icon={<Home size={20} />} label="العودة للموقع" onClick={handleLinkClick} isCollapsed={isCollapsed}/>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;