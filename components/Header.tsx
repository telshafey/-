


import React, { useState, useRef, useEffect, useMemo } from 'react';
// FIX: Replaced the 'react-router-dom' namespace import with named imports to resolve component and hook resolution errors, and updated the code to use them directly.
import { Link, NavLink, useLocation } from 'react-router-dom';
// FIX: Imported the 'Users' icon from 'lucide-react' to resolve 'Cannot find name' errors.
import { User, Menu, X, ShieldCheck, Send, HelpCircle, Briefcase, Gift, Home, LogOut, Feather, ArrowRightLeft, LayoutDashboard, BookOpen, Star, Book, Target, Users } from 'lucide-react';
// FIX: Added .tsx extension to resolve module error.
import { useAuth } from '../contexts/AuthContext.tsx';
import { useProduct } from '../contexts/ProductContext';

// FIX: Defined NavLink interface to make the 'icon' property optional, resolving type errors.
interface NavLink {
  name: string;
  path: string;
  icon?: React.ReactNode;
  mobileIcon?: React.ReactNode;
}

const enhaLakLinks: NavLink[] = [
  { name: 'الرئيسية', path: '/enha-lak', mobileIcon: <Home size={18} /> },
  { name: 'المتجر', path: '/store', mobileIcon: <Gift size={18} /> },
  { name: 'الاشتراك الشهري', path: '/subscription', icon: <Star className="text-yellow-500" size={16}/>, mobileIcon: <Star size={18} /> },
];

const creativeWritingLinks: NavLink[] = [
    { name: 'الرئيسية', path: '/creative-writing', mobileIcon: <Home size={18} /> },
    { name: 'عن البرنامج', path: '/creative-writing/about', mobileIcon: <Target size={18} /> },
    { name: 'المنهج', path: '/creative-writing/curriculum', mobileIcon: <Book size={18} /> },
    { name: 'المدربون', path: '/creative-writing/instructors', mobileIcon: <Users size={18} /> },
    { name: 'الباقات', path: '/creative-writing/booking', mobileIcon: <Gift size={18} /> },
];

const sharedLinks: NavLink[] = [
    { name: 'المدونة', path: '/blog', mobileIcon: <BookOpen size={18} /> },
    { name: 'عنا', path: '/about', mobileIcon: <Users size={18} /> },
    { name: 'الدعم', path: '/support', mobileIcon: <HelpCircle size={18} /> },
];


