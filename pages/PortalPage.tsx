

import React from 'react';
// FIX: Replaced the 'react-router-dom' namespace import with a named import for 'Link' to resolve component resolution errors.
import { Link } from 'react-router-dom';
import { BookOpen, Feather } from 'lucide-react';
import { useProduct } from '../contexts/ProductContext';
import PageLoader from '../components/ui/PageLoader';

const PortalCard: React.FC<{
  title: string;
  description: string;
  link: string;
  imageUrl: string | null;
  Icon: React.ElementType;
  buttonText: string;
  colorClasses: string;
}> = ({ title, description, link, imageUrl, Icon, buttonText, colorClasses }) => (
    <div 
        className="relative w-full h-full flex flex-col items-center justify-center text-center p-8 transition-all duration-500 ease-in-out bg-cover bg-center group"
        style={{ backgroundImage: imageUrl ? `url(${imageUrl})` : 'none' }}
    >
        <div className={`absolute inset-0 bg-black/50 transition-all duration-500 group-hover:bg-black/70 ${colorClasses}`}></div>
        <div className="relative z-10 flex flex-col items-center justify-center text-white transform group-hover:scale-105 transition-transform duration-500">
            <div className="mb-6 border-4 border-white/50 rounded-full p-4">
                <Icon size={48} />
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold">{title}</h2>
            <p className="mt-4 max-w-sm text-lg text-white/90">
                {description}
            </p>
            <Link 
                to={link}
                className="mt-8 px-10 py-4 border-2 border-white text-lg font-bold rounded-full bg-white/10 backdrop-blur-sm hover:bg-white hover:text-gray-900 transition-all duration-300"
            >
                {buttonText}
            </Link>
        </div>
    </div>
);

const PortalPage: React.FC = () => {
    const { siteBranding, loading } = useProduct();

    if (loading || !siteBranding) {
        return <PageLoader text="جاري تجهيز بوابتك الإبداعية..."/>;
    }

    return (
        <div className="w-screen h-screen flex flex-col md:flex-row animate-fadeIn">
            <PortalCard 
                title='مشروع "إنها لك"'
                description="نصنع بحب وشغف قصصاً مخصصة تجعل من طفلك بطل حكايته الخاصة، لتعزيز هويته وغرس أسمى القيم."
                link="/enha-lak"
                imageUrl={siteBranding.heroImageUrl}
                Icon={BookOpen}
                buttonText="ادخل إلى عالم القصص"
                colorClasses="bg-gradient-to-tr from-blue-500/30 to-teal-500/30"
            />
            <PortalCard 
                title='برنامج "بداية الرحلة"'
                description="برنامج متكامل لتنمية مهارات الكتابة الإبداعية لدى الأطفال والشباب في بيئة آمنة وملهمة."
                link="/creative-writing"
                imageUrl="https://i.ibb.co/Xz9d9J2/creative-writing-promo.jpg"
                Icon={Feather}
                buttonText="استكشف البرنامج"
                colorClasses="bg-gradient-to-tr from-purple-500/30 to-indigo-500/30"
            />
        </div>
    );
};

export default PortalPage;
