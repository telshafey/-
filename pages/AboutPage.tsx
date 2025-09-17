import React, { useState } from 'react';
import { Target, BookHeart, Feather, Heart, Rocket, Shield, UserCheck, Award } from 'lucide-react';
// FIX: Added .tsx extension to useProduct import to resolve module error.
import { useProduct } from '../contexts/ProductContext.tsx';
// FIX: Added .tsx extension to the import of AdminContext to resolve module loading error.
import { useAdmin } from '../contexts/AdminContext.tsx';
// FIX: Added .tsx extension to PageLoader import to resolve module error.
import PageLoader from '../components/ui/PageLoader.tsx';

const AboutPage: React.FC = () => {
  const { siteBranding, loading: brandingLoading } = useProduct();
  const { siteContent, loading: contentLoading } = useAdmin();
  const [imageLoaded, setImageLoaded] = useState(false);

  const isLoading = brandingLoading || contentLoading;
  const aboutContent = siteContent.about || {};
  
  if (isLoading || !siteBranding) {
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20 max-w-6xl mx-auto">
            <div className="relative order-last lg:order-first">
                {!imageLoaded && <div className="absolute inset-0 bg-gray-200 rounded-2xl animate-pulse"></div>}
                <img 
                    src={siteBranding.aboutImageUrl || ''} 
                    alt="طفلة تقرأ وتتعلم بشغف" 
                    className={`rounded-2xl shadow-2xl transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    loading="lazy"
                    onLoad={() => setImageLoaded(true)}
                />
            </div>
             <div className="p-8 bg-white rounded-2xl shadow-lg border border-gray-200">
                <div className="space-y-8">
                    {/* ENHA LAK Section */}
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-3 flex items-center gap-3">
                            <BookHeart className="text-blue-500" /> {aboutContent.project1_title || ''}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">{aboutContent.project1_text || ''}</p>
                        
                        <div className="mt-6">
                            <h4 className="font-bold text-lg text-gray-700">رسالتنا: أكثر من مجرد قصة</h4>
                            <ul className="space-y-3 mt-3 text-gray-600">
                                <li className="flex items-start">
                                    <Heart className="w-5 h-5 text-pink-500 me-3 mt-1 flex-shrink-0" />
                                    <span><span className="font-semibold text-gray-800">تعزيز الهوية:</span> نحول الطفل من قارئ إلى بطل، مما يعزز صورته الذاتية الإيجابية.</span>
                                </li>
                                <li className="flex items-start">
                                    <Rocket className="w-5 h-5 text-orange-500 me-3 mt-1 flex-shrink-0" />
                                    <span><span className="font-semibold text-gray-800">بناء الثقة بالنفس:</span> رؤية نفسه ناجحًا في القصة يمنحه الشجاعة لمواجهة تحديات الواقع.</span>
                                </li>
                                <li className="flex items-start">
                                    <Shield className="w-5 h-5 text-green-500 me-3 mt-1 flex-shrink-0" />
                                    <span><span className="font-semibold text-gray-800">غرس القيم:</span> نقدم المفاهيم التربوية في سياق قصصي محبب ومؤثر يتقبله الطفل بسهولة.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <hr className="border-gray-200" />
                    {/* BIDAYAT ALREHLA Section */}
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-3 flex items-center gap-3">
                            <Feather className="text-purple-500" /> {aboutContent.project2_title || ''}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">{aboutContent.project2_text || ''}</p>
                        
                        <div className="mt-6">
                            <h4 className="font-bold text-lg text-gray-700">منهجيتنا: الإلهام قبل القواعد</h4>
                            <ul className="space-y-3 mt-3 text-gray-600">
                                <li className="flex items-start">
                                    <UserCheck className="w-5 h-5 text-indigo-500 me-3 mt-1 flex-shrink-0" />
                                    <span><span className="font-semibold text-gray-800">جلسات فردية مباشرة:</span> تركيز كامل على صوت الطفل واحتياجاته الإبداعية الفريدة.</span>
                                </li>
                                <li className="flex items-start">
                                    <Shield className="w-5 h-5 text-teal-500 me-3 mt-1 flex-shrink-0" />
                                    <span><span className="font-semibold text-gray-800">بيئة آمنة وداعمة:</span> مساحة خالية من النقد، تشجع على التجربة والخطأ كجزء من عملية التعلم.</span>
                                </li>
                                <li className="flex items-start">
                                    <Award className="w-5 h-5 text-yellow-500 me-3 mt-1 flex-shrink-0" />
                                    <span><span className="font-semibold text-gray-800">مخرجات ملموسة:</span> ينهي الطالب البرنامج بمحفظة أعمال رقمية وشهادة إتمام، مما يمنحه شعورًا بالإنجاز.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
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
