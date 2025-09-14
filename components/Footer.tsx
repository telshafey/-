import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Loader2 } from 'lucide-react';
import { useProduct } from '../contexts/ProductContext';
import { useAdmin } from '../contexts/AdminContext';


const Footer: React.FC = () => {
  const { siteBranding, loading: brandingLoading } = useProduct();
  const { socialLinks, loading: adminLoading } = useAdmin();

  const isLoading = brandingLoading || adminLoading;
  
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-4">
                <Link to="/">
                    {isLoading || !siteBranding ? (
                        <div className="h-16 w-32 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                        <img className="h-16 w-auto" src={siteBranding.logoUrl} alt="شعار منصة إنها لك" />
                    )}
                </Link>
                <p className="text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} منصة إنها لك. جميع الحقوق محفوظة.
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

            <div className="mt-4 md:mt-0">
                <h3 className="font-bold text-gray-800 mb-4">المنصة</h3>
                <ul className="space-y-2">
                    <li><Link to="/enha-lak" className="text-gray-600 hover:text-blue-500 transition-colors">قصص "إنها لك"</Link></li>
                    <li><Link to="/creative-writing" className="text-gray-600 hover:text-blue-500 transition-colors">الكتابة الإبداعية</Link></li>
                    <li><Link to="/about" className="text-gray-600 hover:text-blue-500 transition-colors">عنا</Link></li>
                    <li><Link to="/privacy-policy" className="text-gray-600 hover:text-blue-500 transition-colors">سياسة الخصوصية والاستخدام</Link></li>
                </ul>
            </div>

            <div className="mt-4 md:mt-0">
                <h3 className="font-bold text-gray-800 mb-4">منتجاتنا</h3>
                <ul className="space-y-2">
                    <li><Link to="/store" className="text-gray-600 hover:text-blue-500 transition-colors">المتجر</Link></li>
                </ul>
            </div>
            
            <div className="mt-4 md:mt-0">
                <h3 className="font-bold text-gray-800 mb-4">تواصل معنا</h3>
                <ul className="space-y-2">
                    <li><Link to="/support" className="text-gray-600 hover:text-blue-500 transition-colors">الدعم والمساعدة</Link></li>
                    <li><Link to="/join-us" className="text-gray-600 hover:text-blue-500 transition-colors">انضم لفريقنا</Link></li>
                </ul>
            </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;