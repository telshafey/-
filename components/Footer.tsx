


import React, { useMemo } from 'react';
// FIX: Replaced named imports with a namespace import for 'react-router-dom' to resolve module resolution errors.
import * as ReactRouterDOM from 'react-router-dom';
import { Facebook, Twitter, Instagram } from 'lucide-react';
import { useProduct } from '../contexts/ProductContext';
import { useAdmin } from '../contexts/AdminContext';


const Footer: React.FC = () => {
  const { siteBranding, loading: brandingLoading } = useProduct();
  const { socialLinks, loading: adminLoading } = useAdmin();
  const location = ReactRouterDOM.useLocation();

  const isLoading = brandingLoading || adminLoading;

  const getCurrentSection = (pathname: string) => {
    if (pathname.startsWith('/creative-writing') || pathname.startsWith('/instructor') || pathname.startsWith('/session')) {
        return 'creative-writing';
    }
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
    return (
        <>
            <div className="mt-4 md:mt-0">
                <h3 className="font-bold text-gray-800 mb-4">المنصة</h3>
                <ul className="space-y-2">
                    <li><ReactRouterDOM.Link to="/about" className="text-gray-600 hover:text-blue-500 transition-colors">عنا</ReactRouterDOM.Link></li>
                    <li><ReactRouterDOM.Link to="/blog" className="text-gray-600 hover:text-blue-500 transition-colors">المدونة</ReactRouterDOM.Link></li>
                    <li><ReactRouterDOM.Link to="/support" className="text-gray-600 hover:text-blue-500 transition-colors">الدعم والمساعدة</ReactRouterDOM.Link></li>
                </ul>
            </div>
             <div className="mt-4 md:mt-0">
                <h3 className="font-bold text-gray-800 mb-4">أقسامنا</h3>
                 <ul className="space-y-2">
                    {currentSection === 'enha-lak' ? (
                        <>
                            <li><ReactRouterDOM.Link to="/store" className="text-gray-600 hover:text-blue-500 transition-colors">متجر "إنها لك"</ReactRouterDOM.Link></li>
                            <li><ReactRouterDOM.Link to="/creative-writing" className="text-gray-600 hover:text-blue-500 transition-colors">برنامج "بداية الرحلة"</ReactRouterDOM.Link></li>
                        </>
                    ) : (
                         <>
                            <li><ReactRouterDOM.Link to="/creative-writing/booking" className="text-gray-600 hover:text-blue-500 transition-colors">الباقات والحجز</ReactRouterDOM.Link></li>
                            <li><ReactRouterDOM.Link to="/enha-lak" className="text-gray-600 hover:text-blue-500 transition-colors">قصص "إنها لك"</ReactRouterDOM.Link></li>
                        </>
                    )}
                </ul>
            </div>

            <div className="mt-4 md:mt-0">
                <h3 className="font-bold text-gray-800 mb-4">قانوني</h3>
                <ul className="space-y-2">
                    <li><ReactRouterDOM.Link to="/privacy-policy" className="text-gray-600 hover:text-blue-500 transition-colors">سياسة الخصوصية</ReactRouterDOM.Link></li>
                    <li><ReactRouterDOM.Link to="/terms-of-use" className="text-gray-600 hover:text-blue-500 transition-colors">شروط الاستخدام</ReactRouterDOM.Link></li>
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
                <ReactRouterDOM.Link to="/">
                    {isLoading || !siteBranding ? (
                        <div className="h-16 w-32 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                        <img className="h-16 w-auto" src={logoUrl || ''} alt={logoAlt || 'شعار منصة الرحلة'} loading="lazy" />
                    )}
                </ReactRouterDOM.Link>
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