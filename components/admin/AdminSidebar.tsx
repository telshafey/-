import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, ShoppingBag, Settings, Home, Users, Gift, Feather, CheckSquare, FileText, MessageSquare, UserPlus } from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';

const adminNavLinks = [
  { name: 'لوحة التحكم', path: '/admin', icon: <LayoutGrid size={20} />, end: true },
  { name: 'الطلبات', path: '/admin/orders', icon: <ShoppingBag size={20} /> },
  { name: 'المستخدمون', path: '/admin/users', icon: <Users size={20} /> },
  { name: 'إدارة المنتجات', path: '/admin/personalized-products', icon: <Gift size={20} /> },
  { name: 'إدارة المحتوى', path: '/admin/content-management', icon: <FileText size={20} /> },
];

const AdminSidebar: React.FC = () => {
  const { supportTickets, joinRequests } = useAdmin();
    
  const activeLinkClass = "bg-blue-600 text-white";
  const inactiveLinkClass = "text-gray-300 hover:bg-gray-700 hover:text-white";

  const newTicketsCount = supportTickets.filter(t => t.status === 'جديدة').length;
  const newRequestsCount = joinRequests.filter(r => r.status === 'جديد').length;


  const NavItem: React.FC<{ to: string, icon: React.ReactNode, label: string, badgeCount?: number, end?: boolean }> = ({ to, icon, label, badgeCount, end }) => (
     <NavLink
        to={to}
        end={end}
        className={({ isActive }) => `flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors w-full text-right mb-2 ${isActive ? activeLinkClass : inactiveLinkClass}`}
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

  return (
    <aside className="w-64 bg-gray-800 text-white flex flex-col flex-shrink-0">
      <div className="h-20 flex items-center justify-center px-4 bg-gray-900">
        <h1 className="text-xl font-bold">لوحة تحكم "إنها لك"</h1>
      </div>
      <nav className="flex-grow px-2 py-4">
        {adminNavLinks.map((link) => (
          <NavItem
            key={link.name}
            to={link.path}
            end={link.end}
            icon={link.icon}
            label={link.name}
          />
        ))}

        <hr className="my-4 border-gray-700" />
        <div className="px-2 text-xs font-bold uppercase text-gray-400 mb-2">التواصل</div>
        <NavItem to="/admin/support" icon={<MessageSquare size={20}/>} label="رسائل الدعم" badgeCount={newTicketsCount}/>
        <NavItem to="/admin/join-requests" icon={<UserPlus size={20}/>} label="طلبات الانضمام" badgeCount={newRequestsCount}/>

        <hr className="my-4 border-gray-700" />
        
        <div className="px-2 text-xs font-bold uppercase text-gray-400 mb-2">برنامج الكتابة الإبداعية</div>
        <NavItem to="/admin/creative-writing" icon={<CheckSquare size={20} />} label="إدارة الحجوزات" />
        <NavItem to="/admin/instructors" icon={<Feather size={20} />} label="إدارة المدربين" />
        
        <hr className="my-4 border-gray-700" />
        
        <NavItem to="/admin/settings" icon={<Settings size={20}/>} label="إعدادات الموقع"/>

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