const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const { hasAdminAccess, currentUser, signOut } = useAuth();
  const { siteBranding, loading } = useProduct();
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const getCurrentSection = () => {
      const { pathname } = location;
      if (pathname.startsWith('/creative-writing') || pathname.startsWith('/instructor') || pathname.startsWith('/session') || pathname.startsWith('/student')) {
          return 'creative-writing';
      }
      if (pathname === '/') {
          return 'portal';
      }
      // Shared pages should default to the 'enha-lak' branding, or we can add a specific condition if needed
      return 'enha-lak';
  }

  const currentSection = getCurrentSection();
  const sectionSpecificLinks = currentSection === 'enha-lak' ? enhaLakLinks : creativeWritingLinks;
  const navLinks = [...sectionSpecificLinks, ...sharedLinks];
  const homePath = currentSection === 'enha-lak' ? '/enha-lak' : '/creative-writing';

  const { logoUrl, logoAlt, isLoading } = useMemo(() => {
    if (loading || !siteBranding) {
        return { logoUrl: '', logoAlt: '', isLoading: true };
    }
    if (currentSection === 'creative-writing') {
        return {
            logoUrl: siteBranding.creativeWritingLogoUrl,
            logoAlt: 'شعار برنامج بداية الرحلة',
            isLoading: false
        };
    }
    return {
        logoUrl: siteBranding.logoUrl,
        logoAlt: 'شعار منصة إنها لك',
        isLoading: false
    };
  }, [currentSection, siteBranding, loading]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeLinkClass = "text-blue-500 font-bold";
  const inactiveLinkClass = "text-gray-600 hover:text-blue-500 transition-colors";

  const AccountMenu: React.FC = () => (
    <div ref={accountMenuRef} className="relative">
        <button 
            onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
            className="flex items-center justify-center h-10 w-10 text-gray-600 hover:text-blue-500 transition-colors bg-gray-100 hover:bg-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
            <span className="sr-only">حسابي</span>
            <User size={20} />
        </button>

        {isAccountMenuOpen && (
            <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 z-50 animate-fadeIn">
                <div className="py-1">
                    {currentUser ? (
                        <>
                            <div className="px-4 py-3 border-b">
                                <p className="text-sm font-semibold text-gray-800">{currentUser.name}</p>
                                <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                            </div>
                            <NavLink to="/account" onClick={() => setIsAccountMenuOpen(false)} className="flex items-center gap-3 w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <User size={16} /> حسابي
                            </NavLink>
                            {hasAdminAccess && (
                                <NavLink to="/admin" onClick={() => setIsAccountMenuOpen(false)} className="flex items-center gap-3 w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                    <ShieldCheck size={16} /> لوحة التحكم
                                </NavLink>
                            )}
                             <button onClick={() => { signOut(); setIsAccountMenuOpen(false); }} className="flex items-center gap-3 w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                               <LogOut size={16} /> تسجيل الخروج
                            </button>
                        </>
                    ) : (
                        <NavLink to="/account" onClick={() => setIsAccountMenuOpen(false)} className="flex items-center gap-3 w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            <User size={16} /> تسجيل الدخول
                        </NavLink>
                    )}
                </div>
            </div>
        )}
    </div>
  );
  
  if (currentSection === 'portal' && location.pathname === '/') {
      return null; // No header on the portal page, but show on blog
  }

  const SwitchSectionButton: React.FC = () => {
    if (currentSection === 'enha-lak') {
      return (
        <Link to="/creative-writing" className="flex items-center justify-center gap-2 px-5 py-2 border border-purple-600 text-base font-medium rounded-full text-purple-600 bg-white hover:bg-purple-50 transition-transform transform hover:scale-105">
          <Feather size={16} />
          <span>الكتابة الإبداعية</span>
        </Link>
      );
    }
    return (
      <Link to="/enha-lak" className="flex items-center justify-center gap-2 px-5 py-2 border border-blue-600 text-base font-medium rounded-full text-blue-600 bg-white hover:bg-blue-50 transition-transform transform hover:scale-105">
        <Gift size={16} />
        <span>قصص "إنها لك"</span>
      </Link>
    );
  };
  
  const MobileSwitchButton: React.FC = () => {
    if (currentSection === 'enha-lak') {
        return (
             <NavLink to="/creative-writing" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-purple-600 hover:bg-purple-700">
                <Feather size={18} />
                <span>الانتقال للكتابة الإبداعية</span>
            </NavLink>
        );
    }
    return (
        <NavLink to="/enha-lak" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700">
            <Gift size={18} />
            <span>تصفح قصص "إنها لك"</span>
        </NavLink>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-4">
            <Link to={homePath}>
              {isLoading ? (
                 <div className="h-16 w-32 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <img className="h-16 w-auto" src={logoUrl || ''} alt={logoAlt} />
              )}
            </Link>
             <Link to="/" className="hidden sm:flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600">
                <LayoutDashboard size={16} />
                <span>البوابة الرئيسية</span>
            </Link>
          </div>
          <nav className="hidden lg:flex items-center space-x-6 rtl:space-x-reverse">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) => `flex items-center gap-2 whitespace-nowrap ${isActive ? activeLinkClass : inactiveLinkClass}`}
              >
                {link.icon} {link.name}
              </NavLink>
            ))}
          </nav>
          <div className="hidden md:flex items-center space-x-4 rtl:space-x-reverse">
            {currentSection !== 'portal' && <SwitchSectionButton />}
            <AccountMenu />
          </div>
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'}`}
              >
                {link.mobileIcon}
                <span>{link.name}</span>
              </NavLink>
            ))}
            <div className="border-t my-2"></div>
            {currentSection !== 'portal' && <MobileSwitchButton />}
             <NavLink to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600">
                <LayoutDashboard size={18} />
                <span>البوابة الرئيسية</span>
            </NavLink>
            
            {hasAdminAccess && (
               <>
                <div className="border-t my-2"></div>
               <NavLink to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-700 hover:bg-red-50 hover:text-red-600">
                <ShieldCheck size={18} />
                <span>لوحة التحكم</span>
               </NavLink>
               </>
            )}
            <NavLink to="/account" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600">
                <User size={18} />
                <span>حسابي</span>
            </NavLink>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
