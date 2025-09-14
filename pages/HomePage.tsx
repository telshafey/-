
import React from 'react';
// FIX: Switched to namespace import for react-router-dom to fix module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import { Sparkles, Gift, BookHeart, BookOpen, Award, ArrowLeft, ClipboardPen, HeartHandshake, PackageCheck, Star, Quote, Zap, Shield, Globe, Feather, Users, Smile, Rocket, Heart, CalendarPlus } from 'lucide-react';
import { useProduct } from '../contexts/ProductContext';
import { useAdmin } from '../contexts/AdminContext';
import PageLoader from '../components/ui/PageLoader';

const heroContent = {
    title: 'اجعل طفلك بطل قصته التي لا تُنسى',
    subtitle: 'عندما يرى طفلك نفسه بطلاً، فإنه لا يقرأ قصة، بل يعيشها. تجربة سحرية تبني ثقته بنفسه، تعزز هويته، وتغرس فيه القيم النبيلة بأسلوب يلامس قلبه وعقله.',
};

const ProductShowcaseCard: React.FC<{ icon: React.ReactNode, title: string, description: string }> = ({ icon, title, description }) => (
    <div className="flex flex-col bg-white rounded-2xl shadow-lg p-8 transform hover:-translate-y-2 transition-transform duration-300">
      <div className="flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 mb-6">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
      <p className="mt-4 text-gray-600 flex-grow">{description}</p>
    </div>
);

