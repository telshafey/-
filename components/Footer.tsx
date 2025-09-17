import React, { useMemo } from 'react';
// FIX: Replaced namespace import with named imports for 'react-router-dom' to resolve module resolution errors.
import { Link, useLocation } from 'react-router-dom';
import { Facebook, Twitter, Instagram } from 'lucide-react';
// FIX: Added .tsx extension to useProduct import to resolve module error.
import { useProduct } from '../contexts/ProductContext.tsx';
// FIX: Added .tsx extension to the import of AdminContext to resolve module loading error.
import { useAdmin } from '../contexts/AdminContext.tsx';


const Footer: React.FC = () => {
  const { siteBranding, loading: brandingLoading } = useProduct();
  const { socialLinks, loading: adminLoading } = useAdmin();
  const location = useLocation();

  const isLoading = brandingLoading || adminLoading;

  const getCurrentSection = (pathname: string) => {
    if (pathname === '/') {
        return 'portal';
    }
    if (pathname.startsWith('/creative-writing') || pathname.startsWith('/instructor') || pathname.startsWith('/session')) {
        return 'creative-writing';
    }
    // Default to enha-lak for root, enha-lak pages, and shared pages
    return 'enha-lak';
  };
  
  const currentSection = getCurrentSection(location.pathname);

  const { logoUrl, logoAlt } = useMemo(() => {
    if (isLoading || !siteBranding) {
        return { logoUrl: '', logoAlt: 'شعار منصة الرحلة' };
    }
    if (currentSection === 'creative-writing') {
        return {
            logoUrl: siteBranding.creativeWritingLogoUrl,
            logoAlt: 'شعار برنامج بداية الرحلة',
        };
    }
    return {
        logoUrl: siteBranding.logoUrl,
        logoAlt: 'شعار منصة إنها لك',
    };
  }, [currentSection, siteBranding, isLoading]);

  const renderLinks = () => {
    const isCreativeWriting = currentSection === 'creative-writing';

    return (
        <>
            <div className="mt-4 md:mt-0">
                <h3 className="font-bold text-gray-800 mb-4">المنصة</h3>
                <ul className="space-y-2">
                    <li><Link to="/about" className="text-gray-600 hover:text-blue-500 transition-colors">عنا</Link></li>
                    <li><Link to="/blog" className="text-gray-600 hover:text-blue-500 transition-colors">المدونة</Link></li>
                    <li><Link to="/support" className="text-gray-600 hover:text-blue-500 transition-colors">الدعم والمساعدة</Link></li>
                </ul>
            </div>
             <div className="mt-4 md:mt-0">
                <h3 className="font-bold text-gray-800 mb-4">أقسامنا</h3>
                 <ul className="space-y-2">
                    {isCreativeWriting ? (
                        <>
                            <li><Link to="/creative-writing/booking" className="text-gray-600 hover:text-blue-500 transition-colors">الباقات والحجز</Link></li>
                            <li><Link to="/enha-lak" className="text-gray-600 hover:text-blue-500 transition-colors">قصص "إنها لك"</Link></li>
                        </>
                    ) : (
                         <>
                            <li><Link to="/enha-lak" className="text-gray-600 hover:text-blue-500 transition-colors">مشروع "إنها لك"</Link></li>
                            <li><Link to="/creative-writing" className="text-gray-600 hover:text-blue-500 transition-colors">برنامج "بداية الرحلة"</Link></li>
                        </>
                    )}
                </ul>
            </div>

            <div className="mt-4 md:mt-0">
                <h3 className="font-bold text-gray-800 mb-4">قانوني</h3>
                <ul className="space-y-2">
                    <li><Link to="/privacy-policy" className="text-gray-600 hover:text-blue-500 transition-colors">سياسة الخصوصية</Link></li>
                    <li><Link to="/terms-of-use" className="text-gray-600 hover:text-blue-500 transition-colors">شروط الاستخدام</Link></li>
                </ul>
            </div>
        </>
    );
  };
  
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-4">
                <Link to="/">
                    {isLoading || !siteBranding ? (
                        <div className="h-16 w-32 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                        <img className="h-16 w-auto" src={logoUrl || ''} alt={logoAlt || 'شعار منصة الرحلة'} loading="lazy" />
                    )}
                </Link>
                <p className="text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} منصة الرحلة. جميع الحقوق محفوظة.
                </p>
                 <div className="flex space-x-4 rtl:space-x-reverse mt-4">
                    {socialLinks.facebook_url && (
                        <a href={socialLinks.facebook_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500">
                            <span className="sr-only">Facebook</span>
                            <Facebook size={20} />
                        </a>
                    )}
                    {socialLinks.twitter_url && (
                        <a href={socialLinks.twitter_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500">
                            <span className="sr-only">Twitter</span>
                            <Twitter size={20} />
                        </a>
                    )}
                    {socialLinks.instagram_url && (
                        <a href={socialLinks.instagram_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500">
                            <span className="sr-only">Instagram</span>
                            <Instagram size={20} />
                        </a>
                    )}
                </div>
            </div>
            {renderLinks()}
        </div>
      </div>
    </footer>
  );
};

export default Footer;