import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Book, Users, Award, ArrowLeft, Calendar } from 'lucide-react';

const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; id?: string; }> = ({ title, icon, children, id }) => (
  <div id={id} className="bg-white p-8 rounded-2xl shadow-lg mb-12 scroll-mt-24">
    <div className="flex items-center mb-6">
      <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-blue-100 rounded-full text-blue-600">
        {icon}
      </div>
      <h2 className="text-3xl font-bold text-gray-800 ms-4">{title}</h2>
    </div>
    <div className="text-gray-600 leading-relaxed text-lg">
        {children}
    </div>
  </div>
);

const FeatureCard: React.FC<{ title: string; description: string; link: string; icon: React.ReactNode; }> = ({ title, description, link, icon }) => (
    <div className="bg-white p-8 rounded-2xl shadow-lg text-center transform hover:-translate-y-2 transition-transform duration-300 h-full flex flex-col">
        <div className="flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 mb-6 mx-auto">
            {icon}
        </div>
        <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
        <p className="mt-4 text-gray-600 flex-grow">{description}</p>
        <Link to={link} className="mt-6 inline-flex items-center font-semibold text-lg text-blue-600 hover:text-blue-800 group">
            <span>اعرف المزيد</span>
            <ArrowLeft size={22} className="ms-2 transition-transform group-hover:-translate-x-1 rtl:group-hover:translate-x-1" />
        </Link>
    </div>
);


const CreativeWritingPage: React.FC = () => {
  return (
    <div className="bg-gray-50 animate-fadeIn">
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-16 sm:py-20 lg:py-24 text-center">
        <div className="container mx-auto px-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-800 leading-tight">
                برنامج "بداية الرحلة": <span className="text-blue-600">أطلق العنان للكاتب المبدع</span> في طفلك
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-lg sm:text-xl text-gray-600">
                برنامج متكامل عبر الإنترنت لتنمية مهارات الكتابة الإبداعية للأطفال والشباب من 9 إلى 20 سنة، في بيئة آمنة ومحفزة بإشراف مدربين متخصصين.
            </p>
            <div className="mt-10">
                <Link 
                    to="/creative-writing/booking"
                    className="px-8 py-3 border border-transparent text-lg font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg">
                    اكتشف الباقات وابدأ الآن
                </Link>
            </div>
        </div>
      </section>

      <div className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Section title="رسالة البرنامج" icon={<Target size={24} />}>
                <p>
                    في زمن يزداد فيه التركيز على التحصيل والنتائج، يقدم البرنامج مساحة آمنة للأطفال ليعبّروا عن أنفسهم من خلال الكتابة دون الحاجة للمحاكمة أو التقييد بالمعايير الأكاديمية التقليدية. يركز البرنامج على تعريف الطفل بالكتابة كأداة للتعبير الذاتي وليس فقط كمهارة مدرسية.
                </p>
            </Section>

            <section className="py-16 sm:py-20">
                 <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800">استكشف رحلتنا الإبداعية</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">تعمق في تفاصيل برنامجنا المصمم بعناية لصقل موهبة طفلك.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard
                        title="عن البرنامج"
                        description="اكتشف رؤيتنا وأهدافنا التعليمية والتربوية التي تشكل أساس برنامجنا."
                        link="/creative-writing/about"
                        icon={<Target size={32} />}
                    />
                     <FeatureCard
                        title="المنهج الدراسي"
                        description="تعرف على المراحل التعليمية والمخرجات التي سيحصل عليها طفلك في نهاية الرحلة."
                        link="/creative-writing/curriculum"
                        icon={<Book size={32} />}
                    />
                     <FeatureCard
                        title="المدربون"
                        description="قابل فريقنا من المدربين المتخصصين والمستعدين لإلهام وتوجيه طفلك."
                        link="/creative-writing/instructors"
                        icon={<Users size={32} />}
                    />
                </div>
            </section>

            <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800">هل أنت جاهز لبدء الرحلة؟</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">اختر الباقة التي تناسب طفلك اليوم وافتح له بابًا جديدًا من الإبداع والتعبير.</p>
                    <div className="mt-8">
                        <Link to="/creative-writing/booking" className="inline-flex items-center justify-center px-10 py-4 border border-transparent text-lg font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg">
                            <Calendar className="me-3" size={22}/>
                            عرض الباقات وحجز موعد
                        </Link>
                    </div>
                </div>
            </section>
            
        </div>
      </div>
    </div>
  );
};

export default CreativeWritingPage;