const HowItWorksStep: React.FC<{ icon: React.ReactNode, title: string, description: string }> = ({ icon, title, description }) => (
    <div className="flex flex-col items-center text-center">
        <div className="flex items-center justify-center w-24 h-24 bg-blue-100 rounded-full mb-4">
        {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <p className="mt-2 text-gray-600">{description}</p>
    </div>
);

const TestimonialCard: React.FC<{ quote: string, author: string, role: string }> = ({ quote, author, role }) => (
    <div className="bg-white p-8 rounded-2xl shadow-lg h-full flex flex-col">
        <Quote className="w-10 h-10 text-blue-100 transform rotate-180 mb-2" />
        <div className="flex">
            <Star className="text-yellow-400 me-1" fill="currentColor" />
            <Star className="text-yellow-400 me-1" fill="currentColor" />
            <Star className="text-yellow-400 me-1" fill="currentColor" />
            <Star className="text-yellow-400 me-1" fill="currentColor" />
            <Star className="text-yellow-400 mb-4" fill="currentColor" />
        </div>
        <p className="text-gray-600 italic mb-6 flex-grow">"{quote}"</p>
        <div>
            <p className="font-bold text-gray-800">{author}</p>
            <p className="text-sm text-gray-500">{role}</p>
        </div>
    </div>
);

const FeatureHighlightCard: React.FC<{ icon: React.ReactNode, title: string, description: string }> = ({ icon, title, description }) => (
    <div className="bg-white p-8 rounded-2xl shadow-lg text-center transform hover:-translate-y-2 transition-transform duration-300">
        <div className="flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 text-yellow-600 mb-6 mx-auto">
            {icon}
        </div>
        <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
        <p className="mt-4 text-gray-600">{description}</p>
    </div>
);

const ValuePropCard: React.FC<{ icon: React.ReactNode, title: string, description: string }> = ({ icon, title, description }) => (
    <div className="bg-white p-8 rounded-2xl shadow-lg text-center transform hover:-translate-y-2 transition-transform duration-300">
        <div className="flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 mb-6 mx-auto">
            {icon}
        </div>
        <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
        <p className="mt-4 text-gray-600">{description}</p>
    </div>
);

const HomePage: React.FC = () => {
  const { siteBranding, loading: brandingLoading } = useProduct();
  const { personalizedProducts, loading: productsLoading } = useAdmin();

  const isLoading = brandingLoading || productsLoading;

  const heroSection = () => {
    if (isLoading || !siteBranding) {
      return (
        <section className="relative bg-gray-200 animate-pulse py-20 sm:py-24 lg:py-40">
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="h-12 w-3/4 bg-gray-400/50 rounded-lg mx-auto"></div>
            <div className="mt-6 h-6 w-1/2 bg-gray-400/50 rounded-lg mx-auto"></div>
          </div>
        </section>
      );
    }
    return (
      <section className="relative bg-cover bg-center py-20 sm:py-24 lg:py-40" style={{backgroundImage: `url('${siteBranding.heroImageUrl}')`}}>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">{heroContent.title}</h1>
          <p className="mt-6 max-w-3xl mx-auto text-lg sm:text-xl text-gray-200">
            {heroContent.subtitle}
          </p>
           <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <ReactRouterDOM.Link to="/order/custom_story" className="px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg">
                اطلب قصة الآن
              </ReactRouterDOM.Link>
              <ReactRouterDOM.Link to="/store" className="px-8 py-3 border border-gray-300 text-base font-medium rounded-full text-blue-600 bg-white hover:bg-gray-100 transition-transform transform hover:scale-105 shadow-lg">
                تصفح المنتجات
              </ReactRouterDOM.Link>
          </div>
        </div>
      </section>
    );
  };

  if (isLoading) {
      return <PageLoader />;
  }

  return (
    <div className="animate-fadeIn">
      {/* Hero Section */}
      {heroSection()}
      
      {/* Key Features Section */}
      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800">لماذا قصص "إنها لك"؟</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">نقدم تجربة فريدة تجمع بين الإبداع، التربية، والأصالة.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureHighlightCard 
              icon={<Zap size={32} />}
              title="تخصيص فريد"
              description="نصنع قصصًا يكون فيها طفلك هو البطل، مما يعزز هويته وحبه للقراءة بشكل لا مثيل له."
            />
            <FeatureHighlightCard 
              icon={<Shield size={32} />}
              title="إشراف تربوي"
              description="يتم إعداد كل محتوياتنا بإشراف خبراء تربويين لضمان غرس قيم إيجابية وسليمة."
            />
            <FeatureHighlightCard 
              icon={<Globe size={32} />}
              title="محتوى عربي أصيل"
              description="نلتزم بتقديم محتوى عالي الجودة باللغة العربية، مصمم خصيصًا ليناسب ثقافة وقيم أطفالنا."
            />
          </div>
        </div>
      </section>

      {/* Products Showcase Section */}
      <section id="products-section" className="py-16 sm:py-20 lg:py-24 scroll-mt-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800">كنوزنا الصغيرة المصممة بحب</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">كل منتج هو فرصة جديدة لإسعاد طفلك وتعزيز ارتباطه بالكلمة والصورة.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
             {personalizedProducts.slice(0, 3).map(product => (
                 <ProductShowcaseCard 
                    key={product.key}
                    icon={<Gift size={32}/>}
                    title={product.title}
                    description={product.description}
                 />
             ))}
          </div>
           <div className="mt-12 text-center">
                <ReactRouterDOM.Link to="/store" className="inline-flex items-center font-semibold text-lg text-blue-600 hover:text-blue-800 group">
                    <span>عرض كل المنتجات</span>
                    <ArrowLeft size={22} className="ms-2 transition-transform group-hover:-translate-x-1 rtl:group-hover:translate-x-1" />
                </ReactRouterDOM.Link>
           </div>
        </div>
      </section>
      
      {/* How it works section */}
      <section className="bg-white py-16 sm:py-20 lg:py-24">
          <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800">كيف نصنع السعادة؟</h2>
                  <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">ثلاث خطوات بسيطة لتحويل طفلك إلى بطل قصته.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start relative">
                  <div className="hidden md:block absolute top-12 left-0 right-0 w-full h-1" style={{zIndex: 0}}>
                      <svg width="100%" height="4" viewBox="0 0 100 4" preserveAspectRatio="none">
                          <line x1="16.66%" y1="2" x2="83.33%" y2="2" stroke="#a0baf2" strokeWidth="3" strokeDasharray="8 8"/>
                      </svg>
                  </div>

                  <div className="z-10 bg-gray-50 p-6 rounded-2xl shadow-lg transform hover:-translate-y-1 transition-transform duration-300">
                      <HowItWorksStep
                          icon={<ClipboardPen size={48} className="text-blue-600"/>}
                          title="1. اطلب وخصص"
                          description="اختر منتجاتك واملأ بيانات طفلك وارفع صوره عبر نموذج الطلب السهل."
                      />
                  </div>
                   <div className="z-10 bg-gray-50 p-6 rounded-2xl shadow-lg transform hover:-translate-y-1 transition-transform duration-300">
                      <HowItWorksStep
                          icon={<HeartHandshake size={48} className="text-pink-500"/>}
                          title="2. نصنع بحب"
                          description="يقوم فريقنا من الكتاب والرسامين بصياغة ورسم قصة فريدة خصيصًا لطفلك."
                      />
                  </div>
                   <div className="z-10 bg-gray-50 p-6 rounded-2xl shadow-lg transform hover:-translate-y-1 transition-transform duration-300">
                      <HowItWorksStep
                          icon={<PackageCheck size={48} className="text-green-500"/>}
                          title="3. استلم تحفتك"
                          description="خلال أيام، تصلك قصة طفلك المخصصة، جاهزة لإشعال خياله."
                      />
                  </div>
              </div>
          </div>
      </section>
      
      {/* Subscription Box CTA Section */}
      <section className="bg-gradient-to-br from-yellow-50 via-white to-orange-50 py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4">
            <div className="text-center">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800">جديدنا! <span className="text-orange-500">صندوق الرحلة الشهري</span></h2>
                <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-600">
                    استمر في إلهام طفلك كل شهر! اشترك الآن ليصلكم صندوق مليء بالقصص والأنشطة الإبداعية المصممة خصيصًا لطفلك، لرحلة من التعلم والمرح لا تتوقف.
                </p>
                <div className="mt-10">
                <ReactRouterDOM.Link to="/subscription" className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-lg font-medium rounded-full text-white bg-orange-500 hover:bg-orange-600 transition-transform transform hover:scale-105 shadow-lg">
                    <CalendarPlus className="me-3" />
                    اكتشف الاشتراك الشهري
                </ReactRouterDOM.Link>
                </div>
            </div>
        </div>
      </section>

      {/* Value Props Section */}
      <section className="bg-gray-50 py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800">لمن هذه القصة؟</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">قصصنا مصممة لتلبية احتياجات متنوعة، وتقديم حلول تربوية مبتكرة.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ValuePropCard 
              icon={<Smile size={32} />}
              title="لتعزيز الهوية"
              description="للطفل الذي يحتاج لرؤية نفسه بطلاً، مما يبني ثقته بنفسه ويعزز صورته الذاتية الإيجابية."
            />
             <ValuePropCard 
              icon={<Rocket size={32} />}
              title="لتنمية الخيال"
              description="للطفل المبدع الذي يحب المغامرات، قصصنا تفتح له آفاقًا جديدة من الخيال والابتكار."
            />
             <ValuePropCard 
              icon={<Heart size={32} />}
              title="لغرس القيم"
              description="للطفل الذي يتعلم مفاهيم جديدة، نقدم القيم التربوية في سياق قصصي محبب ومؤثر."
            />
             <ValuePropCard 
              icon={<Gift size={32} />}
              title="كهدية لا تُنسى"
              description="للباحثين عن هدية فريدة وشخصية تترك أثراً دائماً في ذاكرة الطفل وعائلته."
            />
          </div>
        </div>
      </section>


      {/* Creative Writing Program CTA Section */}
      <section className="bg-gradient-to-br from-purple-50 via-white to-blue-50 py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-right">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800">أكثر من مجرد قصص... نحن نصنع الكتّاب</h2>
                <p className="mt-4 max-w-2xl mx-auto lg:mx-0 text-lg text-gray-600">
                انضم إلى برنامج "بداية الرحلة" للكتابة الإبداعية، وصقل موهبة طفلك في بيئة رقمية آمنة وملهمة بإشراف مدربين متخصصين.
                </p>
                <div className="mt-8 space-y-4 text-gray-700">
                <div className="flex items-center justify-center lg:justify-start gap-3">
                    <Feather className="w-8 h-8 text-purple-500" />
                    <span className="font-semibold text-lg">جلسات فردية مباشرة وتفاعلية</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-3">
                    <Users className="w-8 h-8 text-blue-500" />
                    <span className="font-semibold text-lg">مناهج معتمدة لتطوير الموهبة</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-3">
                    <Shield className="w-8 h-8 text-green-500" />
                    <span className="font-semibold text-lg">بيئة آمنة ومحفزة للإبداع</span>
                </div>
                </div>
                <div className="mt-10">
                <ReactRouterDOM.Link to="/creative-writing" className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-lg font-medium rounded-full text-white bg-purple-600 hover:bg-purple-700 transition-transform transform hover:scale-105 shadow-lg">
                    اعرف المزيد عن البرنامج
                </ReactRouterDOM.Link>
                </div>
            </div>
            <div className="hidden lg:block px-8">
                <img src="https://i.ibb.co/Xz9d9J2/creative-writing-promo.jpg" alt="طفل يكتب بسعادة" className="rounded-2xl shadow-2xl" loading="lazy" />
            </div>
            </div>
        </div>
      </section>
      
        {/* Testimonials section */}
      <section className="bg-white py-16 sm:py-20 lg:py-24">
          <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800">ماذا يقول عملاؤنا؟</h2>
                  <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">آراء نفخر بها من عائلة "إنها لك".</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <TestimonialCard
                      quote="قصة 'إنها لك' كانت أفضل هدية لابنتي. رؤية فرحتها وهي ترى نفسها بطلة الحكاية لا تقدر بثمن. شكرًا لكم على هذا الإبداع."
                      author="فاطمة علي"
                      role="ولية أمر"
                  />
                  <TestimonialCard
                      quote="الجودة والاهتمام بالتفاصيل في المنتجات المطبوعة فاقت توقعاتي. تجربة رائعة من الطلب حتى الاستلام. ابني يطلب قراءة قصته كل ليلة."
                      author="أحمد محمود"
                      role="ولي أمر"
                  />
                  <TestimonialCard
                      quote="فكرة رائعة ومحتوى تربوي هادف. القصة لم تكن مجرد تسلية، بل ساعدت ابني على فهم قيمة الصدق بشكل أفضل."
                      author="سارة إبراهيم"
                      role="ولية أمر"
                  />
              </div>
          </div>
      </section>

       {/* Final CTA */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800">هل أنت جاهز لبدء الرحلة؟</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">اختر المنتج الذي يناسب طفلك اليوم وافتح له بابًا جديدًا من الخيال والمعرفة.</p>
          <div className="mt-8">
            <ReactRouterDOM.Link to="/order/custom_story" className="inline-flex items-center justify-center px-10 py-4 border border-transparent text-lg font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg">
                اطلب منتجك المخصص الآن
            </ReactRouterDOM.Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;