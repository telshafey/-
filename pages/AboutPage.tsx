import React from 'react';
import { Target, BookHeart, Eye, Loader2 } from 'lucide-react';
import { useProduct } from '../contexts/ProductContext';
import { useAdmin } from '../contexts/AdminContext';
import PageLoader from '../components/ui/PageLoader';

const TextSkeleton: React.FC<{className?: string}> = ({ className = 'h-5 bg-gray-200 rounded w-full' }) => (
    <div className={`animate-pulse ${className}`}></div>
);

const AboutPage: React.FC = () => {
  const { siteBranding, loading: brandingLoading } = useProduct();
  const { siteContent, loading: contentLoading } = useAdmin();

  const isLoading = brandingLoading || contentLoading;
  const aboutContent = siteContent.about || {};
  const goalsList = aboutContent.goals?.split('\n') || [];

  if (isLoading) {
      return <PageLoader text="جاري تحميل صفحة عنا..." />;
  }

  return (
    <div className="bg-white py-16 sm:py-20 animate-fadeIn relative overflow-hidden">
      <div className="absolute top-0 -right-20 w-72 h-72 bg-blue-50 rounded-full opacity-50 filter blur-2xl"></div>
      <div className="absolute bottom-0 -left-20 w-72 h-72 bg-yellow-50 rounded-full opacity-50 filter blur-2xl"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-600">{aboutContent.title}</h1>
            <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-600">{aboutContent.subtitle}</p>
        </div>
        
        <div className="bg-gray-50/50 rounded-2xl shadow-lg p-8 sm:p-10 mb-20 max-w-5xl mx-auto border border-gray-200">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">{aboutContent.intro_title}</h2>
            <p className="text-gray-700 leading-relaxed text-lg text-justify">{aboutContent.intro_text}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            {!siteBranding ? (
              <div className="rounded-2xl shadow-xl w-full aspect-[4/3] bg-gray-200 animate-pulse flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-gray-400 animate-spin" />
              </div>
            ) : (
               <img 
                src={siteBranding.aboutImageUrl}
                alt="أطفال يتعاونون في القراءة والكتابة" 
                className="rounded-2xl shadow-xl w-full"
              />
            )}
          </div>
          <div className="space-y-8">
            <div className="flex items-start space-x-4 rtl:space-x-reverse">
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-yellow-100 rounded-full text-yellow-600">
                <Eye size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{aboutContent.vision_title}</h2>
                <p className="mt-2 text-gray-600">{aboutContent.vision_text}</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 rtl:space-x-reverse">
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-green-100 rounded-full text-green-600">
                <Target size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{aboutContent.mission_title}</h2>
                <p className="mt-2 text-gray-600">{aboutContent.mission_text}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 rtl:space-x-reverse">
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-blue-100 rounded-full text-blue-600">
                <BookHeart size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{aboutContent.goals_title}</h2>
                <ul className="mt-2 text-gray-600 list-disc list-inside space-y-1">
                    {goalsList.map((goal, index) => goal && <li key={index}>{goal}</li>)}
                </ul>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;