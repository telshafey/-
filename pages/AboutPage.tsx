
import React from 'react';
import { Target, BookHeart, Feather } from 'lucide-react';
import { useProduct } from '../contexts/ProductContext';
import { useAdmin } from '../contexts/AdminContext';
import PageLoader from '../components/ui/PageLoader';
import Section from '../components/ui/Section.tsx';

const AboutPage: React.FC = () => {
  const { loading: brandingLoading } = useProduct();
  const { siteContent, loading: contentLoading } = useAdmin();

  const isLoading = brandingLoading || contentLoading;
  const aboutContent = siteContent.about || {};
  
  if (isLoading) {
      return <PageLoader text="جاري تحميل صفحة عنا..." />;
  }

  return (
    <div className="bg-gray-50 py-16 sm:py-20 animate-fadeIn relative overflow-hidden">
      <div className="absolute top-0 -right-20 w-72 h-72 bg-blue-50 rounded-full opacity-50 filter blur-2xl"></div>
      <div className="absolute bottom-0 -left-20 w-72 h-72 bg-yellow-50 rounded-full opacity-50 filter blur-2xl"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-600">{aboutContent.title}</h1>
            <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-600">{aboutContent.subtitle}</p>
        </div>
        
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg p-8 sm:p-10 mb-20 max-w-5xl mx-auto border border-gray-200">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">{aboutContent.intro_title}</h2>
            <p className="text-gray-700 leading-relaxed text-lg text-center">{aboutContent.intro_text}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-stretch mb-20">
            <Section 
                title={aboutContent.project1_title || ''}
                icon={<BookHeart size={24} />}
                className="!mb-0 border h-full transform hover:-translate-y-2 transition-transform duration-300"
            >
              <p className="text-gray-600 leading-relaxed">{aboutContent.project1_text || ''}</p>
            </Section>
             <Section 
                title={aboutContent.project2_title || ''}
                icon={<Feather size={24} />}
                className="!mb-0 border h-full transform hover:-translate-y-2 transition-transform duration-300"
            >
              <p className="text-gray-600 leading-relaxed">{aboutContent.project2_text || ''}</p>
            </Section>
        </div>

        <div className="max-w-5xl mx-auto text-center">
            <div className="inline-block bg-gradient-to-r from-green-400 to-blue-500 p-1 rounded-full mb-4">
                 <div className="bg-gray-50 rounded-full p-3">
                    <Target size={32} className="text-green-600" />
                 </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-800">{aboutContent.conclusion_title}</h2>
            <p className="mt-4 text-gray-700 leading-relaxed text-lg">{aboutContent.conclusion_text}</p>
        </div>

      </div>
    </div>
  );
};

export default AboutPage;
